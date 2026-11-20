'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { CollectionIcon } from '@/components/icons/CollectionIcon';

type Category = {
  id: string;
  name: string;
  handle: string;
  description?: string;
  parent_category_id: string | null;
  is_active: boolean;
  rank: number;
  mpath: string;
  products?: any[];
};

export function CategoriesClient({
  tenantId,
  initialCategories,
  error,
  provisioning,
}: {
  tenantId: string;
  initialCategories: Category[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sort categories visually using mpath (to keep parents above children)
  const sortedCategories = useMemo(() => {
    return [...initialCategories].sort((a, b) => {
      if (a.mpath && b.mpath) {
        return a.mpath.localeCompare(b.mpath);
      }
      return a.name.localeCompare(b.name);
    });
  }, [initialCategories]);

  const getDepth = (mpath: string | null) => {
    if (!mpath) return 0;
    const matches = mpath.match(/\./g);
    return matches ? matches.length - 2 : 0; 
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim() || undefined,
          parent_category_id: parentId || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }

      setName('');
      setHandle('');
      setParentId('');
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Any child categories will become root categories. Products will NOT be deleted.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/t/${tenantId}/categories/${id}`, {
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
          <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Add category
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
          {initialCategories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No categories yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create one to start building your catalog.</p>
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
                    <th className="px-4 py-3 font-normal text-center">Status</th>
                    <th className="px-4 py-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCategories.map((category) => {
                    const depth = getDepth(category.mpath);
                    const productCount = category.products?.length ?? 0;
                    
                    return (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        
                        <td className="px-4 py-3" style={{ paddingLeft: `${Math.min(depth * 2 + 1, 8)}rem` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-white shrink-0">
                              {depth === 0 ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                </svg>
                              ) : (
                                <div className="w-3 h-3 border-l-2 border-b-2 border-gray-300 rounded-bl-sm translate-x-1 -translate-y-1"></div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{category.name}</span>
                              <span className="text-xs text-gray-400 font-mono mt-0.5">/{category.handle}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-600 text-center font-medium">
                          {productCount}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {category.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={deletingId === category.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Delete category"
                          >
                            {deletingId === category.id ? (
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Create Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Living Room"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">None (Root Category)</option>
                  {sortedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {"—".repeat(getDepth(cat.mpath))} {cat.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a parent to nest this category inside another one.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handle (URL slug)
                </label>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {formError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
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