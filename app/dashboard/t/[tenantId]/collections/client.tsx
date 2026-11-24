'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { CollectionIcon } from '@/components/icons/CollectionIcon';

type Collection = {
  id: string;
  title: string;
  handle: string;
  metadata?: Record<string, any>;
  created_at: string;
  products?: any[];
};

export function CollectionsClient({
  tenantId,
  initialCollections,
  error,
  provisioning,
}: {
  tenantId: string;
  initialCollections: Collection[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          handle: handle.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }

      setTitle('');
      setHandle('');
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Products inside it will NOT be deleted.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/t/${tenantId}/collections/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Failed to delete');
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto  space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CollectionIcon className='w-4 h-4' />
          <h1 className="text-xl font-semibold text-gray-900">Collections</h1>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Add collection
        </button>
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
          {initialCollections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No collections yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create one to start grouping your products.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 font-normal w-12">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 font-normal w-1/3">Title</th>
                    <th className="px-4 py-3 font-normal text-center">Products</th>
                    <th className="px-4 py-3 font-normal">Conditions</th>
                    <th className="px-4 py-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialCollections.map((collection) => {
                    const isAutomated = collection.title.toLowerCase().includes('automated');
                    const productCount = collection.products?.length ?? 0;

                    return (
                      <tr key={collection.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-white">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </div>
                            <span className="font-medium text-gray-900">{collection.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-center font-medium">
                          {productCount}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {isAutomated ? (
                            <div className="flex flex-col text-xs space-y-0.5">
                              <span>Price is less than E£800.00</span>
                              <span>Price is greater than E£200.00</span>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(collection.id)}
                            disabled={deletingId === collection.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Delete collection"
                          >
                            {deletingId === collection.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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

      {/* 👇 Premium Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-gray-200 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Create Collection</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow placeholder:text-gray-400"
                />
              </div>

              {/* Handle Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Handle (URL slug)
                </label>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow placeholder:text-gray-400"
                />
              </div>

              {/* Error Message */}
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
                  {formError}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}