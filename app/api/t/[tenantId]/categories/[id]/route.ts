// app/api/t/[tenantId]/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

// POST — update category (with ownership check)
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
    const { sdk } = await getMedusaAdminClient(tenantId);

    // 👇 Verify ownership before touching it
    const existing = await sdk.admin.productCategory.retrieve(id);
    if (existing.product_category.metadata?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updatePayload: any = {};
    if (body.name) updatePayload.name = body.name;
    if (body.handle) updatePayload.handle = body.handle;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.is_active !== undefined) updatePayload.is_active = body.is_active;
    if (body.parent_category_id !== undefined) {
      // Verify the new parent also belongs to tenant
      if (body.parent_category_id) {
        const parent = await sdk.admin.productCategory.retrieve(body.parent_category_id);
        if (parent.product_category.metadata?.tenantId !== tenantId) {
          return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
        }
      }
      updatePayload.parent_category_id = body.parent_category_id;
    }
    if (body.rank !== undefined) updatePayload.rank = body.rank;

    // Preserve metadata.tenantId
    updatePayload.metadata = {
      ...(existing.product_category.metadata ?? {}),
      tenantId,
    };

    const result = await sdk.admin.productCategory.update(id, updatePayload);
    return NextResponse.json({ category: result.product_category });
  } catch (e: any) {
    console.error('[Categories POST id]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed to update' }, { status: 500 });
  }
}

// DELETE — delete category (with ownership check)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> },
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    // 👇 Verify ownership
    const existing = await sdk.admin.productCategory.retrieve(id);
    if (existing.product_category.metadata?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await sdk.admin.productCategory.delete(id);
    return NextResponse.json({ success: true, deleted: true });
  } catch (e: any) {
    console.error('[Categories DELETE]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed to delete' }, { status: 500 });
  }
}