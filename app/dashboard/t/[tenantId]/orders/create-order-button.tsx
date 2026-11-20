// app/dashboard/t/[tenantId]/orders/create-order-button.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateOrderModal } from './create-order-modal';

export function CreateOrderButton({ tenantId, products }: { tenantId: string; products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create order
      </button>

      <CreateOrderModal
        tenantId={tenantId}
        products={products}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}