// app/api/t/[tenantId]/collections/[id]/route.ts
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
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    const existing = await sdk.admin.productCollection.retrieve(id);
    if (existing.collection.metadata?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updatePayload: any = {};
    if (body.title) updatePayload.title = body.title;
    if (body.handle) updatePayload.handle = body.handle;
    updatePayload.metadata = {
      ...(existing.collection.metadata ?? {}),
      tenantId,
    };

    const result = await sdk.admin.productCollection.update(id, updatePayload);
    return NextResponse.json({ collection: result.collection });
  } catch (e: any) {
    console.error('[Collections POST id]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
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
    const { sdk } = await getMedusaAdminClient(tenantId);

    const existing = await sdk.admin.productCollection.retrieve(id);
    if (existing.collection.metadata?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await sdk.admin.productCollection.delete(id);
    return NextResponse.json({ success: true, deleted: true });
  } catch (e: any) {
    console.error('[Collections DELETE]', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}