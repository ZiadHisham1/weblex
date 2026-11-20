// app/dashboard/t/[tenantId]/orders/[orderId]/summary-header.tsx
'use client';

import { useRouter } from 'next/navigation';
import HoverMenu from '@/components/ui/hoverableButton';

export function SummaryHeader({
  tenantId,
  orderId,
}: {
  tenantId: string;
  orderId: string;
}) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dashboard/t/${tenantId}/orders/${orderId}/edit`);
  };

  return (
    <div className="flex items-center justify-between py-1 border-gray-200">
      <h2 className="font-semibold text-gray-900">Summary</h2>
      <HoverMenu 
        editable={true} 
        removable={true} 
        onEdit={handleEdit}
      />
    </div>
  );
}