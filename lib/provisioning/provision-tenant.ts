import Medusa from '@medusajs/js-sdk';
import { prisma } from '@/lib/db';
import { encryptSecret } from '@/lib/crypto';

type Result = { ok: true; state: 'READY' } | { ok: false; error: string };

export async function provisionTenant(tenantId: string): Promise<Result> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true, cms: true },
  });
  if (!tenant) return { ok: false, error: 'tenant not found' };
  if (tenant.siteType === 'COMMERCE') return provisionMedusa(tenant.id, tenant.name);
  return { ok: true, state: 'READY' };
}

async function provisionMedusa(tenantId: string, tenantName: string): Promise<Result> {
  const MEDUSA_URL = process.env.MEDUSA_URL;
  const MEDUSA_ADMIN_KEY = process.env.MEDUSA_ADMIN_KEY;
  const MEDUSA_REGION_ID = process.env.MEDUSA_REGION_ID;
  if (!MEDUSA_URL || !MEDUSA_ADMIN_KEY) {
    return fail(tenantId, 'MEDUSA_URL or MEDUSA_ADMIN_KEY missing');
  }
  if (!MEDUSA_REGION_ID) return fail(tenantId, 'MEDUSA_REGION_ID missing');

  const claimed = await prisma.medusaBinding.updateMany({
    where: { tenantId, provisioningState: { in: ['PENDING', 'FAILED'] } },
    data: { provisioningState: 'PROVISIONING', lastError: null, lastErrorAt: null },
  });
  if (claimed.count === 0) {
    const current = await prisma.medusaBinding.findUnique({ where: { tenantId } });
    if (current?.provisioningState === 'READY') return { ok: true, state: 'READY' };
    return { ok: false, error: `Already ${current?.provisioningState ?? 'unknown'}` };
  }

  try {
    const sdk = new Medusa({ baseUrl: MEDUSA_URL, apiKey: MEDUSA_ADMIN_KEY });

    // ----------------------------------------------------------------------
    // 1. Sales channel (idempotent)
    // ----------------------------------------------------------------------
    const channelName = `tenant-${tenantId}`;
    let channel = (await sdk.admin.salesChannel.list({ q: channelName } as any))
      .sales_channels.find((c: any) => c.name === channelName);
    if (!channel) {
      const created = await sdk.admin.salesChannel.create({
        name: channelName,
        description: tenantName,
      } as any);
      channel = created.sales_channel;
    }

    // ----------------------------------------------------------------------
    // 2. Publishable API key (idempotent)
    // ----------------------------------------------------------------------
    const keyTitle = `tenant-${tenantId}-pk`;
    let apiKey = (await sdk.admin.apiKey.list({ q: keyTitle, type: 'publishable' } as any))
      .api_keys.find((k: any) => k.title === keyTitle);
    if (!apiKey) {
      const created = await sdk.admin.apiKey.create({
        title: keyTitle,
        type: 'publishable',
      } as any);
      apiKey = created.api_key;
      await (sdk.admin.apiKey as any).batchSalesChannels(apiKey.id, {
        add: [channel.id],
      });
    }
    const token = (apiKey as any).token;
    if (!token) throw new Error('Medusa did not return publishable key token');

    // ----------------------------------------------------------------------
    // 3. Stock Location (idempotent)
    // ----------------------------------------------------------------------
    const locationName = `tenant-${tenantId}`;
    const existingLoc = (await sdk.admin.stockLocation.list({ q: locationName } as any))
      .stock_locations.find((l: any) => l.name === locationName);
    let location = existingLoc;

    if (!location) {
      const createdLoc = await sdk.admin.stockLocation.create({
        name: locationName,
        address: {
          address_1: 'Default location',
          city: 'Default',
          country_code: 'us',
        },
      } as any);
      location = createdLoc.stock_location;
    }

    // Link the stock location to the sales channel (idempotent — re-run is safe)
    try {
      await sdk.admin.salesChannel.update(channel.id, {
        locations: [{ id: location.id }],
      } as any);
    } catch (e: any) {
      // Some Medusa versions treat "already linked" as an error — ignore.
      const msg = String(e?.message ?? '');
      if (!msg.includes('already')) {
        console.warn('Sales channel → location link warning:', msg);
      }
    }

    // Enable the `manual` fulfillment provider on the location (idempotent).
    try {
      await sdk.admin.stockLocation.updateFulfillmentProviders(location.id, {
        add: ['manual'],
      } as any);
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      if (!msg.includes('already')) {
        console.warn('Fulfillment provider link warning:', msg);
      }
    }

    // Resolve the tenant's default shipping profile
    const profiles = await sdk.admin.shippingProfile.list({ limit: 50 });
    const defaultProfile =
      profiles.shipping_profiles.find((p: any) => p.type === 'default') ??
      profiles.shipping_profiles[0];
    if (!defaultProfile) throw new Error('No shipping profile available');

    // Resolve the fulfillment set for the tenant's stock location
    const loc = await sdk.admin.stockLocation.retrieve(binding.locationId, {
      fields: '*fulfillment_sets,*fulfillment_sets.service_zones',
    });
    const fulfillmentSet = loc.stock_location.fulfillment_sets?.[0];
    const serviceZone = fulfillmentSet?.service_zones?.[0];
    if (!serviceZone) throw new Error('No service zone for stock location');

    await prisma.medusaBinding.update({
      where: { tenantId },
      data: {
        shippingProfileId: defaultProfile.id,
        serviceZoneId: serviceZone.id,
      },
    });

    // ----------------------------------------------------------------------
    // 4. Save the binding (including locationId)
    // ----------------------------------------------------------------------
    await prisma.medusaBinding.update({
      where: { tenantId },
      data: {
        backendUrl: MEDUSA_URL,
        publishableKey: token,
        salesChannelId: channel.id,
        regionId: MEDUSA_REGION_ID,
        adminApiKey: encryptSecret(MEDUSA_ADMIN_KEY),
        locationId: location.id,
        provisioningState: 'READY',
        provisionedAt: new Date(),
        lastError: null,
        lastErrorAt: null,
      },
    });
    return { ok: true, state: 'READY' };
  } catch (e: any) {
    const msg = e?.message ? String(e.message) : String(e);
    await prisma.medusaBinding.update({
      where: { tenantId },
      data: { provisioningState: 'FAILED', lastError: msg.slice(0, 1000), lastErrorAt: new Date() },
    });
    return { ok: false, error: msg };
  }
}

async function fail(tenantId: string, msg: string): Promise<Result> {
  await prisma.medusaBinding.upsert({
    where: { tenantId },
    update: { provisioningState: 'FAILED', lastError: msg, lastErrorAt: new Date() },
    create: { tenantId, provisioningState: 'FAILED', lastError: msg, lastErrorAt: new Date() },
  });
  return { ok: false, error: msg };
}