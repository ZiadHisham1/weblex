// app/api/t/[tenantId]/discounts/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    // 👇 Include base fields ('*') plus relations and metadata, and paginate
    //    so we don't miss tenant-specific promotions on a shared store.
    const tenantPromotions: any[] = [];
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await sdk.admin.promotion.list({
        limit: pageSize,
        offset,
        fields: '*application_method,*rules,metadata,*',
      } as any);

      const batch = result.promotions ?? [];
      tenantPromotions.push(
        ...batch.filter((p: any) => p.metadata?.tenantId === tenantId)
      );

      hasMore = batch.length === pageSize;
      offset += pageSize;
      if (offset > 5000) break;
    }

    return NextResponse.json({
      promotions: tenantPromotions,
      count: tenantPromotions.length,
    });
  } catch (e: any) {
    console.error('[Promotions GET] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.value) {
    return NextResponse.json(
      { error: 'Code and value are required' },
      { status: 400 }
    );
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    const result = await sdk.admin.promotion.create({
      code: body.code.toUpperCase(),
      type: 'standard',
      status: 'active',
      is_automatic: false,
      application_method: {
        type: 'percentage',
        value: body.value,
        target_type: 'order',
      },
      // 👇 Stamp the promotion with the tenantId
      metadata: {
        tenantId: tenantId,
      },
    } as any);

    return NextResponse.json({ promotion: result.promotion });
  } catch (e: any) {
    console.error('[Promotions POST] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create discount' },
      { status: 500 }
    );
  }
}