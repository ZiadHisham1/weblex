'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Upload,
  User,
  Tag,
  Truck,
  Banknote,
  TagIcon,
  X,
  Loader2,
  TicketPercent,
} from 'lucide-react';
import { DiscountIcon } from '@/components/icons/DiscountIcon';

type Promotion = {
  id: string;
  code: string;
  status: string;
  is_automatic: boolean;
  type: string;
  usage_count?: number | null;
  application_method?: {
    type: string;
    target_type: string;
    description?: string;
    buy_rules_min_quantity?: number;
    apply_to_quantity?: number;
  };
};

export function DiscountsClient({
  tenantId,
  initialPromotions,
  error,
  provisioning,
}: {
  tenantId: string;
  initialPromotions: Promotion[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPromotions = initialPromotions.filter((promo) =>
    (promo.code ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, value: Number(value) }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }

      setCode('');
      setValue('10');
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (initialPromotions.length === 0) return;

    const headers = ['Code', 'Status', 'Method', 'Type', 'Used'];
    const rows = initialPromotions.map((p) =>
      [
        p.code ?? '',
        p.status ?? '',
        p.is_automatic ? 'Automatic' : 'Code',
        p.type ?? '',
        p.usage_count ?? 0,
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'discounts_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto  space-y-4">
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <DiscountIcon className='w-5 h-5' />
          <h1 className="text-xl font-semibold text-gray-900">Discounts</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create discount
          </button>
        </div>
      </header>

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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">
                {search ? 'No discounts match your search.' : 'No discounts found.'}
              </p>
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
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Method</th>
                    <th className="px-4 py-3 font-normal">Eligibility</th>
                    <th className="px-4 py-3 font-normal">Type</th>
                    <th className="px-4 py-3 font-normal text-center">Combinations</th>
                    <th className="px-4 py-3 font-normal text-right">Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPromotions.map((promo) => {
                    const isFreeShipping = promo.application_method?.type === 'free_shipping';
                    const isOrderLevel = promo.application_method?.target_type === 'order';
                    const isBuyXGetY = promo.type === 'buyget';

                    let typeLabel = 'Amount off product';
                    let TypeIcon = Tag;

                    if (isBuyXGetY) {
                      typeLabel = 'Buy X get Y';
                      TypeIcon = TagIcon;
                    } else if (isFreeShipping) {
                      typeLabel = 'Free shipping';
                      TypeIcon = Truck;
                    } else if (isOrderLevel) {
                      typeLabel = 'Amount off order';
                      TypeIcon = Banknote;
                    }

                    return (
                      <tr key={promo.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {promo.code ?? '—'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 max-w-[300px] truncate">
                              {promo.application_method?.description ||
                                (isBuyXGetY
                                  ? `Buy ${promo.application_method?.buy_rules_min_quantity || 1}, get ${promo.application_method?.apply_to_quantity || 1} free`
                                  : '')}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium capitalize">
                            {promo.status ?? '—'}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-600 capitalize">
                          {promo.is_automatic ? 'Automatic' : 'Code'}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>All customers</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <TypeIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium">{typeLabel}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-gray-400 text-center">
                          <div className="flex justify-center gap-1.5 opacity-60">
                            <Tag className="w-4 h-4" />
                            <TagIcon className="w-4 h-4" />
                            <Truck className="w-4 h-4" />
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right font-medium text-gray-900">
                          {promo.usage_count ?? 0}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Create Discount</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Code <span className="text-red-600">*</span>
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER2026"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage Off <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
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
                  {isSubmitting ? 'Creating…' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
