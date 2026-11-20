// app/api/t/[tenantId]/shipping/rates/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { resolveTenantShippingContext } from '@/lib/shipping/tenant-shipping';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> },
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  try {
    const ctx = await resolveTenantShippingContext(tenantId);
    const existing = await (ctx.sdk.admin.shippingOption as any).retrieve(id, {
      fields: '*prices,*rules',
    });
    const opt = existing.shipping_option;
    if (opt.metadata?.tenantId !== tenantId || opt.metadata?.kind !== 'city_rate') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const update: any = {};
    if (typeof body.name === 'string') update.name = body.name.trim();
    if (typeof body.active === 'boolean') update.is_enabled = body.active;
    if (typeof body.city === 'string' && body.city.trim()) {
      update.metadata = {
        ...(opt.metadata ?? {}),
        tenantId,
        kind: 'city_rate',
        city: body.city.trim(),
      };
    }
    if (typeof body.amount === 'number' && body.amount >= 0) {
      if (!ctx.currencyCode) {
        return NextResponse.json(
          { error: 'Tenant region has no currency configured' },
          { status: 503 },
        );
      }
      update.prices = [
        { currency_code: ctx.currencyCode, amount: Math.round(body.amount) },
      ];
    }

    try {
      const { shipping_option } = await (ctx.sdk.admin.shippingOption as any).update(
        id,
        update,
      );
      return NextResponse.json({ rate: shipping_option });
    } catch (e: any) {
      // Some Medusa v2 builds don't accept `prices` on update.
      // Fallback: delete + recreate with the new amount.
      if (update.prices && e?.response?.status >= 400 && e?.response?.status < 500) {
        console.warn(
          '[shipping/rates/:id] update with prices failed, falling back to recreate:',
          e.response?.data,
        );
        const city = update.metadata?.city ?? opt.metadata?.city;
        const name = update.name ?? opt.name;
        const active = update.is_enabled ?? opt.is_enabled !== false;

        await (ctx.sdk.admin.shippingOption as any).delete(id);
        const { shipping_option } = await (ctx.sdk.admin.shippingOption as any).create({
          name,
          price_type: 'flat',
          prices: [
            { currency_code: ctx.currencyCode, amount: Math.round(body.amount) },
          ],
          service_zone_id: ctx.binding.serviceZoneId,
          shipping_profile_id: ctx.binding.shippingProfileId,
          provider_id: 'manual_manual',
          is_enabled: active,
          metadata: { tenantId, kind: 'city_rate', city },
        });
        return NextResponse.json({ rate: shipping_option });
      }
      throw e;
    }
  } catch (e: any) {
    console.error('[shipping/rates/:id POST]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed', detail: e.response?.data },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> },
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const ctx = await resolveTenantShippingContext(tenantId);
    const existing = await (ctx.sdk.admin.shippingOption as any).retrieve(id);
    const opt = existing.shipping_option;
    if (opt.metadata?.tenantId !== tenantId || opt.metadata?.kind !== 'city_rate') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await (ctx.sdk.admin.shippingOption as any).delete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[shipping/rates/:id DELETE]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}