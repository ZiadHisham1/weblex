// app/dashboard/t/[tenantId]/orders/[orderId]/payment-section.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign } from 'lucide-react';

export function PaymentSection({
  tenantId,
  orderId,
  paymentCollection,
  payment,
  order,
  paidTotal,
  outstandingAmount,
}: {
  tenantId: string;
  orderId: string;
  paymentCollection: any;
  payment: any;
  order: any;
  paidTotal: number;
  outstandingAmount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 👇 New state for the deposit amount (in major units, e.g., 50.00)
  const [customAmount, setCustomAmount] = useState<string>('');

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currencyCode ?? 'usd').toUpperCase(),
    }).format(amount / 100); 
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleCapture = async (isDeposit: boolean) => {
    setLoading(true);
    setError(null);

    try {
      // Convert the user's input (e.g., "50.00") to minor units (e.g., 5000)
      let amountToCapture = payment.amount; 
      
      if (isDeposit) {
        const parsedAmount = parseFloat(customAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Please enter a valid deposit amount');
        }
        amountToCapture = Math.round(parsedAmount * 100);
      }

      const res = await fetch(`/api/t/${tenantId}/orders/${orderId}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToCapture }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to capture payment');
      }

      router.refresh(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Payments</h2>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
          paymentCollection?.status === 'completed' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {paymentCollection?.status || 'Not Paid'}
        </span>
      </div>
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        {payment ? (
          <>
            <div className="flex items-center justify-between text-sm py-2">
              <div className="flex items-center gap-4">
                <span className="font-mono text-gray-900">#{payment.id.slice(-7)}</span>
                <span className="text-gray-500">{formatDate(payment.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{payment.provider_id}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  payment.captured_at ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {payment.captured_at ? 'Captured' : 'Pending'}
                </span>
                <span className="font-medium">{formatCurrency(payment.amount, order.currency_code)}</span>
              </div>
            </div>

            {/* Capture Actions */}
            {!payment.captured_at && paymentCollection?.status !== 'completed' && (
              <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-blue-800">
                    ↳ Payment is ready to be captured. Authorized: {formatCurrency(payment.amount, order.currency_code)}
                  </span>
                  <button 
                    onClick={() => handleCapture(false)}
                    disabled={loading}
                    className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Capture Full Amount
                  </button>
                </div>
                
                {/* 👇 Deposit UI */}
                <div className="flex items-center gap-3 pt-3 border-t border-blue-200">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      placeholder="Custom deposit amount (e.g. 50.00)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={() => handleCapture(true)}
                    disabled={loading || !customAmount}
                    className="bg-white border border-gray-300 text-gray-900 text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Capture Deposit
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">No payments recorded.</p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Total paid by customer</span>
            <span className="text-gray-900">{formatCurrency(paidTotal, order.currency_code)}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-900">
            <span>Total pending</span>
            <span>{formatCurrency(outstandingAmount, order.currency_code)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}