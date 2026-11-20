import { prisma } from '@/lib/db';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export type TenantShippingContext = {
  tenantId: string;
  sdk: any;
  binding: {
    backendUrl: string;
    salesChannelId: string;
    regionId: string | null;
    locationId: string | null;
    shippingProfileId: string | null;
    serviceZoneId: string | null;
  };
  countryCode: string | null;
  currencyCode: string | null;
};

// ---------------------------------------------------------------------------
// Helpers — raw REST via sdk.client.fetch so we don't depend on SDK method
// names that differ across Medusa v2 point releases.
// ---------------------------------------------------------------------------

async function createFulfillmentSet(sdk: any, tenantId: string): Promise<any> {
  const body = { name: `Tenant ${tenantId}`, type: 'shipping' };
  console.log('[createFulfillmentSet] sending body:', JSON.stringify(body));
  const res = await sdk.client.fetch('/admin/fulfillment-sets', {
    method: 'POST',
    body,
  });
  console.log('[createFulfillmentSet] response:', JSON.stringify(res));
  return res.fulfillment_set;
}

async function attachFulfillmentSet(
  sdk: any,
  locationId: string,
  fulfillmentSetId: string,
): Promise<void> {
  await sdk.client.fetch(`/admin/stock-locations/${locationId}`, {
    method: 'POST',
    body: { fulfillment_sets: [{ id: fulfillmentSetId }] },
  });
}

async function createServiceZone(
  sdk: any,
  fulfillmentSetId: string,
  countryCode: string,
): Promise<any> {
  const res = await sdk.client.fetch(
    `/admin/fulfillment-sets/${fulfillmentSetId}/service-zones`,
    {
      method: 'POST',
      body: {
        name: `${countryCode.toUpperCase()} zone`,
        geo_zones: [{ type: 'country', country_code: countryCode }],
      },
    },
  );
  return res.service_zone;
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

export async function resolveTenantShippingContext(
  tenantId: string,
): Promise<TenantShippingContext> {
  const { sdk, binding } = await getMedusaAdminClient(tenantId);

  // 1. Resolve country + currency first — later blocks depend on countryCode.
  let countryCode: string | null = null;
  let currencyCode: string | null = null;
  if (binding.regionId) {
    const { region } = await sdk.admin.region.retrieve(binding.regionId, {
      fields: '*countries',
    });
    countryCode = region?.countries?.[0]?.iso_2?.toLowerCase() ?? null;
    currencyCode = region?.currency_code?.toLowerCase() ?? null;
  }

  // 2. Lazily resolve (and persist) shippingProfileId / serviceZoneId.
  let shippingProfileId = binding.shippingProfileId ?? null;
  let serviceZoneId = binding.serviceZoneId ?? null;

  if ((!shippingProfileId || !serviceZoneId) && binding.locationId) {
    // --- profile ---
    if (!shippingProfileId) {
      try {
        const profiles = await sdk.admin.shippingProfile.list({ limit: 50 });
        shippingProfileId =
          profiles.shipping_profiles.find((p: any) => p.type === 'default')?.id ??
          profiles.shipping_profiles[0]?.id ??
          null;
      } catch (e: any) {
        console.error('[tenant-shipping] shippingProfile.list failed:', e?.message);
      }
    }

    // --- service zone ---
    if (!serviceZoneId) {
      try {
        const loc = await sdk.admin.stockLocation.retrieve(binding.locationId, {
        fields: '*fulfillment_sets,*fulfillment_sets.service_zones',
        });

        const shippingSets = (loc.stock_location.fulfillment_sets ?? []).filter(
        (s: any) => s.type === 'shipping' && !s.deleted_at,
        );
        let fset = shippingSets[0];

        // If none exists, create one (shipping type) instead of reusing pickup.
        if (!fset) {
        fset = await createFulfillmentSet(sdk, tenantId);
        if (fset?.id) {
            await attachFulfillmentSet(sdk, binding.locationId, fset.id);
            fset = { ...fset, service_zones: [] };
        }
        }

        if (!fset) {
          fset = await createFulfillmentSet(sdk, tenantId);
          if (fset?.id) {
            await attachFulfillmentSet(sdk, binding.locationId, fset.id);
            // Fulfillment set just created won't have service_zones in memory.
            fset = { ...fset, service_zones: [] };
          }
        }

        let zone = fset?.service_zones?.[0];

        if (!zone && countryCode && fset?.id) {
          zone = await createServiceZone(sdk, fset.id, countryCode);
        }

        serviceZoneId = zone?.id ?? null;
      } catch (e: any) {
        console.error(
          '[tenant-shipping] service zone resolution failed:',
          e?.response?.data ?? e?.message ?? e,
        );
      }
    }

    // Persist whatever we managed to resolve so we don't refetch next time.
    if (shippingProfileId || serviceZoneId) {
      try {
        await prisma.medusaBinding.update({
          where: { tenantId },
          data: { shippingProfileId, serviceZoneId },
        });
      } catch (e: any) {
        console.error('[tenant-shipping] persist failed:', e?.message ?? e);
      }
    }
  }

  return {
    tenantId,
    sdk,
    binding: {
      backendUrl: binding.backendUrl,
      salesChannelId: binding.salesChannelId,
      regionId: binding.regionId ?? null,
      locationId: binding.locationId ?? null,
      shippingProfileId,
      serviceZoneId,
    },
    countryCode,
    currencyCode,
  };
}