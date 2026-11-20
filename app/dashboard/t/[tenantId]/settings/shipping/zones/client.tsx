// app/dashboard/t/[tenantId]/settings/shipping/zones/client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Globe, Trash2, MapPin } from 'lucide-react';

export function ServiceZonesClient({
  tenantId,
  initialZones,
  fulfillmentSets,
  stockLocations,
}: {
  tenantId: string;
  initialZones: any[];
  fulfillmentSets: any[];
  stockLocations: any[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    console.log("fulfillment sed id from client: ", fulfillmentSets)

  const [name, setName] = useState('');
  const [fulfillmentSetId, setFulfillmentSetId] = useState(fulfillmentSets[0].id || '');
  const [countryCodes, setCountryCodes] = useState('eg, sa, ae'); // Default to some countries

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const countries = countryCodes.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

      const res = await fetch(`/api/t/${tenantId}/service-zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          fulfillment_set_id: fulfillmentSetId,
          countries,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create zone');

      setName('');
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] pb-20">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Service Zones</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </header>

      {/* Table of Zones */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {initialZones.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No service zones created yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Fulfillment Set</th>
                <th className="px-4 py-3 font-normal">Countries</th>
                <th className="px-4 py-3 font-normal">Stock Locations</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 font-medium text-gray-900">{zone.name}</td>
                  <td className="px-4 py-3 text-gray-600">{zone.fulfillment_set?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {zone.geo_zones?.map((geo: any) => (
                        <span key={geo.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 uppercase">
                          {geo.country_code || geo.type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {zone.locations && zone.locations.length > 0 ? (
                        zone.locations.map((loc: any) => (
                          <span key={loc.id} className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" /> {loc.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Not linked</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Create Service Zone</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-600">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Egypt & Middle East"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Set <span className="text-red-600">*</span></label>
                <select
                  value={fulfillmentSetId}
                  onChange={(e) => setFulfillmentSetId(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {fulfillmentSets.map((set) => (
                    <option key={set.id} value={set.id}>{set.name} ({set.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Codes (comma separated) <span className="text-red-600">*</span>
                </label>
                <input
                  value={countryCodes}
                  onChange={(e) => setCountryCodes(e.target.value)}
                  placeholder="eg, sa, ae"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">Use ISO 2-letter codes (e.g. us, eg, gb).</p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
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
                  disabled={loading}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating…' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}