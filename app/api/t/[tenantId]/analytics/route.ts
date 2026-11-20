import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    
    // In a real scenario, you'd aggregate these metrics over the last 30 days.
    // Here we fetch the raw data needed to populate the metrics.
    const ordersResult = await sdk.admin.order.list({
      sales_channel_id: [binding.salesChannelId],
      limit: 1000, // Fetching up to 1000 for basic calculation
    } as any);

    const orders = ordersResult.orders || [];
    
    const grossSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordersFulfilled = orders.filter(o => o.fulfillment_status === 'fulfilled').length;
    const totalOrders = orders.length;

    return NextResponse.json({
      metrics: {
        grossSales,
        ordersFulfilled,
        totalOrders,
        returningCustomerRate: 0, // Requires complex customer history logic
      },
      recentOrders: orders.slice(0, 10), // For the charts
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch analytics' }, { status: 500 });
  }
}