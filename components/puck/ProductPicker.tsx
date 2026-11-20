'use client';

import { useState } from 'react';
import type { TenantProductOption } from '@/puck.config';
import { X } from 'lucide-react';

export function ProductPicker({
  value = [],
  onChange,
  options = [],
}: {
  value: string[];
  onChange: (val: string[]) => void;
  options: TenantProductOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleProduct = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedProducts = options.filter((o) => value.includes(o.id));

  return (
    <div className="relative">
      {/* Selected items display */}
      <div 
        className="flex flex-wrap gap-2 p-2 min-h-[40px] border border-gray-300 rounded-md bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedProducts.length === 0 ? (
          <span className="text-gray-400 text-sm self-center px-1">Select products...</span>
        ) : (
          selectedProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded">
              <span className="truncate max-w-[120px]">{p.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProduct(p.id);
                }}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No products available</div>
            ) : (
              options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(opt.id)}
                    onChange={() => toggleProduct(opt.id)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="truncate">{opt.title}</span>
                </label>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}