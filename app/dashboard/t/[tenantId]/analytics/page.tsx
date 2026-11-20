import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { AnalyticsClient } from './client';

// Helper to fetch Umami stats
async function getUmamiStats(websiteId: string) {
  const UMAMI_URL = process.env.UMAMI_URL || 'http://localhost:3001';
  const token = process.env.UMAMI_API_TOKEN;
  if (!token || !websiteId) return { pageviews: 0, visitors: 0 };

  const endAt = Date.now();
  const startAt = endAt - 24 * 60 * 60 * 1000; // Today

  try {
    const res = await fetch(`${UMAMI_URL}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 } // Don't cache for real-time refresh
    });
    if (!res.ok) return { pageviews: 0, visitors: 0 };
    const data = await res.json();
    return {
      pageviews: data.pageviews?.value || 0,
      visitors: data.visitors?.value || 0,
    };
  } catch {
    return { pageviews: 0, visitors: 0 };
  }
}

// Helper to fetch Medusa stats
async function getMedusaStats(tenantId: string, salesChannelId: string) {
  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const res = await sdk.admin.order.list({
      sales_channel_id: [salesChannelId],
      limit: 1000, // In production, use pagination/date filters
    });
    
    const orders = res.orders || [];
    const grossSales = orders.reduce((sum, o) => sum + (o.total || 0), 0) / 100; // Medusa uses cents
    const totalOrders = orders.length;
    const fulfilledOrders = orders.filter(o => o.fulfillment_status === 'fulfilled').length;
    
    return { grossSales, totalOrders, fulfilledOrders };
  } catch {
    return { grossSales: 0, totalOrders: 0, fulfilledOrders: 0 };
  }
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true }
  });

  if (!tenant) return null;

  // Fetch both data sources in parallel
  const [umami, medusa] = await Promise.all([
    getUmamiStats(tenant.umamiWebsiteId || ''),
    tenant.medusa?.salesChannelId ? getMedusaStats(tenantId, tenant.medusa.salesChannelId) : Promise.resolve({ grossSales: 0, totalOrders: 0, fulfilledOrders: 0 })
  ]);

  // Format the date for the header
  const lastRefreshed = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <AnalyticsClient 
      tenantId={tenantId}
      initialData={{ umami, medusa, lastRefreshed }}
      currency={tenant.medusa?.regionId ? 'USD' : 'EGP'} // You can map the actual region currency here
    />
  );
}