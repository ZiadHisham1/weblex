// app/api/t/[tenantId]/categories/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

// ---------------------------------------------------------------------------
// GET — list categories owned by this tenant
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

    const result = await sdk.admin.productCategory.list({
      limit: 500,
      fields: 'id,name,handle,description,parent_category_id,is_active,rank,mpath,metadata,*products',
    } as any);

    // 👇 Filter to categories this tenant created
    const categories = (result.product_categories ?? []).filter(
      (c: any) => c.metadata?.tenantId === tenantId,
    );

    return NextResponse.json({ categories, count: categories.length });
  } catch (e: any) {
    console.error('[Categories GET]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create category scoped to this tenant
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

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    // 👇 If a parent is provided, verify it belongs to this tenant
    if (body.parent_category_id) {
      const parent = await sdk.admin.productCategory.retrieve(body.parent_category_id);
      if (parent.product_category.metadata?.tenantId !== tenantId) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
    }

    const result = await sdk.admin.productCategory.create({
      name: body.name.trim(),
      handle: body.handle || undefined,
      description: body.description || undefined,
      parent_category_id: body.parent_category_id || undefined,
      is_active: body.is_active !== undefined ? body.is_active : true,
      // 👇 Tenant stamp
      metadata: {
        ...(body.metadata ?? {}),
        tenantId,
      },
    });

    return NextResponse.json({ category: result.product_category });
  } catch (e: any) {
    console.error('[Categories POST]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create', detail: e.response?.data },
      { status: 500 },
    );
  }
}