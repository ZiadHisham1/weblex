// app/dashboard/t/[tenantId]/orders/[orderId]/edit/edit-client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  ChevronDown,
  Loader2,
  Trash2,
} from 'lucide-react';

export function EditOrderClient({ 
  tenantId, 
  order, 
  products, 
  region 
}: { 
  tenantId: string; 
  order: any; 
  products: any[]; 
  region: any;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 👇 Initialize with fallback
  const initialEmail = order.email || order.customer?.email || '';
  const [email, setEmail] = useState(initialEmail);
  
  const [firstName, setFirstName] = useState(
    order.shipping_address?.first_name || order.customer?.first_name || ''
  );
  const [lastName, setLastName] = useState(
    order.shipping_address?.last_name || order.customer?.last_name || ''
  );
  
  const [items, setItems] = useState(
    order.items?.map((item: any) => ({
      variantId: item.variant_id,
      quantity: item.quantity,
      title: `${item.title} - ${item.variant_title || 'Default'}`,
      price: item.unit_price,
    })) || []
  );
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) return;

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

    const price = selectedVariant.prices?.[0]?.amount || 0;

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
        title: `${selectedProduct.title} - ${selectedVariant.title}`,
        price
      }];
    });
    setSelectedVariantId('');
  };

  const handleRemoveItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const handleSave = async () => {
    if (!email) {
      setError('Email is required to save a draft order.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item to the draft order.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/t/${tenantId}/orders/${order.id}`, {
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
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      router.push(`/dashboard/t/${tenantId}/orders/${order.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: region?.currency_code?.toUpperCase() || 'EGP',
    }).format(amount / 100);
  };

  return (
    <div className="flex flex-col p-0 min-h-screen">
      
      {/* Sticky Header */}
      <header className="relative z-40 bg-white">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Link href={`/dashboard/t/${tenantId}/orders/${order.id}`} className="hover:text-black p-1 border border-gray-200 rounded-md">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-1 hover:text-black cursor-pointer">
              <span>Orders</span>
            </div>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">Edit #{order.display_id}</span>
          </div>

          {/* Center Actions */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 rounded-full px-2 py-1 shadow-lg">
            <span className="text-xs text-gray-300 px-3">Unsaved changes</span>
            <Link
              href={`/dashboard/t/${tenantId}/orders/${order.id}`}
              className="text-xs text-white px-3 py-1 hover:bg-white/10 rounded-full transition-colors"
            >
              Discard
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8 flex gap-8">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">#{order.display_id}</h1>
            <p className="text-sm text-gray-500 mt-1">Editing order</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Products Section */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Products</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              
              {items.length > 0 && (
                <div className="mb-4 divide-y divide-gray-100 border-b border-gray-100 pb-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex justify-between items-center py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                        <button onClick={() => handleRemoveItem(item.variantId)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddItem} className="flex gap-2">
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select a product to add...</option>
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
                  type="submit"
                  disabled={!selectedVariantId}
                  className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Payment</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 text-sm">
              <div className="flex justify-between text-gray-900">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatCurrency(subtotal)} {region?.currency_code?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="w-[300px] space-y-6 pt-4">
          
          {/* Customer Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Customer</label>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black" 
              />
            </div>
            
            {email && (
              <div className="space-y-2 text-sm pt-2">
                <div className="flex gap-2">
                  <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
                  <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}