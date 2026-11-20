// app/dashboard/t/[tenantId]/orders/[orderId]/customer-card.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import HoverMenu from '@/components/ui/hoverableButton';

export function CustomerCard({
  tenantId,
  order,
  customerName,
}: {
  tenantId: string;
  order: any;
  customerName: string;
}) {
  const router = useRouter();

  const handleEdit = () => {
    if (order.customer?.id) {
      router.push(`/dashboard/t/${tenantId}/customers/${order.customer.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-2">
        <h2 className="font-semibold text-gray-900">Customer</h2>
        {/* 👇 Use the client-side handler here */}
        <HoverMenu 
          editable={true} 
          removable={false} 
          onEdit={handleEdit}
        />
      </div>
      <div className='border border-gray-200 rounded-xl p-2'>
        <div className="p-4 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 w-24">ID</span>
            <span className="text-gray-900 text-right flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                {customerName.charAt(0).toUpperCase()}
              </div>
              {customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 w-24">Contact</span>
            <span className="text-gray-900 text-right flex items-center gap-2">
              {order.email}
              <Copy className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
            </span>
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-gray-500 w-24">Shipping address</span>
            <span className="text-gray-900 text-right flex items-start gap-2">
              <div>
                {order.shipping_address ? (
                  <>
                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                    {order.shipping_address.address_1}<br />
                    {order.shipping_address.address_2 && <>{order.shipping_address.address_2}<br /></>}
                    {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country_code?.toUpperCase()}
                  </>
                ) : 'No shipping address'}
              </div>
              <Copy className="w-3.5 h-3.5 text-gray-400 cursor-pointer mt-0.5" />
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-gray-500 w-24">Billing address</span>
            <span className="text-gray-900 text-right">
              {order.billing_address?.address_1 === order.shipping_address?.address_1 
                ? 'Same as shipping address' 
                : order.billing_address?.address_1 || 'Same as shipping address'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}