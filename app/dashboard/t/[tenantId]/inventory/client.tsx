'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Package, Loader2, X, Check, Edit2 } from 'lucide-react';
import Link from 'next/link';

type InventoryRow = {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  thumbnail: string | null;
  sku: string | null;
  inventoryItemId: string;
  locationLevelId: string | null;
  onHand: number;
  available: number;
  committed: number;
  unavailable: number;
  incoming: number;
};

export function InventoryClient({
  tenantId,
  initialInventory,
  error,
  provisioning,
}: {
  tenantId: string;
  initialInventory: InventoryRow[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localInventory, setLocalInventory] = useState<InventoryRow[]>(initialInventory);

  // Filter inventory based on search
  const filteredInventory = useMemo(() => {
    if (!search.trim()) return localInventory;
    const searchLower = search.toLowerCase();
    return localInventory.filter(
      (row) =>
        row.productTitle.toLowerCase().includes(searchLower) ||
        row.variantTitle.toLowerCase().includes(searchLower) ||
        (row.sku ?? '').toLowerCase().includes(searchLower),
    );
  }, [localInventory, search]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    return {
      totalProducts: new Set(localInventory.map((r) => r.productId)).size,
      totalOnHand: localInventory.reduce((sum, r) => sum + r.onHand, 0),
      totalAvailable: localInventory.reduce((sum, r) => sum + r.available, 0),
      totalCommitted: localInventory.reduce((sum, r) => sum + r.committed, 0),
      totalIncoming: localInventory.reduce((sum, r) => sum + r.incoming, 0),
    };
  }, [localInventory]);

  const startEditing = (row: InventoryRow) => {
    setEditingId(row.id);
    setEditValue(String(row.onHand));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveInventory = async (row: InventoryRow) => {
    const newQty = parseInt(editValue, 10);
    if (isNaN(newQty) || newQty < 0) {
      alert('Please enter a valid quantity (0 or greater)');
      return;
    }

    setSavingId(row.id);
    try {
      const res = await fetch(`/api/t/${tenantId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_item_id: row.inventoryItemId,
          stocked_quantity: newQty,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Failed to update inventory');
        return;
      }

      // Optimistically update local state
      setLocalInventory((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                onHand: newQty,
                available: newQty - r.committed,
              }
            : r,
        ),
      );
      setEditingId(null);
      setEditValue('');
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? 'Failed to update');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
            Export
          </button>
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
            Import
          </button>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="flex items-center gap-8 border-b border-gray-200 pb-6">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Total products</p>
          <p className="text-sm font-medium text-gray-900">{metrics.totalProducts}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Total on hand</p>
          <p className="text-sm font-medium text-gray-900">{metrics.totalOnHand}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Available</p>
          <p className="text-sm font-medium text-gray-900">{metrics.totalAvailable}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Committed</p>
          <p className="text-sm font-medium text-gray-900">{metrics.totalCommitted}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Incoming</p>
          <p className="text-sm font-medium text-gray-900">{metrics.totalIncoming}</p>
        </div>
      </div>

      {/* Provisioning / Error states */}
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

      {!provisioning && !error && (
        <>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">
                  {search ? 'No inventory items match your search.' : 'No inventory items found.'}
                </p>
                {!search && (
                  <Link
                    href={`/dashboard/t/${tenantId}/products/new`}
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Add your first product
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 font-normal w-12">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="px-4 py-3 font-normal w-1/4">Product</th>
                      <th className="px-4 py-3 font-normal">SKU</th>
                      <th className="px-4 py-3 font-normal text-center">Unavailable</th>
                      <th className="px-4 py-3 font-normal text-center">Committed</th>
                      <th className="px-4 py-3 font-normal text-center">Available</th>
                      <th className="px-4 py-3 font-normal text-center">On hand</th>
                      <th className="px-4 py-3 font-normal text-center">Incoming</th>
                      <th className="px-4 py-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((row) => {
                      const isEditing = editingId === row.id;
                      const isSaving = savingId === row.id;
                      const displayTitle =
                        row.variantTitle && row.variantTitle !== 'Default'
                          ? `${row.productTitle} — ${row.variantTitle}`
                          : row.productTitle;

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors group h-14"
                        >
                          <td className="px-4">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>

                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-10 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                                {row.thumbnail ? (
                                  <img
                                    src={row.thumbnail}
                                    alt={row.productTitle}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <Link
                                href={`/dashboard/t/${tenantId}/products/${row.productId}/edit`}
                                className="font-medium text-gray-900 hover:text-blue-600 truncate max-w-[300px]"
                              >
                                {displayTitle}
                              </Link>
                            </div>
                          </td>

                          <td className="px-4 text-gray-600 font-mono text-xs">
                            {row.sku ?? 'No SKU'}
                          </td>

                          <td className="px-4 text-gray-600 text-center">
                            {row.unavailable}
                          </td>

                          <td className="px-4 text-gray-600 text-center">
                            {row.committed}
                          </td>

                          <td
                            className={`px-4 text-center font-medium ${
                              row.available === 0 ? 'text-red-500' : 'text-gray-900'
                            }`}
                          >
                            {row.available}
                          </td>

                          {/* On hand - editable */}
                          <td className="px-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveInventory(row);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                                />
                                <button
                                  onClick={() => saveInventory(row)}
                                  disabled={isSaving}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                  title="Save"
                                >
                                  {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={isSaving}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900">
                                {row.onHand}
                              </span>
                            )}
                          </td>

                          <td className="px-4 text-gray-600 text-center">
                            {row.incoming}
                          </td>

                          <td className="px-4 text-right">
                            {!isEditing && (
                              <button
                                onClick={() => startEditing(row)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit stock"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}