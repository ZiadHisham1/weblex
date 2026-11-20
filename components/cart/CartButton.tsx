'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartDrawer } from './CartDrawer';

export function CartButton() {
  const [itemCount, setItemCount] = useState(0);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch('/api/medusa/cart');
      if (!res.ok) return;
      const data = await res.json();
      const count = (data.cart?.items ?? []).reduce(
        (sum: number, i: any) => sum + (i.quantity ?? 0),
        0,
      );
      setItemCount(count);
    } catch {}
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}