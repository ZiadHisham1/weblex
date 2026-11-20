'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteProductButton({
  tenantId,
  productId,
}: {
  tenantId: string;
  productId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/t/${tenantId}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Delete failed');
        return;
      }
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete product"
    >
      {deleting ? (
        <span className="text-xs">...</span>
      ) : (
        <div className='w-5 h-5'>
         <span 
            className="block cursor-pointer w-4 h-4 bg-gray-400 group-hover:bg-red-600 transition-colors"
            style={{
              maskImage: "url('/icons/trash.svg')",
              WebkitMaskImage: "url('/icons/trash.svg')",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
        </div>
      )}
    </button>
  );
}