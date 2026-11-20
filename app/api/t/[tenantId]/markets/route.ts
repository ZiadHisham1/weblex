// app/api/t/[tenantId]/markets/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

// ---------------------------------------------------------------------------
// GET — list all regions (markets) with countries
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.region.list({
      limit: 100,
      fields: '*countries,*payment_providers',
    } as any);

    return NextResponse.json({ regions: result.regions ?? [], count: result.count ?? 0 });
  } catch (e: any) {
    console.error('[Markets GET]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to fetch regions', detail: e.response?.data },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST — create a new region (market)
// ---------------------------------------------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!body?.currency_code || typeof body.currency_code !== 'string') {
    return NextResponse.json({ error: 'currency_code is required' }, { status: 400 });
  }
  if (!Array.isArray(body?.countries) || body.countries.length === 0) {
    return NextResponse.json({ error: 'At least one country is required' }, { status: 400 });
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.region.create({
      name: body.name.trim(),
      currency_code: body.currency_code.toLowerCase(),
      countries: body.countries.map((iso: string) => iso.toLowerCase()),
      automatic_taxes: body.automatic_taxes ?? true,
      is_tax_inclusive: body.is_tax_inclusive ?? false,
      payment_providers: body.payment_providers ?? ['pp_system_default'],
      metadata: body.metadata ?? {},
    } as any);

    return NextResponse.json({ region: result.region });
  } catch (e: any) {
    console.error('[Markets POST]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create region', detail: e.response?.data },
      { status: 500 },
    );
  }
}