// app/sites/[site]/product/[handle]/page.tsx
import { notFound } from 'next/navigation';
import { getTenantBySite } from '@/lib/tenant';
import { getMedusaStoreClient, medusaCall } from '@/lib/medusa/client';
import { AddToCartButton } from './add-to-cart';
import { ProductImageGallery } from './image-gallery'; // 👈 Import the new component
import DOMPurify from 'isomorphic-dompurify';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ site: string; handle: string }>;
}) {
  // ... (keep all your existing data fetching logic exactly as is) ...
  const { site, handle } = await params;

  const tenant = await getTenantBySite(site);
  if (!tenant || tenant.siteType !== 'COMMERCE') notFound();

  let product: any = null;
  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);
    const result = await medusaCall(() => sdk.store.product.list({ 
      handle, 
      limit: 1, 
      region_id: tenant.medusa?.regionId, 
      fields: "*variants.calculated_price,*images" 
    }));
    product = result.products[0];
  } catch {
    notFound();
  }
  if (!product) notFound();

  const variants = product.variants ?? [];
  const price = product.variants?.[0]?.calculated_price ?? null;

  const allImages = product.images?.length > 0 
    ? product.images.map((img: any) => img.url) 
    : product.thumbnail 
      ? [product.thumbnail] 
      : ["https://placehold.co/800x600?text=No+Image"];

  const formatPrice = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const cleanDescription = product.description 
    ? DOMPurify.sanitize(product.description, {
        ADD_TAGS: ['style', 'iframe', 'video', 'source'],
        ADD_ATTR: ['class', 'style', 'src', 'controls', 'autoplay', 'loop', 'muted', 'playsinline'],
      })
    : null;

  return (
    <main className="min-h-screen bg-[#FDF9EC] font-['Jost',sans-serif]">
      <div className="max-w-[1440px] mx-auto px-3 py-12 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* 👇 Replace the entire static Left Column with the interactive component */}
        <ProductImageGallery images={allImages} title={product.title} />

        {/* RIGHT COLUMN: Product Details */}
        <div className="w-full lg:w-[45%] max-w-[539px] bg-white rounded-[32px] border border-[0.5px] border-black/10 p-6 md:p-8 flex flex-col gap-6">
          
          {/* Title & Reviews */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-[32px] font-bold text-black leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-[#A3E635]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-light text-black">trusted by (140 review)</span>
            </div>
          </div>

          {/* Description */}
          {cleanDescription && (
            <div 
              className="text-base md:text-[20px] font-medium leading-[1.8] text-justify text-black pr-4"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          )}

          {/* Price Box */}
          {price && (
            <div className="w-full md:w-[288px] h-[48px] bg-[#FDF9EC] rounded-xl flex items-center px-4 gap-4 mt-2">
              <span className="text-[20px] font-medium text-black">
                {formatPrice(price.calculated_amount, price.currency_code)}
              </span>
              <span className="text-sm font-light text-black/50 line-through">
                {formatPrice(price.calculated_amount * 1.25, price.currency_code)}
              </span>
              <div className="bg-[#27272A] text-white text-[11px] font-medium px-2 py-1 rounded-[10px] ml-auto tracking-wide">
                25% OFF
              </div>
            </div>
          )}

          {/* Variants / Color Selection */}
          {variants.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[20px] font-medium text-black uppercase">Options</h3>
              <div className="flex gap-4 flex-wrap">
                {variants.map((v: any, index: number) => (
                  <div key={v.id} className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-[16px] overflow-hidden cursor-pointer border border-zinc-700 bg-gray-200 ${index === 0 ? 'outline outline-[2px] outline-black outline-offset-[3px]' : 'hover:ring-2 hover:ring-gray-400'}`}>
                       <img src={v.thumbnail || product.thumbnail || `https://placehold.co/64x64/e5e5e5/999999?text=${v.title}`} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-gray-500">{v.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Area */}
          <div className="flex flex-col gap-4 mt-4">
            {variants.length > 0 ? (
              <AddToCartButton
                variants={variants.map((v: any) => ({
                  id: v.id,
                  title: v.title,
                  price: v.calculated_price
                    ? formatPrice(v.calculated_price.calculated_amount, v.calculated_price.currency_code)
                    : null,
                }))}
              />
            ) : (
              <p className="text-red-600 text-sm">This product has no variants.</p>
            )}
          </div>

          {/* Bottom Image with Badge */}
          <div className="relative w-full h-[147px] mt-4 rounded-[24px] overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://videos.pexels.com/video-files/5823583/5823583-uhd_2560_1440_24fps.mp4" type="video/mp4"  />
            </video>
            <div className="absolute bottom-3 left-3 bg-[#FDF9EC]/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-black border border-black/10">
              styled in your home
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}