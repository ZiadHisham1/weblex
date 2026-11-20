import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface BestSellerItem {
  imageUrl: string;
  discountTag?: string;
  link?: string;
}

export interface BestSellersProps {
  title: string;
  headerLink: string;
  items: BestSellerItem[];
}

export function BestSellers({
  title = 'BEST SELLERS',
  headerLink = '#',
  items = [],
}: BestSellersProps) {
  
  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-medium tracking-wide text-gray-900 mb-8">{title}</h2>
        <p className="text-gray-500">Add images in the editor to display the best sellers.</p>
      </div>
    );
  }

  const mainItem = items[0];
  const sideItems = items.slice(1, 3); 

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wide text-gray-900 uppercase">
          {title}
        </h2>
        <a 
          href={headerLink} 
          className="text-gray-900 hover:text-gray-600 transition-transform duration-300 hover:translate-x-1"
        >
          <ArrowRight className="w-7 h-7 stroke-[1.5]" />
        </a>
      </div>

      {/* 
        Replaced Grid with Flex to prevent overlapping issues in Puck.
        Using explicit aspect ratios instead of h-full to guarantee rendering.
      */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full">
        
        {/* Left Column (Main Item) */}
        <div className="w-full lg:w-1/2 flex">
          <a 
            href={mainItem.link || '#'} 
            className="relative block w-full aspect-[4/3] lg:aspect-[1.1/1] rounded-2xl overflow-hidden group border border-gray-200/50"
          >
            {mainItem.imageUrl ? (
              <img 
                src={mainItem.imageUrl} 
                alt="Best Seller Main" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
            )}
            
            {mainItem.discountTag && (
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-black px-6 py-2 rounded-full font-medium text-sm md:text-base shadow-sm border border-white/50 z-10">
                {mainItem.discountTag}
              </div>
            )}
          </a>
        </div>

        {/* Right Column (Stacked Items) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
          {sideItems.map((item, index) => (
            <a 
              key={index}
              href={item.link || '#'} 
              className="relative block w-full aspect-[16/9] lg:aspect-[2.2/1] rounded-2xl overflow-hidden group border border-gray-200/50"
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={`Best Seller ${index + 2}`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                 <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
              
              {item.discountTag && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-black px-5 py-1.5 rounded-full font-medium text-sm shadow-sm border border-white/50 z-10">
                  {item.discountTag}
                </div>
              )}
            </a>
          ))}

          {/* Empty slots filler for editor */}
          {sideItems.length < 2 && (
            <div className="w-full aspect-[16/9] lg:aspect-[2.2/1] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
              <span className="text-gray-400 text-sm">Add image in editor</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}