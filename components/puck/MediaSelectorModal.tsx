'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react';

type Asset = { id: string; name: string; url: string; type: string; size: number };

export function MediaSelectorModal({ 
  tenantId, 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  tenantId: string; 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (urls: string[]) => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedUrls([]); // Reset selection on open
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/t/${tenantId}/assets`);
      if (res.ok) {
        const data = await res.json();
        // Only show images
        setAssets(data.assets.filter((a: Asset) => a.type.startsWith('image/')));
      }
    } catch (e) {
      console.error('Failed to fetch assets', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleConfirm = () => {
    onSelect(selectedUrls);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border-2 border-gray-300 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Select Existing Media</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading your files...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No images found. Upload some first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredAssets.map(asset => {
                const isSelected = selectedUrls.includes(asset.url);
                return (
                  <div 
                    key={asset.id}
                    onClick={() => toggleSelect(asset.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-black ring-2 ring-black/20' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-black text-white rounded-full p-1">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            {selectedUrls.length} selected
          </span>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-white bg-transparent transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedUrls.length === 0}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Add Selected
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}