'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ConfigurableEditorWithAuth,
  EditorProvider,
} from 'eddyter';
import 'eddyter/style.css';
import {
  Plus,
  ChevronDown,
  Info,
  Check,
  Loader2,
  X,
} from 'lucide-react';

export function NewProductForm({
  tenantId,
  categories,
  collections,
}: {
  tenantId: string;
  categories: any[];
  collections: any[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [collectionId, setCollectionId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Multi-image state
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openSections, setOpenSections] = useState({
    inventory: true,
    shipping: true,
  });

  const toggleSection = (section: 'inventory' | 'shipping') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (!title.trim()) return setError('Product title is required.');
    if (isNaN(priceNum) || priceNum <= 0) return setError('A valid price is required.');

    setSaving(true);
    try {
      const res = await fetch(`/api/t/${tenantId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status: status === 'active' ? 'published' : 'draft',
          price: priceNum,
          stock: parseInt(stock || '0', 10),
          collectionId: collectionId || undefined,
          categoryIds: categoryId ? [categoryId] : [],
          images: images.length > 0 ? images : undefined, // 👈 Send the array
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Failed to create (${res.status})`);
        return;
      }

      router.push(`/dashboard/t/${tenantId}/products`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='relative'>
      {/* ============== STICKY TOP BAR ============== */}
      <div className='overflow-hidden'>
        <div className="fixed top-14 right-5 z-40 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 bg-gray-900 rounded-full px-2 py-1 shadow-lg pointer-events-auto mt-3">
            <span className="text-xs text-gray-300 px-3">Unsaved product</span>
            <Link
              href={`/dashboard/t/${tenantId}/products`}
              className="text-xs text-white px-3 py-1 hover:bg-white/10 rounded-full transition-colors"
            >
              Discard
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 pt-16 mt-4">
        {/* ============== LEFT COLUMN ============== */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short sleeve t-shirt"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Eddyter editor */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <div className="rounded-lg overflow-hidden">
                <EditorProvider>
                  <ConfigurableEditorWithAuth
                    apiKey={process.env.NEXT_PUBLIC_EDDYTER_API_KEY ?? ''}
                    initialContent={description || '<p></p>'}
                    onChange={(html: string) => setDescription(html)}
                  />
                </EditorProvider>
              </div>
            </div>

            {/* MEDIA SECTION */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Media</label>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              {images.length === 0 ? (
                // Empty State
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 px-6 flex flex-col items-center justify-center text-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      disabled={uploading}
                      className="bg-gray-100 text-gray-900 text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {uploading ? 'Uploading...' : 'Upload new'}
                    </button>
                    <span className="text-sm text-gray-600">Select existing</span>
                  </div>
                  <p className="text-xs text-gray-500">Accepts images, videos, or 3D models</p>
                </div>
              ) : (
                // Gallery State
                <div className="flex flex-wrap gap-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative border border-gray-200 rounded-lg overflow-hidden group w-[140px] h-[140px] bg-gray-50 shrink-0"
                    >
                      <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="w-[140px] h-[140px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors shrink-0"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Choose a product category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Price</h3>
            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">EGP E£</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full rounded-md border border-gray-300 pl-16 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Inventory</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm py-2">
                <span>My Custom Location</span>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============== RIGHT COLUMN ============== */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Product organization <Info className="w-3 h-3 text-gray-400" />
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Collections</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Add collections</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}