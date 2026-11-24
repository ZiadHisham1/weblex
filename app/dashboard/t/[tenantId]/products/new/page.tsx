import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { NewProductForm } from './form';

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  let categories: any[] = [];
  let collections: any[] = [];

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    
    const [catRes, colRes] = await Promise.all([
      sdk.admin.productCategory.list({ limit: 100 } as any),
      sdk.admin.productCollection.list({ limit: 100 } as any),
    ]);
    
    categories = catRes.product_categories || [];
    collections = colRes.collections || [];
  } catch (e) {
    console.error('Failed to load categories/collections', e);
  }

  return (
    <div className="mx-auto pb-24">
      <NewProductForm
        tenantId={tenantId}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}