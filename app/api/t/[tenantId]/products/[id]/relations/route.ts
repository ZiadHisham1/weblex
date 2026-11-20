import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> },
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    
    // Medusa expects an array of objects for categories: [{ id: 'pcat_123' }]
    // And a single object for collection: { id: 'pcol_123' } or null
    const updatePayload: any = {
      categories: (body.categoryIds || []).map((catId: string) => ({ id: catId })),
      collection_id: body.collectionId || null,
    };

    const result = await sdk.admin.product.update(id, updatePayload);
    return NextResponse.json({ product: result.product });
  } catch (e: any) {
    console.error("[Product Relations Update]", e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to update relations', detail: e.response?.data },
      { status: 500 }
    );
  }
}