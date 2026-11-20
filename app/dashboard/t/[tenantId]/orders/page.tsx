// app/dashboard/t/[tenantId]/orders/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { loadIcons } from '@/lib/icons';
import { Plus } from 'lucide-react';
import { CreateOrderButton } from './create-order-button'; // 👈 Import the new component

export default async function ordersPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let orders: any[] = [];
  let products: any[] = []; // 👈 Store products for the modal
  let error: string | null = null;
  let provisioning = false;

  if (
    tenant.medusa?.provisioningState === 'PENDING' ||
    tenant.medusa?.provisioningState === 'PROVISIONING'
  ) {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error = 'Store not ready. Provisioning state: ' + (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk, binding } = await getMedusaAdminClient(tenantId);
      
      // Fetch Orders
      const result = await sdk.admin.order.list({
        sales_channel_id: [binding.salesChannelId],
        fields: '*customer',
      } as any);
      orders = result.orders;

      // 👇 Fetch Products for the modal
      const prodRes = await sdk.admin.product.list({
        limit: 100,
        fields: 'id,title,variants.id,variants.title,variants.sku',
      });
      // Filter to ensure they belong to the sales channel
      products = (prodRes.products || []).filter((p: any) =>
        p.sales_channels?.some((sc: any) => sc.id === binding.salesChannelId) || true // Fallback to show all if channels aren't returned
      );
    } catch (e: any) {
      console.error('[orders Dashboard] Failed to load:', e.response?.data || e);
      error = e?.message ?? 'Failed to load data';
    }
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currencyCode ?? 'usd').toUpperCase(),
    }).format(amount / 100); // 👈 Remember to divide by 100 for Medusa v2
  };

  const icons = loadIcons(['inbox_icon.svg']);
  const inboxIcon = icons['inbox_icon.svg'];

  return (
    <div className="mx-auto space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Icon svg={inboxIcon} 
            strokeWidth={1.5}
            className={[
                'shrink-0 self-start w-5 h-5 mt-2 mb-2 me-2 md:mt-1 md:mb-1',
                '[&_svg]:w-full [&_svg]:h-full [&_svg]:block',
                'transition-opacity duration-150',
                'text-black opacity-100',
            ].join(' ')}
            />
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
            Export
          </button>
          
          {/* 👇 Link to the new page */}
          <Link 
            href={`/dashboard/t/${tenantId}/orders/create`}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create order
          </Link>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-1 text-sm text-gray-600 border-r border-gray-200 pr-4 cursor-pointer hover:text-black">
            <SlidersHorizontal className="w-4 h-4" />
            <span>All</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search and filter" 
              className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
        </div>
        <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* States */}
      {provisioning && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
          Your store is being set up. This takes about 10 seconds. Refresh to check.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {!provisioning && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No order orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-normal w-12">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 font-normal">order order</th>
                    <th className="px-4 py-3 font-normal">PO number</th>
                    <th className="px-4 py-3 font-normal cursor-pointer hover:text-black">
                      <div className="flex items-center gap-1">
                        Date <span className="text-xs">↓</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 font-normal">Customer</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const customerName = order.customer
                      ? `${order.customer.first_name ?? ''} ${order.customer.last_name ?? ''}`.trim() || order.customer.email
                      : order.email || 'No customer';
                    
                    const companyName = order.customer?.company_name;
                    
                    const date = new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors group relative">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="rounded border-gray-300 relative z-10" />
                        </td>
                        
                        {/* order Order ID */}
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {/* 👇 Absolute link covering the row */}
                          <Link 
                            href={`/dashboard/t/${tenantId}/orders/${order.id}`} 
                            className="absolute inset-0 z-0"
                          />
                          <span className="relative z-10 group-hover:underline">
                            #{order.display_id ?? order.id.slice(-6)}
                          </span>
                        </td>

                        {/* PO Number */}
                        <td className="px-4 py-4 text-gray-500">
                          {order.customer.phone || '-'}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-gray-600">
                          {date}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-900">{customerName}</span>
                            {companyName && (
                              <span className="text-gray-500 text-xs">{companyName}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {order.fulfillment_status === "delivered" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                              Delivered
                            </span>
                          ) : order.fulfillment_status === "fulfilled" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                              Fulfilled
                            </span>
                          )  : order.fulfillment_status === "shipped" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium">
                              shipped
                            </span>
                            ): ( 
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                              Open
                            </span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4 text-right font-medium text-gray-900">
                          {formatCurrency(order.total ?? 0, order.currency_code)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}