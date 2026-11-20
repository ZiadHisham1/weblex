import React from 'react';

export interface CategoryItem {
  name: string;
  imageUrl: string;
  link?: string;
}

export function ShopByCategoryRow({ categories = [] }: { categories: CategoryItem[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full mx-auto px-4 md:px-8 py-8">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-max gap-6 md:gap-8 lg:gap-12">
          {categories.map((category, index) => (
            <a
              key={index}
              href={category.link || '#'}
              className="flex flex-col items-center justify-center group cursor-pointer w-[100px] md:w-[130px] lg:w-[150px]"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F8F8F8] flex items-center justify-center p-4 md:p-6 mb-4 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md border border-transparent group-hover:border-gray-200">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full" />
                )}
              </div>
              <span className="text-sm md:text-base font-semibold text-gray-900 text-center transition-colors duration-300 group-hover:text-gray-600">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
