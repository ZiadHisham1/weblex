// app/api/t/[tenantId]/orders/[orderId]/ship/route.ts
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

    // 1. Retrieve order with fulfillments
    const { order } = await sdk.admin.order.retrieve(orderId, {
      fields: '*fulfillments,*items',
    });

    const fulfillment = order.fulfillments?.[0];
    if (!fulfillment) {
      return NextResponse.json({ error: 'No fulfillment found' }, { status: 400 });
    }

    // 2. Create shipment (mark as shipped)
    await sdk.admin.order.createShipment(orderId, fulfillment.id, {
      items: order.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Ship Order] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to ship order', detail: e.response?.data },
      { status: 500 }
    );
  }
}