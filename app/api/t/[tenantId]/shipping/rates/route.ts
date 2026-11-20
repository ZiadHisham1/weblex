// app/api/t/[tenantId]/shipping/rates/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { resolveTenantShippingContext } from '@/lib/shipping/tenant-shipping';
import { citiesFor } from '@/lib/shipping/cities';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const ctx = await resolveTenantShippingContext(tenantId);
    if (!ctx.binding.shippingProfileId) {
      return NextResponse.json(
        { error: 'Shipping profile not configured for this tenant' },
        { status: 503 },
      );
    }

    const { shipping_options } = await (ctx.sdk.admin.shippingOption as any).list({
      limit: 500,
      fields: '*prices,*rules',
    });

    const rates = (shipping_options ?? [])
      .filter(
        (o: any) =>
          o.shipping_profile_id === ctx.binding.shippingProfileId &&
          o.metadata?.tenantId === tenantId &&
          o.metadata?.kind === 'city_rate',
      )
      .map((o: any) => {
        const price = (o.prices ?? []).find(
          (p: any) => p.currency_code === ctx.currencyCode,
        ) ?? (o.prices ?? [])[0];
        return {
          id: o.id,
          city: o.metadata?.city ?? '',
          name: o.name,
          amount: price?.amount ?? 0,
          active: o.is_enabled !== false,
        };
      });

    return NextResponse.json({
      countryCode: ctx.countryCode,
      currencyCode: ctx.currencyCode,
      cities: citiesFor(ctx.countryCode),
      rates,
    });
  } catch (e: any) {
    console.error('[shipping/rates GET]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (
    !body?.city || typeof body.city !== 'string' ||
    !body?.name || typeof body.name !== 'string' ||
    typeof body.amount !== 'number' || body.amount < 0
  ) {
    return NextResponse.json(
      { error: 'city, name, and a non-negative amount are required' },
      { status: 400 },
    );
  }

  try {
    const ctx = await resolveTenantShippingContext(tenantId);
    if (!ctx.binding.shippingProfileId) {
      return NextResponse.json(
        { error: 'Shipping profile not configured for this tenant' },
        { status: 503 },
      );
    }
    if (!ctx.currencyCode) {
      return NextResponse.json(
        { error: 'Tenant region has no currency configured' },
        { status: 503 },
      );
    }

    // -------------------------------------------------------------------
    // 1. Ensure a service zone exists (create on demand, idempotent).
    // -------------------------------------------------------------------
    let serviceZoneId = ctx.binding.serviceZoneId;

    if (!serviceZoneId) {
      if (!ctx.binding.locationId || !ctx.countryCode) {
        return NextResponse.json(
          { error: 'Tenant has no stock location or country; cannot create a service zone' },
          { status: 503 },
        );
      }

      // Find or create a shipping fulfillment set on the stock location.
      const loc = await ctx.sdk.admin.stockLocation.retrieve(ctx.binding.locationId, {
        fields: '*fulfillment_sets,*fulfillment_sets.service_zones',
      });
      const shippingSets = (loc.stock_location.fulfillment_sets ?? []).filter(
        (s: any) => s.type === 'shipping' && !s.deleted_at,
      );

      let fset = shippingSets[0];
      if (!fset) {
        const created = await ctx.sdk.client.fetch('/admin/fulfillment-sets', {
          method: 'POST',
          body: { name: `Tenant ${tenantId} shipping`, type: 'shipping' },
        });
        fset = created.fulfillment_set;
        await ctx.sdk.client.fetch(`/admin/stock-locations/${ctx.binding.locationId}`, {
          method: 'POST',
          body: { fulfillment_sets: [{ id: fset.id }] },
        });
        fset = { ...fset, service_zones: [] };
      }

      let zone = fset.service_zones?.[0];
      if (!zone) {
        const createdZone = await ctx.sdk.client.fetch(
          `/admin/fulfillment-sets/${fset.id}/service-zones`,
          {
            method: 'POST',
            body: {
              name: `${ctx.countryCode.toUpperCase()} zone`,
              geo_zones: [{ type: 'country', country_code: ctx.countryCode }],
            },
          },
        );
        zone = createdZone.service_zone;
      }
      serviceZoneId = zone.id;

      // Persist for next time.
      await prisma.medusaBinding.update({
        where: { tenantId },
        data: { serviceZoneId },
      });
    }

    // -------------------------------------------------------------------
    // 2. Upsert a shipping option for this city.
    // -------------------------------------------------------------------
    const priceAmount = Math.round(body.amount);
    const city = body.city.trim();

    const listRes = await ctx.sdk.admin.shippingOption.list({
      limit: 500,
      fields: '*prices,*rules',
    });
    const existing = (listRes.shipping_options ?? []).find(
      (o: any) =>
        o.shipping_profile_id === ctx.binding.shippingProfileId &&
        o.metadata?.tenantId === tenantId &&
        o.metadata?.kind === 'city_rate' &&
        (o.metadata?.city ?? '').toLowerCase() === city.toLowerCase(),
    );

    if (existing) {
      // Update price (and name if it changed).
      const res = await ctx.sdk.client.fetch(
        `/admin/shipping-options/${existing.id}`,
        {
          method: 'POST',
          body: {
            name: body.name.trim(),
            prices: [
              { currency_code: ctx.currencyCode, amount: priceAmount },
            ],
          },
        },
      );
      return NextResponse.json({ rate: res.shipping_option });
    }

    const payload = {
      name: body.name.trim(),
      price_type: 'flat',
      prices: [
        { currency_code: ctx.currencyCode, amount: priceAmount },
      ],
      service_zone_id: serviceZoneId,
      shipping_profile_id: ctx.binding.shippingProfileId,
      provider_id: 'manual_manual',
      metadata: {
        tenantId,
        kind: 'city_rate',
        city,
      },
    };

    console.log('[shipping/rates POST] payload:', JSON.stringify(payload, null, 2));

    const res = await ctx.sdk.client.fetch('/admin/shipping-options', {
      method: 'POST',
      body: payload,
    });

    return NextResponse.json({ rate: res.shipping_option });
  } catch (e: any) {
    console.error('[shipping/rates POST] FULL ERROR:', JSON.stringify({
      message: e?.message,
      status: e?.status,
      statusText: e?.statusText,
      data: e?.response?.data,
      response: e?.response,
    }, null, 2));
    return NextResponse.json(
      { error: e?.message ?? 'Failed', detail: e?.response?.data ?? null },
      { status: 500 },
    );
  }
}