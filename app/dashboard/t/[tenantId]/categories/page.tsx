import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { CategoriesClient } from './client';

export default async function CategoriesPage({
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

  let categories: any[] = [];
  let error: string | null = null;
  let provisioning = false;

  if (
    tenant.medusa?.provisioningState === 'PENDING' ||
    tenant.medusa?.provisioningState === 'PROVISIONING'
  ) {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error = 'Store not ready. Provisioning state: ' + (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk } = await getMedusaAdminClient(tenantId);
      // Added *products to get the count for the table
      // inside the else block where you load categories
      const result = await sdk.admin.productCategory.list({
        limit: 500,
        fields: 'id,name,handle,description,parent_category_id,is_active,rank,mpath,metadata,*products',
      } as any);

      // 👇 Filter to this tenant only
      categories = (result.product_categories ?? []).filter(
        (c: any) => c.metadata?.tenantId === tenantId,
      );
    } catch (e: any) {
      console.error('[Categories Dashboard] Failed to load:', e.response?.data || e);
      error = e?.message ?? 'Failed to load categories';
    }
  }

  return (
    <CategoriesClient
      tenantId={tenantId}
      initialCategories={categories}
      error={error}
      provisioning={provisioning}
    />
  );
}