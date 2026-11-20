'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Check } from 'lucide-react';

type Variant = { 
  id: string; 
  title: string; 
  price: string | null;
  thumbnail?: string | null; 
};

export function AddToCartButton({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!selectedId) return false;
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/medusa/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: selectedId, quantity }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to add (${res.status})`);
      }

      // Dispatch event so the CartDrawer / Header updates the cart icon count
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setStatus('success');
      
      return true; // Indicate success
    } catch (e: any) {
      setStatus('error');
      setError(e.message);
      return false;
    }
  };

  const onAddToCart = async () => {
    const success = await handleAddToCart();
    if (success) {
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const onBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      // 👇 FIXED: Just use the absolute root path. 
      // The proxy will automatically rewrite this to /sites/acme/checkout internally.
      router.push('/checkout');
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      
      {/* Color / Variant Selection */}
      {variants.length > 1 && (
        <div className="flex flex-col gap-4 mb-2">
          <h3 className="text-[20px] font-medium text-black uppercase">Options</h3>
          <div className="flex gap-4 flex-wrap">
            {variants.map((v, index) => (
              <div key={v.id} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={`w-16 h-16 rounded-[16px] overflow-hidden cursor-pointer border border-zinc-700 bg-gray-200 transition-all
                    ${selectedId === v.id 
                      ? 'outline outline-[2px] outline-black outline-offset-[3px]' 
                      : 'hover:ring-2 hover:ring-gray-400 opacity-80 hover:opacity-100'
                    }
                  `}
                >
                  <img 
                    src={v.thumbnail || `https://placehold.co/64x64/e5e5e5/999999?text=${index + 1}`} 
                    alt={v.title} 
                    className="w-full h-full object-cover" 
                  />
                </button>
                <span className="text-xs text-gray-500 text-center max-w-[64px] truncate">{v.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Row: Add to Cart + Quantity */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {/* Quantity Selector */}
        <div className="w-full sm:w-[144px] h-[48px] bg-white rounded-2xl flex items-center justify-between px-4 border border-black/20 select-none">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
            className="text-xl font-medium h-full hover:text-black/60 transition-colors px-2"
            disabled={status === 'loading'}
          >
            -
          </button>
          <span className="text-xl font-light h-full rounded-md bg-[#ebebeba1] flex justify-center text-center items-center w-[50px] text-black/60">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => q + 1)} 
            className="text-xl font-medium hover:text-black/60 transition-colors px-2"
            disabled={status === 'loading'}
          >
            +
          </button>
        </div>

        <button
          onClick={onAddToCart}
          disabled={status === 'loading' || !selectedId}
          className="w-full sm:w-[288px] h-[48px] bg-black text-white rounded-2xl flex items-center justify-center gap-3 text-[20px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {status === 'success' ? (
            <>
              <Check className="w-5 h-5" /> ADDED
            </>
          ) : status === 'loading' ? (
            'ADDING...'
          ) : (
            <>
              ADD TO CART
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Buy Now Button */}
      <button 
        onClick={onBuyNow}
        disabled={status === 'loading' || !selectedId}
        className="w-full h-[48px] bg-white border border-black/50 rounded-2xl text-black text-[20px] font-medium hover:bg-gray-50 transition-colors mt-2 disabled:opacity-50"
      >
        {status === 'loading' ? 'PROCESSING...' : 'BUY NOW'}
      </button>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}