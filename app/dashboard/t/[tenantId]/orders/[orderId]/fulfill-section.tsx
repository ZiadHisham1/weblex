// app/dashboard/t/[tenantId]/orders/[orderId]/fulfill-section.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox, Loader2, CheckCircle2 } from 'lucide-react';

export function FulfillSection({
  tenantId,
  orderId,
  order,
}: {
  tenantId: string;
  orderId: string;
  order: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null); // track which action is loading
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currencyCode ?? 'usd').toUpperCase(),
    }).format(amount / 100);
  };

  const handleAction = async (action: 'fulfill' | 'ship' | 'deliver') => {
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/t/${tenantId}/orders/${orderId}/${action}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} order`);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  // Determine status
  const itemsToFulfill = order.items?.filter(
    (item: any) => (item.quantity - (item.detail?.fulfilled_quantity || 0)) > 0
  );
  const isFullyFulfilled = !itemsToFulfill || itemsToFulfill.length === 0;
  
  // Medusa statuses: not_fulfilled, partially_fulfilled, fulfilled, partially_shipped, shipped, partially_delivered, delivered, canceled
  const status = order.fulfillment_status;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Fulfillment</h2>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
          status === 'delivered' ? 'bg-green-100 text-green-700' :
          status === 'shipped' ? 'bg-blue-100 text-blue-700' :
          status === 'fulfilled' ? 'bg-indigo-100 text-indigo-700' :
          'bg-red-100 text-red-700'
        }`}>
          {status.replace(/_/g, ' ') || 'Awaiting fulfillment'}
        </span>
      </div>
      
      {error && (
        <div className="m-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="p-4 space-y-3">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Inbox className="w-4 h-4" /></div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.variant_title || 'Default'}</p>
            </div>
            <div className="text-right flex items-center gap-8">
              <span className="text-sm text-gray-900">{formatCurrency(item.unit_price, order.currency_code)}</span>
              <span className="text-sm text-gray-500">x {item.quantity}</span>
              <span className="text-sm font-medium w-24">{formatCurrency(item.total, order.currency_code)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        {/* 1. Fulfill Button */}
        {!isFullyFulfilled && (
          <button
            onClick={() => handleAction('fulfill')}
            disabled={!!loading}
            className="w-full bg-black text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'fulfill' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading === 'fulfill' ? 'Creating Fulfillment...' : 'Fulfill Items'}
          </button>
        )}

        {/* 2. Ship Button (only if fulfilled but not yet shipped) */}
        {status === 'fulfilled' && (
          <button
            onClick={() => handleAction('ship')}
            disabled={!!loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'ship' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading === 'ship' ? 'Creating Shipment...' : 'Mark as Shipped'}
          </button>
        )}

        {/* 3. Deliver Button (only if shipped but not yet delivered) */}
        {status === 'shipped' && (
          <button
            onClick={() => handleAction('deliver')}
            disabled={!!loading}
            className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'deliver' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading === 'deliver' ? 'Marking Delivered...' : 'Mark as Delivered'}
          </button>
        )}

        {/* 4. Delivered State */}
        {status === 'delivered' && (
          <div className="w-full flex items-center justify-center gap-2 py-2 text-green-700 font-medium bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="w-4 h-4" /> Order Delivered
          </div>
        )}
      </div>
    </div>
  );
}