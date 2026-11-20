// components/puck/MediaUploadField.tsx
'use client';

import { useState } from 'react';

interface MediaUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function MediaUploadField({ value, onChange, label }: MediaUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Upload failed');
      }

      const data = await res.json();
      // This automatically updates the Puck field with the new URL
      onChange(data.url); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
      <label className="block text-xs font-semibold text-gray-600 uppercase">
        {label || 'Media Upload'}
      </label>
      
      {/* Preview the uploaded Image or Video */}
      {value && (
        <div className="relative w-full h-32 bg-gray-200 rounded overflow-hidden mb-2">
          {value.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={value} controls className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* File Input */}
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
      />

      {/* Status Messages */}
      {isUploading && <p className="text-xs text-blue-600">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Manual URL Input (Fallback) */}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a URL directly..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}