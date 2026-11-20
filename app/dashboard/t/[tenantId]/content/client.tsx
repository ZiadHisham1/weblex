'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutList,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

type Asset = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  status: string;
  createdAt: string;
};

export function ContentClient({
  tenantId,
  initialAssets,
  metrics,
  recentAssets,
}: {
  tenantId: string;
  initialAssets: Asset[];
  metrics: { totalAssets: number; imagesCount: number };
  recentAssets: Asset[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete State
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredAssets = initialAssets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/t/${tenantId}/assets`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.error ?? 'Upload failed');
        return;
      }

      setFile(null);
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/t/${tenantId}/assets?id=${assetToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? 'Failed to delete file');
        return; // Keep modal open to show error
      }

      setAssetToDelete(null); // Close modal on success
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Top Grid: Metrics & Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[120px]">
            <h3 className="text-sm font-semibold text-gray-900">Total Assets</h3>
            <p className="text-sm text-gray-500 mt-1">{metrics.totalAssets} entries</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[120px]">
            <h3 className="text-sm font-semibold text-gray-900">Images</h3>
            <p className="text-sm text-gray-500 mt-1">{metrics.imagesCount} entries</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[120px]">
            <h3 className="text-sm font-semibold text-gray-900">Active</h3>
            <p className="text-sm text-gray-500 mt-1">{metrics.totalAssets} entries</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[120px]">
            <h3 className="text-sm font-semibold text-gray-900">Draft</h3>
            <p className="text-sm text-gray-500 mt-1">0 entries</p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[256px]">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent files</h3>
            {recentAssets.length === 0 ? (
              <p className="text-sm text-gray-500">No recent files.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {recentAssets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 truncate max-w-[200px]">{a.name}</span>
                    <span className="text-gray-500">{formatBytes(a.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 pt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload new file
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm mt-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File List Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900">No files found</h2>
            <p className="text-sm text-gray-500 mt-2">Upload a file to get started.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-md"
            >
              Upload File
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 font-normal">Preview</th>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Size</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {asset.type.startsWith('image/') ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.type.split('/')[1] || asset.type}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatBytes(asset.size)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() => setAssetToDelete(asset)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Upload Asset</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  {file ? file.name : 'Click to select a file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max size 10MB</p>
              </div>

              {uploadError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {uploadError}
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
                  disabled={isUploading || !file}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUploading ? 'Uploading…' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{assetToDelete.name}"</span>? 
                This action cannot be undone.
              </p>

              {deleteError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 text-left">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAssetToDelete(null);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 flex-1"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}