'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Minus, Plus } from 'lucide-react';

type LineItem = {
  id: string;
  title: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant?: { id: string; title: string };
};

type Cart = {
  id: string;
  items: LineItem[];
  total: number;
  currency_code: string;
};

function deriveCheckoutBase(): string {
  if (typeof window === 'undefined') return '/checkout';
  const host = window.location.hostname.toLowerCase();
  const parts = host.split('.');
  // acme.localhost -> subdomain "acme"
  if (parts.length >= 2 && host.endsWith('.localhost')) {
    const sub = parts[0];
    return `${window.location.protocol}//${sub}.${parts.slice(1).join('.')}${window.location.port ? `:${window.location.port}` : ''}/checkout`;
  }
  // acme.example.com -> subdomain "acme"
  if (parts.length >= 3) {
    const sub = parts[0];
    return `${window.location.protocol}//${sub}.${parts.slice(1).join('.')}${window.location.port ? `:${window.location.port}` : ''}/checkout`;
  }
  // No subdomain (root domain) — fall back to path-relative checkout
  return `${window.location.origin}/checkout`;
}

export function CartDrawer({
  open,
  onClose,
  checkoutBase,
}: {
  open: boolean;
  onClose: () => void;
  /** Optional override for the checkout URL. If omitted, derived from hostname. */
  checkoutBase?: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/medusa/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const updateQty = async (lineId: string, quantity: number) => {
    await fetch('/api/medusa/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_id: lineId, quantity }),
    });
    await load();
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const removeLine = async (lineId: string) => {
    await fetch(`/api/medusa/cart?line_id=${encodeURIComponent(lineId)}`, {
      method: 'DELETE',
    });
    await load();
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  if (!open) return null;

  const fmt = (n: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency ?? 'usd').toUpperCase(),
    }).format(n);

  const checkoutHref = checkoutBase ?? deriveCheckoutBase();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Your cart</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-center text-gray-500 py-8">Loading…</p>}

          {!loading && (!cart || cart.items.length === 0) && (
            <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
          )}

          {!loading && cart && cart.items.length > 0 && (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variant?.title && item.variant.title !== 'Default' && (
                      <p className="text-xs text-gray-500">{item.variant.title}</p>
                    )}
                    <p className="text-sm text-gray-900 mt-1">
                      {fmt(item.unit_price, cart.currency_code)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 border rounded hover:bg-gray-50 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeLine(item.id)}
                        className="ml-auto p-1 text-gray-400 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <footer className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">
                {fmt(cart.total, cart.currency_code)}
              </span>
            </div>
            {/*
              Use a plain <a> with an absolute URL. On the storefront
              (acme.localhost:3000) this resolves to
              http://acme.localhost:3000/checkout.
            */}
            <a
              href={checkoutHref}
              onClick={onClose}
              className="block text-center w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Checkout
            </a>
          </footer>
        )}
      </aside>
    </>
  );
}