'use client';

import { useRouter } from 'next/navigation';
import {
  Globe,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  Plus,
  X,
  SlidersHorizontal,
  DollarSign,
  Truck,
  Trash2,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { MarketIcon } from '@/components/icons/MarketIcon';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Check } from 'lucide-react'; // 👈 Import Check


type Region = {
  id: string;
  name: string;
  currency_code: string;
  automatic_taxes: boolean;
  is_tax_inclusive: boolean;
  countries: { id?: string; iso_2?: string; display_name?: string; name?: string }[];
  payment_providers?: { id: string }[];
};

type Country = { code: string; name: string; flag: string };
type Currency = { code: string; symbol: string; name: string };

export function MarketsClient({
  tenantId,
  initialRegions,
  countries,
  currencies,
  error,
  provisioning,
}: {
  tenantId: string;
  initialRegions: Region[];
  countries: Country[];
  currencies: Currency[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    name: '',
    currency_code: 'usd',
    countries: [] as string[],
    automatic_taxes: true,
    is_tax_inclusive: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const countryMap = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => map.set(c.code, c));
    return map;
  }, [countries]);

  const currencyMap = useMemo(() => {
    const map = new Map<string, Currency>();
    currencies.forEach((c) => map.set(c.code, c));
    return map;
  }, [currencies]);

  // Filter regions by search
  const filteredRegions = useMemo(() => {
    if (!search.trim()) return initialRegions;
    const q = search.toLowerCase();
    return initialRegions.filter((r) => {
      if (r.name.toLowerCase().includes(q)) return true;
      return (r.countries ?? []).some(
        (c) => (c.iso_2 ?? '').toLowerCase().includes(q) || (c.display_name ?? c.name ?? '').toLowerCase().includes(q),
      );
    });
  }, [initialRegions, search]);

  // Suggested markets: countries not yet included in any region
  const usedCountryCodes = useMemo(() => {
    const set = new Set<string>();
    initialRegions.forEach((r) => (r.countries ?? []).forEach((c) => c.iso_2 && set.add(c.iso_2.toLowerCase())));
    return set;
  }, [initialRegions]);

  const suggestedMarkets = useMemo(() => {
    return countries
      .filter((c) => !usedCountryCodes.has(c.code))
      .slice(0, 3) // Show up to 3 suggestions
      .map((c) => ({
        id: `suggest-${c.code}`,
        name: `${c.name} Market`,
        flag: c.flag,
        countryCode: c.code,
      }));
  }, [countries, usedCountryCodes]);

  const openCreateModal = (presetCountryCode?: string) => {
    setForm({
      name: presetCountryCode
        ? `${countryMap.get(presetCountryCode)?.name ?? ''} Market`
        : '',
      currency_code: 'usd',
      countries: presetCountryCode ? [presetCountryCode] : [],
      automatic_taxes: true,
      is_tax_inclusive: false,
    });
    setFormError(null);
    setCountrySearch('');
    setIsModalOpen(true);
  };

  const toggleCountry = (code: string) => {
    setForm((prev) => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter((c) => c !== code)
        : [...prev.countries, code],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) return setFormError('Market name is required');
    if (form.countries.length === 0) return setFormError('Select at least one country');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/t/${tenantId}/markets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          currency_code: form.currency_code,
          countries: form.countries,
          automatic_taxes: form.automatic_taxes,
          is_tax_inclusive: form.is_tax_inclusive,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (e: any) {
      setFormError(e.message ?? 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (regionId: string, regionName: string) => {
    if (!confirm(`Delete the "${regionName}" market? This cannot be undone.`)) return;

    setDeletingId(regionId);
    try {
      const res = await fetch(`/api/t/${tenantId}/markets/${regionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Failed to delete market');
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCountryOptions = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [countries, countrySearch]);

  const fmtCurrency = (code: string) => currencyMap.get(code.toLowerCase())?.symbol ?? code.toUpperCase();

  // Inside MarketsClient, add these:
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mx-auto space-y-4 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <MarketIcon className='w-5 h-5 !important' />
          <h1 className="text-xl font-semibold text-gray-900">Markets</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Graph view
          </button>
          <button
            onClick={() => openCreateModal()}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create market
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
          <ArrowUpDown className="w-4 h-4 text-gray-400 mr-2" />
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search in all markets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-gray-500 bg-transparent"
          />
        </div>
        <button className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 bg-white shadow-sm">
          <Filter className="w-4 h-4" />
        </button>
        <button className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 bg-white shadow-sm">
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Provisioning / Error */}
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

      {/* Markets Table */}
      {!provisioning && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {filteredRegions.length === 0 && suggestedMarkets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">
                {search ? 'No markets match your search.' : 'No markets yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => openCreateModal()}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Create your first market
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-normal flex items-center gap-1">
                    Market <ArrowUpDown className="w-3 h-3" />
                  </th>
                  <th className="px-4 py-3 font-normal w-1/4">Status</th>
                  <th className="px-4 py-3 font-normal w-1/3">Includes</th>
                  <th className="px-4 py-3 font-normal text-right pr-8">Customizations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegions.map((region) => {
                  const countryList = region.countries ?? [];
                  const firstCountry = countryList[0];
                  const flag = firstCountry?.iso_2 ? countryMap.get(firstCountry.iso_2.toLowerCase())?.flag : '🌍';
                  const includesLabel =
                    countryList.length === 1
                      ? countryMap.get(countryList[0].iso_2?.toLowerCase() ?? '')?.name ?? countryList[0].iso_2?.toUpperCase()
                      : `${countryList.length} regions`;

                  return (
                    <tr
                      key={region.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{region.name}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-medium">
                            {fmtCurrency(region.currency_code)} {region.currency_code.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{flag || '🌍'}</span>
                          <span>{includesLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3 text-gray-400 pr-2">
                          <DollarSign className="w-4 h-4" />
                          <Truck className="w-4 h-4" />
                          <SlidersHorizontal className="w-4 h-4" />
                          <button
                            onClick={() => handleDelete(region.id, region.name)}
                            disabled={deletingId === region.id}
                            className="p-1 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Delete market"
                          >
                            {deletingId === region.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Suggested Markets */}
                {suggestedMarkets.map((market) => (
                  <tr
                    key={market.id}
                    className="bg-[#f4efff] hover:bg-[#ebe4ff] transition-colors group"
                  >
                    <td colSpan={3} className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                        <span className="font-medium text-[#1e1b4b]">
                          Create {market.name}
                        </span>
                        <button
                          onClick={() => openCreateModal(market.countryCode)}
                          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full p-0.5 transition-colors ml-1"
                          title={`Create market for ${market.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-8">
                      <span className="text-xs text-[#8b5cf6] font-medium">
                        {market.flag} Suggested
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    {/* 👇 Premium Create Market Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border-2 border-gray-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Create market</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleCreate}
            className="p-6 space-y-5 overflow-y-auto custom-scrollbar"
          >
            {/* Market Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Market name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. North America"
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow placeholder:text-gray-400"
              />
            </div>

            {/* Custom Currency Dropdown */}
            <div className="relative" ref={currencyDropdownRef}>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Currency
              </label>
              <button
                type="button"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
              >
                <span className="text-gray-900">
                  {currencyMap.get(form.currency_code)?.symbol} {form.currency_code.toUpperCase()} — {currencyMap.get(form.currency_code)?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                  <div className="p-1.5">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, currency_code: c.code });
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          form.currency_code === c.code ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{c.symbol} {c.code.toUpperCase()} — {c.name}</span>
                        {form.currency_code === c.code && <Check className="w-4 h-4 text-black" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Countries <span className="text-red-500">*</span>
              </label>
              
              {form.countries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5 animate-in fade-in">
                  {form.countries.map((code) => {
                    const c = countryMap.get(code);
                    return (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-medium text-gray-700"
                      >
                        {c?.flag} {c?.name ?? code.toUpperCase()}
                        <button
                          type="button"
                          onClick={() => toggleCountry(code)}
                          className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-200 bg-gray-50">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredCountryOptions.length === 0 ? (
                    <p className="p-4 text-xs text-gray-500 text-center">
                      No countries match "{countrySearch}"
                    </p>
                  ) : (
                    filteredCountryOptions.map((c) => {
                      const selected = form.countries.includes(c.code);
                      return (
                        <button
                          type="button"
                          key={c.code}
                          onClick={() => toggleCountry(c.code)}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ${
                            selected ? 'bg-black text-white' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{c.flag}</span>
                            <span>{c.name}</span>
                            <span
                              className={`text-[10px] font-mono tracking-wider ${
                                selected ? 'text-gray-300' : 'text-gray-400'
                              }`}
                            >
                              {c.code.toUpperCase()}
                            </span>
                          </span>
                          {selected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {form.countries.length} {form.countries.length === 1 ? 'country' : 'countries'} selected
              </p>
            </div>

            {/* Taxes Options */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.automatic_taxes}
                  onChange={(e) =>
                    setForm({ ...form, automatic_taxes: e.target.checked })
                  }
                  className="mt-0.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">
                    Calculate taxes automatically
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Taxes will be calculated based on the customer's shipping address.
                  </p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.is_tax_inclusive}
                  onChange={(e) =>
                    setForm({ ...form, is_tax_inclusive: e.target.checked })
                  }
                  className="mt-0.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">
                    Product prices include tax
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enable this if your product prices already include taxes.
                  </p>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
                {formError}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                {isSubmitting ? 'Creating…' : 'Create market'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}