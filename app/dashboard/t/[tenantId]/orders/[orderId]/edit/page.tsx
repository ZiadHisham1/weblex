// app/dashboard/t/[tenantId]/orders/[orderId]/edit/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { EditOrderClient } from './edit-client';

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ tenantId: string; orderId: string }>;
}) {
  const { tenantId, orderId } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let order: any = null;
  let products: any[] = [];
  let region: any = null;
  let error: string | null = null;

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    
    const orderRes = await sdk.admin.order.retrieve(orderId, {
      fields: '*items,*customer,*shipping_address,*billing_address',
    });
    
    // 👇 Fallback to customer email if order.email is missing
    if (!orderRes.order.email && orderRes.order.customer?.email) {
      orderRes.order.email = orderRes.order.customer.email;
    }
    
    order = orderRes.order;

    const prodRes = await sdk.admin.product.list({
      limit: 100,
      fields: 'id,title,variants.id,variants.title,variants.sku,*variants.prices',
    });
    products = prodRes.products || [];

    if (binding.regionId) {
      const regionRes = await sdk.admin.region.retrieve(binding.regionId);
      region = regionRes.region;
    }
  } catch (e: any) {
    console.error('[Edit Order] Failed to load:', e.response?.data || e);
    error = e?.message ?? 'Failed to load order details';
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading order: {error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <EditOrderClient
      tenantId={tenantId}
      order={order}
      products={products}
      region={region}
    />
  );
}