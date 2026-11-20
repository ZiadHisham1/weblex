// components/cart/QuickAddButton.tsx
'use client';

import { useState } from 'react';
import { ShoppingBag, Check, AlertCircle } from 'lucide-react';

export function QuickAddButton({
  variantId,
  disabled = false,
}: {
  variantId: string | null;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!variantId) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/medusa/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed (${res.status})`);
      }
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e: any) {
      setStatus('error');
      setError(e.message);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'success') {
    return (
      <button
        disabled
        className="w-full bg-green-600 text-white py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" /> Added
      </button>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleAdd}
        className="w-full bg-red-600 text-white py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700"
        title={error ?? undefined}
      >
        <AlertCircle className="w-4 h-4" /> Retry
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || status === 'loading' || !variantId}
      className="w-full bg-black/90 text-white backdrop-blur-sm py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingBag className="w-4 h-4" />
      {status === 'loading' ? 'Adding…' : 'Add to Cart'}
    </button>
  );
}