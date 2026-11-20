'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ResolvedProduct } from '@/puck.config';

export function ProductGridWithFilter({
  title,
  heroImage,
  productDetails,
  siteSubdomain,
  masterFilter,
}: {
  title: string;
  heroImage: string;
  productDetails: Record<string, ResolvedProduct>;
  siteSubdomain?: string;
  masterFilter?: {
    sizes?: { value: string }[];
    colors?: { value: string }[];
    properties?: { value: string }[];
  };
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const allProducts = Object.values(productDetails);

  // Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Calculate dynamic price limits
  const minPrice = allProducts.length > 0 ? Math.floor(Math.min(...allProducts.map(p => p.priceAmount))) : 0;
  const maxPrice = allProducts.length > 0 ? Math.ceil(Math.max(...allProducts.map(p => p.priceAmount))) : 1000;
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  // ---------------------------------------------------------------------------
  // 1. Use the Master Filter from Puck config. 
  // If empty, fallback to extracting from products (just in case).
  // ---------------------------------------------------------------------------
  const availableSizes = masterFilter?.sizes?.map(s => s.value) ?? [];
  const availableColors = masterFilter?.colors?.map(c => c.value) ?? [];
  const availableTags = masterFilter?.properties?.map(p => p.value) ?? [];

  // Toggle helpers
  const toggleFilter = (val: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(val) ? list.filter(i => i !== val) : [...list, val]);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedTags([]);
    setPriceRange([minPrice, maxPrice]);
  };

  // ---------------------------------------------------------------------------
  // 2. Filtering Logic (Checks if ANY variant matches)
  // ---------------------------------------------------------------------------
  const filteredItems = useMemo(() => {
    return allProducts.filter(p => {
      // Size check
      if (selectedSizes.length > 0) {
        const hasMatchingSize = p.options.some(opt => {
          const productSize = Object.entries(opt).find(([k]) => k.toLowerCase() === 'size')?.[1];
          return productSize && selectedSizes.includes(productSize);
        });
        if (!hasMatchingSize) return false;
      }
      
      // Color check
      if (selectedColors.length > 0) {
        const hasMatchingColor = p.options.some(opt => {
          const productColor = Object.entries(opt).find(([k]) => k.toLowerCase() === 'color')?.[1];
          return productColor && selectedColors.includes(productColor);
        });
        if (!hasMatchingColor) return false;
      }
      
      // Tag check
      if (selectedTags.length > 0) {
        if (!p.tags || !p.tags.some(tag => selectedTags.includes(tag))) return false;
      }
      
      // Price check
      if (p.priceAmount < priceRange[0] || p.priceAmount > priceRange[1]) return false;

      return true;
    });
  }, [allProducts, selectedSizes, selectedColors, selectedTags, priceRange]);

  // ---------------------------------------------------------------------------
  // 3. Render
  // ---------------------------------------------------------------------------
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 text-gray-900">
      {/* Hero Image */}
      {heroImage && (
        <div className="relative w-full h-[300px] md:h-[400px] border border-[#ffffff73] mb-12 rounded-2xl overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          >
            <source src="https://videos.pexels.com/video-files/31617692/13470975_1920_1080_24fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#f3b35334] z-10" />
        </div>
      )}

      {/* Header & Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50"
        >
          Filter ({selectedSizes.length + selectedColors.length + selectedTags.length})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <FilterPanel 
            availableSizes={availableSizes}
            availableColors={availableColors}
            availableTags={availableTags}
            selectedSizes={selectedSizes}
            selectedColors={selectedColors}
            selectedTags={selectedTags}
            toggleSize={(s) => toggleFilter(s, selectedSizes, setSelectedSizes)}
            toggleColor={(c) => toggleFilter(c, selectedColors, setSelectedColors)}
            toggleTag={(t) => toggleFilter(t, selectedTags, setSelectedTags)}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            clearAllFilters={clearAllFilters}
          />
        </aside>

        {/* Mobile Filter Overlay */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
            <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold">Filter</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-black">
                  ✕
                </button>
              </div>
              <div className="p-6">
                <FilterPanel 
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                  availableTags={availableTags}
                  selectedSizes={selectedSizes}
                  selectedColors={selectedColors}
                  selectedTags={selectedTags}
                  toggleSize={(s) => toggleFilter(s, selectedSizes, setSelectedSizes)}
                  toggleColor={(c) => toggleFilter(c, selectedColors, setSelectedColors)}
                  toggleTag={(t) => toggleFilter(t, selectedTags, setSelectedTags)}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No products match your filters.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 text-sm underline font-medium hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-6">
              {filteredItems.map((p) => (
                <div key={p.id} className="group relative flex flex-col">
                  <Link
                    href={
                      siteSubdomain
                        ? `/sites/${siteSubdomain}/product/${p.handle}`
                        : `/product/${p.handle}`
                    }
                    className="relative block lg:min-w-[400px] aspect-[16/9] bg-gradient-to-b from-transparent to-[#0000006e] rounded-2xl overflow-hidden"
                  >
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className='absolute bottom-12 left-5 font-bold text-2xl text-white px-3 py-1 rounded-lg'>
                      {p.title}
                      <br />
                      <span className="text-sm font-normal opacity-90 line-clamp-2">{p.description}</span>
                    </div>
                    <div className='absolute bottom-5 left-5 font-bold text-white text-lg px-3 py-1 rounded-lg'>
                      {p.priceStr}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Functional Filter UI
// ---------------------------------------------------------------------------
function FilterPanel({
  availableSizes, selectedSizes, toggleSize,
  availableColors, selectedColors, toggleColor,
  availableTags, selectedTags, toggleTag,
  minPrice, maxPrice, priceRange, setPriceRange,
  clearAllFilters
}: any) {
  
  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      'Black': '#000000', 'Grey': '#808080', 'Gray': '#808080', 'White': '#FFFFFF', 
      'Beige': '#F5F5DC', 'Red': '#FF0000', 'Purple': '#800080', 
      'Blue': '#0000FF', 'Green': '#008000', 'Navy': '#000080',
      'Pink': '#FFC0CB', 'Yellow': '#FFFF00', 'Orange': '#FFA500'
    };
    return map[colorName] || '#E5E7EB'; 
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || selectedTags.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice;

  return (
    <div className="space-y-8 rounded-2xl border border-[#42424233] bg-white p-4">
      {hasActiveFilters && (
        <button onClick={clearAllFilters} className="text-sm font-medium text-red-600 hover:underline">
          Clear all filters
        </button>
      )}

      {/* Size */}
      {availableSizes.length > 0 && (
        <>
          <div>
            <h4 className="font-medium text-sm mb-4">Size</h4>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                    selectedSizes.includes(size) 
                      ? 'bg-black text-white border-black' 
                      : 'bg-gray-100 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <hr className="border-gray-200" />
        </>
      )}

      {/* Colour */}
      {availableColors.length > 0 && (
        <>
          <div>
            <h4 className="font-medium text-sm mb-4">Colour</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              {availableColors.map((color: string) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleColor(color)}
                  />
                  <div 
                    className={`w-5 h-5 rounded-full border shadow-sm transition-transform group-hover:scale-110 ${
                      selectedColors.includes(color) ? 'ring-2 ring-black ring-offset-2' : 'border-gray-300'
                    }`} 
                    style={{ backgroundColor: getColorHex(color) }} 
                  />
                  <span className="text-sm text-gray-700">{color}</span>
                </label>
              ))}
            </div>
          </div>
          <hr className="border-gray-200" />
        </>
      )}

      {/* Properties / Tags */}
      {availableTags.length > 0 && (
        <>
          <div>
            <h4 className="font-medium text-sm mb-4">Properties</h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((prop: string) => (
                <button
                  key={prop}
                  onClick={() => toggleTag(prop)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                    selectedTags.includes(prop) 
                      ? 'bg-black text-white border-black' 
                      : 'bg-gray-100 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  {prop}
                </button>
              ))}
            </div>
          </div>
          <hr className="border-gray-200" />
        </>
      )}

      {/* Price */}
      <div>
        <h4 className="font-medium text-sm mb-4">Price</h4>
        <div className="flex justify-between text-sm font-medium mb-4">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
        
        <div className="relative h-6 flex items-center">
          <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
          <div 
            className="absolute h-1 bg-black rounded-full" 
            style={{ 
              left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`, 
              right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%` 
            }} 
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full cursor-pointer z-20"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full cursor-pointer z-20"
          />
        </div>
      </div>
    </div>
  );
}