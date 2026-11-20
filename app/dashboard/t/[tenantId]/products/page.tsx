// app/dashboard/t/[tenantId]/products/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { loadIcons } from '@/lib/icons';
import { Clock } from 'lucide-react';
import { ProductsClient } from './client';

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let products: any[] = [];
  let error: string | null = null;
  let provisioning = false;

  if (tenant.medusa?.provisioningState === 'PENDING' || tenant.medusa?.provisioningState === 'PROVISIONING') {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error = 'Store not ready. Provisioning state: ' + (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk, binding } = await getMedusaAdminClient(tenantId);
      
      const result = await sdk.admin.product.list({
        limit: 100,
        fields: '*variants.prices,*variants.inventory_items.inventory.location_levels,*sales_channels,*collection,*type,*categories',
      } as any);
      
      products = result.products.filter((p: any) =>
        (p.sales_channels ?? []).some((sc: any) => sc.id === binding.salesChannelId),
      );
    } catch (e: any) {
      error = e?.message ?? 'Failed to load products';
    }
  }

  const icons = loadIcons(['products.svg']);
  const productsIcon = icons['products.svg'];

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="mx-auto space-y-4">
    
      {provisioning && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
          Your store is being set up. This takes about 10 seconds. Refresh to check.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 👇 Render the Client Component */}
      {!provisioning && !error && (
        <ProductsClient 
          tenantId={tenantId} 
          initialProducts={products} 
          productsIcon={productsIcon} 
        />
      )}
    </div>
  );
}