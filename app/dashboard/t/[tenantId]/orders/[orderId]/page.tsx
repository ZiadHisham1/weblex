// app/dashboard/t/[tenantId]/orders/[orderId]/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { 
  ChevronRight, 
  MoreHorizontal, 
  Inbox, 
  Copy, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PaymentSection } from './payment-section'; // 👈 Import the new component
import { FulfillSection } from './fulfill-section';
import { SummaryHeader } from './summary-header';
import { CustomerCard } from './customer-card';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string; orderId: string }>;
}) {
  const { tenantId, orderId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let order: any = null;
  let error: string | null = null;

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    
    // Fetch the full order details including items, customer, and addresses
    const result = await sdk.admin.order.retrieve(orderId, {
      fields: '*items,*customer,*shipping_address,*billing_address,*payment_collections,*payment_collections.payments,*fulfillments,*shipping_methods',
    });
    order = result.order;
  } catch (e: any) {
    console.error('[Order Detail] Failed to load:', e.response?.data || e);
    error = e?.message ?? 'Failed to load order details';
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading order: {error}</p>
        <Link href={`/dashboard/t/${tenantId}/orders`} className="text-blue-600 hover:underline mt-4 inline-block">
          Return to orders
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currencyCode ?? 'usd').toUpperCase(),
    }).format(amount / 100); // Medusa v2 stores amounts in minor units (cents)
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

  const customerName = order.customer 
    ? `${order.customer.first_name ?? ''} ${order.customer.last_name ?? ''}`.trim() || order.customer.email
    : order.email || 'Guest';

  // Extract payment details safely
  const paymentCollection = order.payment_collections?.[0];
  const payment = paymentCollection?.payments?.[0];
  
  const paidTotal = order.summary?.paid_total || 0;
  // Use accounting_total if pending_difference is 0 but not fully paid
  const outstandingAmount = paymentCollection?.status === 'completed' 
    ? 0 
    : (order.summary?.pending_difference || order.total - paidTotal);

  return (
    <div className="mx-auto pb-20 flex flex-col justify-center">
      
      {/* 1. Header Breadcrumb & Actions */}
      <header className="flex items-center justify-between mb-6 pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/dashboard/t/${tenantId}/orders`} className="hover:text-black flex items-center gap-1">
            <Inbox className="w-4 h-4" /> Orders
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium">#{order.display_id ?? order.id.slice(-6)}</span>
        </div>
        
      </header>

     <div className=' justify-center flex'>
       <div className="w-[70%] justify-center grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* LEFT COLUMN: Main Details */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className=" bg-white rounded-xl">
             {/* 👇 Replace the static header with the new component */}
            <SummaryHeader tenantId={tenantId} orderId={orderId} />
            
            <div className="py-4 space-y-4">
              {/* Items */}
              <div className="space-y-3 border bg-gray-100 border-gray-300 rounded-xl p-5" >
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
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{formatCurrency(item.unit_price, order.currency_code)}</p>
                      <p className="text-xs text-gray-500">x {item.quantity}</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-sm font-medium">{formatCurrency(item.total, order.currency_code)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-gray-100 rounded-xl p-5">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(order.item_subtotal, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">Shipping Subtotal <ChevronDown className="w-3 h-3" /></span>
                    <span className="text-gray-900">{formatCurrency(order.shipping_subtotal, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax Total</span>
                    <span className="text-gray-900">{formatCurrency(order.tax_total, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-100">
                    <span>Order Total</span>
                    <span>{formatCurrency(order.total, order.currency_code)}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Discount Total</span>
                    <span className="text-gray-900">{formatCurrency(order.discount_total || 0, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total After Discount</span>
                    <span className="text-gray-900">{formatCurrency(order.total - (order.discount_total || 0), order.currency_code)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Paid Total</span>
                    <span className="text-gray-900">{formatCurrency(paidTotal, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900">
                    <span>Outstanding amount</span>
                    <span>{formatCurrency(outstandingAmount, order.currency_code)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Section (Client Component) */}
          <PaymentSection 
            tenantId={tenantId}
            orderId={orderId}
            paymentCollection={paymentCollection}
            payment={payment}
            order={order}
            // 👇 REMOVED formatCurrency and formatDate
            paidTotal={paidTotal}
            outstandingAmount={outstandingAmount}
          />

          {/* 👇 REPLACED WITH THE CLIENT COMPONENT */}
          <FulfillSection
            tenantId={tenantId}
            orderId={orderId}
            order={order}
          />
        </div>

        {/* RIGHT COLUMN: Customer & Activity */}
        <div className="space-y-6">
          
          {/* Customer Card */}
          <CustomerCard 
            tenantId={tenantId} 
            order={order} 
            customerName={customerName} 
          />

          {/* Activity Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-4">
              <div className="relative border-l border-gray-200 ml-2 space-y-6 pb-2">
                
                {order.payment_status === 'authorized' && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Awaiting payment</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(outstandingAmount, order.currency_code)}</p>
                      </div>
                      <span className="text-xs text-gray-400">Recently</span>
                    </div>
                  </div>
                )}

                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order placed</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(order.total, order.currency_code)}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
     </div>
    </div>
  );
}