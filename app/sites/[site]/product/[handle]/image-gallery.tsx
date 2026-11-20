// app/sites/[site]/product/[handle]/image-gallery.tsx
'use client';

import { useState } from 'react';

export function ProductImageGallery({ 
  images, 
  title 
}: { 
  images: string[]; 
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="w-full lg:w-[55%] flex flex-col gap-6">
      {/* Main Image */}
      <div className="w-full aspect-[4/3] rounded-[32px] border border-black/50 overflow-hidden bg-gray-200 relative">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      
      {/* Thumbnails Gallery */}
      <div className="w-full h-[288px] bg-white rounded-[32px] border border-black/10 flex items-center gap-4 px-4 overflow-x-auto no-scrollbar">
        {images.map((imgUrl: string, index: number) => (
          <button
            key={index}
            onClick={() => setActiveImage(imgUrl)}
            className={`w-[240px] h-[240px] flex-shrink-0 rounded-[24px] border-[10px] overflow-hidden cursor-pointer transition-all bg-gray-200
              ${activeImage === imgUrl 
                ? 'border-[#eb6f6f] shadow-md' 
                : 'border-[#FDF9EC] hover:border-gray-300'
              }`}
          >
            <img 
              src={imgUrl} 
              alt={`${title} thumbnail ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}