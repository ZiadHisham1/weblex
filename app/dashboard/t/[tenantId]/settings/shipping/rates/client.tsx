'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, X, Truck, Search } from 'lucide-react';

type Rate = {
  id: string;
  city: string;
  name: string;
  amount: number;
  active: boolean;
};

export function ShippingRatesClient({
  tenantId,
  initialRates,
  countryCode,
  currencyCode,
  suggestedCities,
  error,
  provisioning,
}: {
  tenantId: string;
  initialRates: Rate[];
  countryCode: string | null;
  currencyCode: string | null;
  suggestedCities: string[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [cityQuery, setCityQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currencyLabel = (currencyCode ?? 'usd').toUpperCase();
  const symbol = useMemo(() => {
    // "EGP" is fine; for the "EGP E£" style just rely on Intl.
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyLabel,
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? currencyLabel;
  }, [currencyLabel]);

  const grouped = useMemo(() => {
    const map = new Map<string, Rate[]>();
    for (const r of initialRates) {
      if (!map.has(r.city)) map.set(r.city, []);
      map.get(r.city)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [initialRates]);

  const filteredSuggestions = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return suggestedCities.slice(0, 8);
    return suggestedCities.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [cityQuery, suggestedCities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const amountNum = Number(amount);
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        setFormError('Enter a valid amount');
        return;
      }
      const res = await fetch(`/api/t/${tenantId}/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          name: name.trim() || `${city.trim()} — Standard`,
          amount: amountNum,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }
      setCity('');
      setName('');
      setAmount('');
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (rate: Rate) => {
    setBusyId(rate.id);
    try {
      await fetch(`/api/t/${tenantId}/shipping/rates/${rate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !rate.active }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (rate: Rate) => {
    if (!confirm(`Remove the "${rate.name}" shipping rate for ${rate.city}?`)) return;
    setBusyId(rate.id);
    try {
      const res = await fetch(`/api/t/${tenantId}/shipping/rates/${rate.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Failed to delete');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20">
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
          <h1 className="text-xl font-semibold text-gray-900">Shipping rates</h1>
          {countryCode && (
            <span className="text-xs uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded ml-2">
              {countryCode}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add city rate
        </button>
      </header>

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
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {grouped.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No city rates configured yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Add a rate so customers in that city can check out.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-normal">City</th>
                  <th className="px-4 py-3 font-normal">Method</th>
                  <th className="px-4 py-3 font-normal text-right">Price</th>
                  <th className="px-4 py-3 font-normal text-center">Active</th>
                  <th className="px-4 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grouped.map(([cityName, cityRates]) =>
                  cityRates.map((rate, idx) => (
                    <tr key={rate.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {idx === 0 ? cityName : <span className="text-gray-400">↳</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{rate.name}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: currencyLabel,
                        }).format(rate.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(rate)}
                          disabled={busyId === rate.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            rate.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rate.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(rate)}
                          disabled={busyId === rate.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          {busyId === rate.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="relative inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed top-30 bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border-2 border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Add city rate</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Type or choose a city"
                    required
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                {cityQuery !== undefined && suggestedCities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {filteredSuggestions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCity(c)}
                        className="text-xs border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cairo — Standard"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to default to “{city || 'City'} — Standard”. Use separate entries for
                  Express, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ({currencyLabel}) <span className="text-red-600">*</span>
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder={`${symbol} 0.00`}
                  required
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
                  {isSubmitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}