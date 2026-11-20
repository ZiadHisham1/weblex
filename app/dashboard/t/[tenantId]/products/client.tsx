// app/dashboard/t/[tenantId]/products/products-client.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Eye, Plus } from 'lucide-react';
import { DeleteProductButton } from '@/components/products/DeleteProductButton';
import { Icon } from '@/components/ui/Icon';
import { Clock } from 'lucide-react';

export function ProductsClient({
  tenantId,
  initialProducts,
  productsIcon,
}: {
  tenantId: string;
  initialProducts: any[];
  productsIcon: string;
}) {
  const [search, setSearch] = useState('');

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // 👇 Filter products based on the search input
  const filteredProducts = initialProducts.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.variants?.some((v: any) => v.sku?.toLowerCase().includes(query))
    );
  });

  return (
    <>
    

      {/* Header */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon svg={productsIcon} 
            strokeWidth={1.5}
            className="shrink-0 w-5 h-5 text-black"
          />
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2">
            <Eye className="w-4 h-4" /> View as
          </button>
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
            Import
          </button>
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
            Export
          </button>
          <Link
            href={`/dashboard/t/${tenantId}/products/new`}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add product
          </Link>
        </div>
      </header>

      {/* Metrics Bar (Stays Server-Side) */}
      <div className="flex items-center gap-8 border-b border-gray-200 pb-6 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-700 border-r border-gray-200 pr-8">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium">30 days</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Average sell-through rate</p>
          <p className="text-sm font-medium text-gray-900">0%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Products by days of inventory remaining</p>
          <p className="text-sm font-medium text-gray-500">No data</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">ABC product analysis</p>
          <p className="text-sm font-medium text-gray-900 underline decoration-blue-500 decoration-2 underline-offset-4">
            {formatCurrency(0, 'EGP')} C
          </p>
        </div>
      </div>

      {/* 👇 Functional Search Bar */}
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
              placeholder="Search products by title or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-xl bg-gray-50 mt-4">
          <p className="text-gray-500">
            {search ? 'No products match your search.' : 'No products yet.'}
          </p>
          {!search && (
            <Link href={`/dashboard/t/${tenantId}/products/new`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-normal w-12">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 font-normal w-1/4">Product</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Inventory</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal text-center">Channels</th>
                  <th className="px-4 py-3 font-normal text-center">Catalogs</th>
                  <th className="px-4 py-3 font-normal">Product type</th>
                  <th className="px-4 py-3 font-normal">Vendor</th>
                  <th className="px-4 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const variantCount = p.variants?.length ?? 0;
                  const totalInventory = (p.variants ?? []).reduce((sum: number, v: any) => {
                    const variantStock = (v.inventory_items ?? []).reduce((iSum: number, item: any) => {
                      const levels = item.inventory?.location_levels ?? [];
                      const stock = levels.reduce((lSum: number, level: any) => lSum + (level.stocked_quantity || 0), 0);
                      return iSum + stock;
                    }, 0);
                    return sum + variantStock;
                  }, 0);

                  const status = p.status || 'draft';
                  const statusColor = 
                    status === 'published' ? 'bg-green-100 text-green-700' : 
                    status === 'draft' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Icon svg={productsIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <Link 
                            href={`/dashboard/t/${tenantId}/products/${p.id}/edit`}
                            className="font-medium text-gray-900 hover:text-blue-600 truncate max-w-[200px]"
                          >
                            {p.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor}`}>
                          {status === 'published' ? 'Active' : status}
                        </span>
                      </td>
                      <td className="px-4 text-gray-600">
                        {variantCount > 1 ? (
                          <span className={totalInventory === 0 ? 'text-red-500' : ''}>
                            {totalInventory} in stock for {variantCount} variants
                          </span>
                        ) : (
                          <span className={totalInventory === 0 ? 'text-red-500' : ''}>
                            {totalInventory} in stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-gray-600">{p.categories?.[0]?.name || ''}</td>
                      <td className="px-4 text-gray-600 text-center">{p.sales_channels?.length || 0}</td>
                      <td className="px-4 text-gray-600 text-center">{p.collection ? 1 : 0}</td>
                      <td className="px-4 text-gray-600">{p.type?.value || ''}</td>
                      <td className="px-4 text-gray-600">{p.metadata?.vendor || 'Default Vendor'}</td>
                      <td className="px-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/dashboard/t/${tenantId}/products/${p.id}/edit`}
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton tenantId={tenantId} productId={p.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}