'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowUp } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
  // Optional: let user toggle if multiple can be open at once (defaults to false)
  allowMultipleOpen?: boolean;
}

export function FaqAccordion({
  items = [],
  allowMultipleOpen = false,
}: FaqAccordionProps) {
  // Track open items. If allowing multiple, we store an array of indexes.
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-16">
        <p className="text-gray-500 text-center">Add FAQ items in the editor.</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-4 md:gap-5">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        
        return (
          <div 
            key={index}
            className="w-full bg-white border border-gray-300 rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Header / Trigger */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 md:p-7 text-left focus:outline-none group"
            >
              <span className="text-lg md:text-xl text-gray-900 font-normal transition-colors group-hover:text-black">
                {item.question}
              </span>
              <span className="shrink-0 ml-4 text-gray-800">
                {isOpen ? (
                  <ArrowUp className="w-6 h-6 stroke-[1.5]" />
                ) : (
                  <ArrowRight className="w-6 h-6 stroke-[1.5]" />
                )}
              </span>
            </button>

            {/* Expandable Content */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-600">
                  {/* Divider line */}
                  <hr className="border-gray-200 mb-4" />
                  <p className="leading-relaxed text-base md:text-lg">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}