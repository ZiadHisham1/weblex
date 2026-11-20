// app/dashboard/t/[tenantId]/products/[id]/page.tsx
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { notFound } from 'next/navigation';
import { EditProductForm } from './form';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ tenantId: string; id: string }>;
}) {
  const { tenantId, id } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  let product: any = null;
  let categories: any[] = [];
  let collections: any[] = [];

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    
    // Fetch product, categories, and collections concurrently
    const [productRes, catRes, colRes] = await Promise.all([
      sdk.admin.product.retrieve(id, {
        fields: "*variants,*variants.inventory_items,*images,*categories,*collection"
      }),
      sdk.admin.productCategory.list({ limit: 100 } as any),
      sdk.admin.productCollection.list({ limit: 100 } as any),
    ]);
    
    product = productRes.product;
    categories = catRes.product_categories || [];
    collections = colRes.collections || [];

    if (!product) notFound();
  } catch (e) {
    console.error('Failed to load product details', e);
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1200px] pb-24">
      <EditProductForm
        tenantId={tenantId}
        product={product}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}