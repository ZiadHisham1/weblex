// app/api/t/[tenantId]/orders/[orderId]/fulfill/route.ts
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
    const { sdk, binding } = await getMedusaAdminClient(tenantId);

    // 1. Retrieve the order with items to construct the fulfillment payload
    const { order } = await sdk.admin.order.retrieve(orderId, {
      fields: '*items,*items.detail',
    });

    const itemsToFulfill = order.items?.map((item: any) => ({
      id: item.id,
      quantity: item.quantity, // Fulfilling the entire quantity for simplicity
    })) || [];

    if (itemsToFulfill.length === 0) {
      return NextResponse.json({ error: 'No items to fulfill' }, { status: 400 });
    }

    // 2. Create the fulfillment
    const result = await sdk.admin.order.createFulfillment(orderId, {
      items: itemsToFulfill,
      location_id: binding.locationId, // Use the tenant's default location
    });

    return NextResponse.json({ success: true, order: result.order });
  } catch (e: any) {
    console.error('[Fulfill Order] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create fulfillment', detail: e.response?.data },
      { status: 500 }
    );
  }
}