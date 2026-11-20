// app/dashboard/t/[tenantId]/orders/create-order-modal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';

export function CreateOrderModal({
  tenantId,
  products,
  isOpen,
  onClose,
}: {
  tenantId: string;
  products: any[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Selected items state: { variantId: string, quantity: number, title: string }
  const [items, setItems] = useState<{ variantId: string; quantity: number; title: string }[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const handleAddItem = () => {
    if (!selectedVariantId) return;
    
    // Find the selected variant across all products
    let selectedVariant: any = null;
    let selectedProduct: any = null;
    
    for (const p of products) {
      const v = p.variants?.find((v: any) => v.id === selectedVariantId);
      if (v) {
        selectedVariant = v;
        selectedProduct = p;
        break;
      }
    }

    if (!selectedVariant) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === selectedVariantId);
      if (existing) {
        return prev.map((i) => 
          i.variantId === selectedVariantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { 
        variantId: selectedVariantId, 
        quantity: 1, 
        title: `${selectedProduct.title} - ${selectedVariant.title}` 
      }];
    });
    setSelectedVariantId('');
  };

  const handleRemoveItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Create Draft Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <input
              type="email"
              placeholder="Email Address (required)"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Add Items */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Add Items</h3>
            
            <div className="flex gap-2">
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select a product variant...</option>
                {products.map((p) => (
                  <optgroup key={p.id} label={p.title}>
                    {p.variants?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.title} {v.sku ? `(${v.sku})` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedVariantId}
                className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Selected Items List */}
            {items.length > 0 && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.variantId} className="p-3 flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">{item.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.variantId)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0 || !email}
            className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}