import React from "react";

export function ShopByCategory({
  title,
  categories,
}: {
  title: string;
  categories: { name: string; imageUrl: string }[];
}) {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto w-full">
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-12">{title}</h2>

      {/* Categories Grid/Flex */}
      <div className="flex flex-wrap justify-between items-start gap-6 md:gap-8">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer w-[100px] md:w-[140px]"
          >
            {/* Circular Image Container */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 flex items-center justify-center p-4 md:p-6 mb-4 transition-transform duration-300 group-hover:scale-105 border border-gray-100">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : (
                // Fallback if no image is provided
                <div className="w-full h-full bg-gray-200 rounded-full" />
              )}
            </div>

            {/* Label */}
            <span className="text-sm font-bold text-gray-900 text-center">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}