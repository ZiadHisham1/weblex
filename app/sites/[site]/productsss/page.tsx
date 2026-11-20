// app/sites/[site]/products/page.tsx
import { notFound } from 'next/navigation';
import { getTenantBySite } from '@/lib/tenant';
import { getMedusaStoreClient, medusaCall } from '@/lib/medusa/client';
import { ProductsClient } from './client';

export default async function ProductsCatalogPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;

  const tenant = await getTenantBySite(site);
  if (!tenant || tenant.siteType !== 'COMMERCE') notFound();

  let products: any[] = [];
  
  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);
    const result = await medusaCall(() => 
      sdk.store.product.list({ 
        limit: 100,
        region_id: tenant.medusa?.regionId,
        // Need to fetch options and variants to filter by Size/Color
        fields: "*variants.calculated_price,*variants.options,*variants.inventory_quantity,*images" 
      })
    );
    products = result.products || [];
  } catch (e) {
    console.error("Failed to fetch products:", e);
  }

  const formatPrice = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format the data to match the Client Component props
  const formattedProducts = products.map((p) => {
    const variant = p.variants?.[0];
    const price = variant?.calculated_price;
    
    // Extract options (e.g., [{ Size: '3m x 1m' }, { Color: 'Blue' }])
    const options = p.variants?.map((v: any) => {
       const optionMap: Record<string, string> = {};
       v.options?.forEach((opt: any) => {
         optionMap[opt.option.title] = opt.value;
       });
       return optionMap;
    }) || [];

    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail,
      description: p.description || '',
      priceStr: price ? formatPrice(price.calculated_amount, price.currency_code) : 'N/A',
      options: options,
    };
  });

  return (
    <main className="min-h-screen bg-[#FDF9EC] font-['Jost',sans-serif]">
      {/* Header section */}
      <div className=" mx-auto px-4 pt-16 pb-4">
        <h1 className="text-4xl font-bold text-gray-900">All Products</h1>
      </div>

      {/* Pass to Client Component */}
      <ProductsClient site={site} initialProducts={formattedProducts} />
    </main>
  );
}