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
    <div className="mx-auto max-w-[1200px] pb-24">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Add product</h1>
        </div>
      </header>

      <NewProductForm
        tenantId={tenantId}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}