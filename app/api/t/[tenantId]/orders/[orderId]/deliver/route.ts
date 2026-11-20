// app/api/t/[tenantId]/orders/[orderId]/deliver/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; orderId: string }> }
) {
  const { tenantId, orderId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    const { order } = await sdk.admin.order.retrieve(orderId, {
      fields: '*fulfillments',
    });

    const fulfillment = order.fulfillments?.[0];
    if (!fulfillment) {
      return NextResponse.json({ error: 'No fulfillment found' }, { status: 400 });
    }

    await sdk.admin.order.markAsDelivered(orderId, fulfillment.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Deliver Order] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to mark order as delivered', detail: e.response?.data },
      { status: 500 }
    );
  }
}