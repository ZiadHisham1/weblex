// app/api/t/[tenantId]/collections/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.productCollection.list({
      limit: 500,
      fields: 'id,title,handle,metadata,created_at,*products',
    } as any);

    // 👇 Tenant filter
    const collections = (result.collections ?? []).filter(
      (c: any) => c.metadata?.tenantId === tenantId,
    );

    return NextResponse.json({ collections, count: collections.length });
  } catch (e: any) {
    console.error('[Collections GET]', e.response?.data || e);
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
  if (!body?.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.productCollection.create({
      title: body.title.trim(),
      handle: body.handle || undefined,
      metadata: {
        ...(body.metadata ?? {}),
        tenantId, // 👈 stamp
      },
    });

    return NextResponse.json({ collection: result.collection });
  } catch (e: any) {
    console.error('[Collections POST]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed', detail: e.response?.data },
      { status: 500 },
    );
  }
}