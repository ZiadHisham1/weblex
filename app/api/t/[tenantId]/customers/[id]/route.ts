// app/api/t/[tenantId]/customers/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    const updatePayload: any = {};
    if (body.email) updatePayload.email = body.email;
    if (body.first_name !== undefined) updatePayload.first_name = body.first_name;
    if (body.last_name !== undefined) updatePayload.last_name = body.last_name;
    if (body.phone !== undefined) updatePayload.phone = body.phone;

    const result = await sdk.admin.customer.update(id, updatePayload);

    return NextResponse.json({ customer: result.customer });
  } catch (e: any) {
    console.error('[Customer Update] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to update customer', detail: e.response?.data },
      { status: 500 }
    );
  }
}