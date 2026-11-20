// app/api/t/[tenantId]/growth/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { umamiWebsiteId: true, medusa: { select: { provisioningState: true } } },
  });

  if (!tenant?.umamiWebsiteId) {
    return NextResponse.json({ error: 'Analytics not configured for this store' }, { status: 404 });
  }

  const UMAMI_URL = process.env.UMAMI_URL || 'http://localhost:3001';
  const token = process.env.UMAMI_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  const endAt = Date.now();
  const startAt = endAt - 30 * 24 * 60 * 60 * 1000;

  // 👇 Helper to guarantee we always return an array
  const ensureArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.metrics)) return val.metrics;
    return [];
  };

  try {
    // 1. Fetch everything from Umami in parallel
    const [statsRes, activeRes, pagesRes, referrersRes, browsersRes, osRes, devicesRes, countriesRes, timeseriesRes] = await Promise.all([
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/stats?startAt=${startAt}&endAt=${endAt}`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/active`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=url&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=referrer&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=browser&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=os&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=device&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/metrics?type=country&startAt=${startAt}&endAt=${endAt}&limit=10`, { headers, cache: 'no-store' }),
      fetch(`${UMAMI_URL}/api/websites/${tenant.umamiWebsiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=UTC`, { headers, cache: 'no-store' }),
    ]);

    const stats = await statsRes.json().catch(() => ({}));
    const active = await activeRes.json().catch(() => ({}));
    const pages = ensureArray(await pagesRes.json().catch(() => []));
    const referrers = ensureArray(await referrersRes.json().catch(() => []));
    const browsers = ensureArray(await browsersRes.json().catch(() => []));
    const os = ensureArray(await osRes.json().catch(() => []));
    const devices = ensureArray(await devicesRes.json().catch(() => []));
    const countries = ensureArray(await countriesRes.json().catch(() => []));
    const timeseries = await timeseriesRes.json().catch(() => ({}));

    const pageviewsSeries = ensureArray(timeseries?.pageviews);
    const sessionsSeries = ensureArray(timeseries?.sessions);

    // 2. Fetch total revenue from Medusa (if provisioned)
    let totalRevenue = 0;
    let orderCount = 0;
    if (tenant.medusa?.provisioningState === 'READY') {
      try {
        const { sdk, binding } = await getMedusaAdminClient(tenantId);
        const ordersRes = await sdk.admin.order.list({
          sales_channel_id: [binding.salesChannelId],
          limit: 1000,
        } as any);
        orderCount = ordersRes.count || 0;
        totalRevenue = ordersRes.orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
      } catch (e) {
        console.error('[Growth] Failed to fetch Medusa orders:', e);
      }
    }

    // 3. Format the response
    return NextResponse.json({
      summary: {
        pageviews: stats?.pageviews?.value || 0,
        visitors: stats?.visitors?.value || 0,
        visits: stats?.visits?.value || 0,
        bounces: stats?.bounces?.value || 0,
        totaltime: stats?.totaltime?.value || 0,
        activeVisitors: active?.visitors || 0,
      },
      revenue: {
        total: totalRevenue / 100,
        orders: orderCount,
      },
      timeseries: pageviewsSeries.map((p: any) => ({
        date: p.x,
        pageviews: p.y,
        sessions: sessionsSeries.find((s: any) => s.x === p.x)?.y || 0,
      })),
      pages: pages.map((p: any) => ({ url: p.x || p.name || 'Unknown', visits: p.y || 0 })),
      referrers: referrers.map((r: any) => ({ source: r.x || 'Direct', visits: r.y || 0 })),
      browsers: browsers.map((b: any) => ({ name: b.x || 'Unknown', visits: b.y || 0 })),
      os: os.map((o: any) => ({ name: o.x || 'Unknown', visits: o.y || 0 })),
      devices: devices.map((d: any) => ({ name: d.x || 'Unknown', visits: d.y || 0 })),
      countries: countries.map((c: any) => ({ name: c.x || 'Unknown', visits: c.y || 0 })),
    });
  } catch (e: any) {
    console.error('[Growth API] Failed:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}