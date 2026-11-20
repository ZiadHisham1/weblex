import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface CollectionItem {
  title: string;
  imageUrl: string;
  link?: string;
}

export interface CollectionsListProps {
  sectionTitle: string;
  headerLink: string;
  items: CollectionItem[];
}

export function CollectionsList({
  sectionTitle = 'Collections',
  headerLink = '#',
  items = [],
}: CollectionsListProps) {
  
  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-medium tracking-wide text-gray-900 mb-8">{sectionTitle}</h2>
        <p className="text-gray-500">Add collections in the editor.</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
          {sectionTitle}
        </h2>
        <a 
          href={headerLink} 
          className="text-gray-900 hover:text-gray-600 transition-transform duration-300 hover:translate-x-1"
          aria-label="View all collections"
        >
          <ArrowRight className="w-7 h-7 stroke-[1.5]" />
        </a>
      </div>

      {/* Vertical Stack */}
      <div className="flex flex-col gap-4 md:gap-5">
        {items.map((item, index) => (
          <a 
            key={index}
            href={item.link || '#'} 
            className="relative block w-full h-[120px] md:h-[150px] lg:h-[180px] rounded-2xl overflow-hidden group"
          >
            {/* Background Image */}
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-200" />
            )}
            
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/40" />

            {/* Left-Aligned Title */}
            <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-16 z-10">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-wider drop-shadow-md">
                {item.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}