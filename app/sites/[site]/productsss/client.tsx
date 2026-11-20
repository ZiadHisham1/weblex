// app/sites/[site]/products/client.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Product = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  description: string;
  priceStr: string;
  options: Record<string, string>[];
};

export function ProductsClient({
  site,
  initialProducts,
}: {
  site: string;
  initialProducts: Product[];
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Filter products based on selected options
  const filteredProducts = initialProducts.filter((product) => {
    let matchesSize = true;
    let matchesColor = true;

    if (selectedSize) {
      matchesSize = product.options.some((opt) => opt.Size === selectedSize);
    }
    if (selectedColor) {
      matchesColor = product.options.some((opt) => opt.Color === selectedColor);
    }

    return matchesSize && matchesColor;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-12 px-4  mx-auto w-full">
      
      {/* 👇 SIDEBAR FILTERS (Left Side) */}
      <aside className="w-full lg:w-[280px] flex-shrink-0">
        <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm sticky top-24">
          
          {/* Size Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-black mb-4">Size</h3>
            <div className="flex flex-wrap gap-2">
              {['3m x 1m', '2m x 3m', '5m'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors
                    ${selectedSize === size 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-black mb-4">Colour</h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Blue', hex: '#0000FF' },
                { name: 'White', hex: '#F3F4F6' },
                { name: 'Beige', hex: '#F5F5DC' },
                { name: 'Navy', hex: '#000080' },
                { name: 'Grey', hex: '#808080' },
                { name: 'Purple', hex: '#800080' },
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                  className="flex items-center gap-3 group text-left"
                >
                  <div 
                    className={`w-6 h-6 rounded-full border shadow-inner transition-all
                      ${selectedColor === color.name ? 'ring-2 ring-black ring-offset-2' : 'border-gray-300'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`text-sm ${selectedColor === color.name ? 'font-bold' : 'text-gray-600 group-hover:text-black'}`}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>

      {/* 👇 PRODUCT GRID (Right Side) */}
      <div className="flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-gray-200">
            <p className="text-gray-500">No products match your selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/sites/${site}/product/${product.handle}`}
                className="group relative block w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100"
              >
                {/* Background Image */}
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                {/* Text Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <h3 className="text-white text-2xl font-bold mb-1">
                    {product.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-3 max-w-[90%]">
                    {product.description || 'Elevate your living space with our premium collection.'}
                  </p>
                  <p className="text-white font-bold text-lg">
                    {product.priceStr}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}