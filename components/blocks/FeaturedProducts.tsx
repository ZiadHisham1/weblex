import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface FeaturedProductItem {
  imageUrl: string;
  link?: string;
}

export interface FeaturedProductsProps {
  title: string;
  headerLink: string;
  items: FeaturedProductItem[];
}

export function FeaturedProducts({
  title = 'Featured Products',
  headerLink = '#',
  items = [],
}: FeaturedProductsProps) {
  
  // Fallback if empty
  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
              <span className="text-gray-400 text-sm">Add images in editor</span>
           </div>
           <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
              <span className="text-gray-400 text-sm">Add images in editor</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
          {title}
        </h2>
        <a 
          href={headerLink} 
          className="text-gray-900 hover:text-gray-600 transition-transform duration-300 hover:translate-x-1"
          aria-label="View all featured products"
        >
          <ArrowRight className="w-7 h-7 stroke-[1.5]" />
        </a>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {items.map((item, index) => (
          <a 
            key={index}
            href={item.link || '#'} 
            className="relative block w-full aspect-[4/3] rounded-3xl overflow-hidden group"
          >
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={`Featured Product ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}