'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ConfigurableEditorWithAuth,
  EditorProvider,
} from 'eddyter';
import 'eddyter/style.css';
import { 
  ChevronLeft, FileText, Loader2, Sparkles, Eye, ChevronDown 
} from 'lucide-react';

// 👇 Import the media selector modal
import { MediaSelectorModal } from '@/components/puck/MediaSelectorModal';

type InitialData = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  visibility: string;
  author: string;
  blogName: string;
  tags: string[];
  template: string;
} | null;

export function BlogPostEditor({ 
  tenantId, 
  defaultAuthor,
  initialData 
}: { 
  tenantId: string; 
  defaultAuthor: string;
  initialData?: InitialData;
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [visibility, setVisibility] = useState<'VISIBLE' | 'HIDDEN'>((initialData?.visibility as any) || 'VISIBLE');
  const [author, setAuthor] = useState(initialData?.author || defaultAuthor);
  const [blogName, setBlogName] = useState(initialData?.blogName || 'News');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [template, setTemplate] = useState(initialData?.template || 'Default blog post');
  
  // Image State
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/t/${tenantId}/assets`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.asset?.url) setImageUrl(data.asset.url);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");
    
    setIsSaving(true);
    try {
      const payload = {
        title, content, excerpt, visibility, imageUrl, author, blogName,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        template,
      };

      const url = isEditing 
        ? `/api/t/${tenantId}/blog/${initialData.id}` 
        : `/api/t/${tenantId}/blog`;
        
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/dashboard/t/${tenantId}/content/blog/posts`);
        router.refresh();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'save'} blog post`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/t/${tenantId}/content/blog/posts`} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <FileText className="w-5 h-5 text-gray-500" /> Blog posts
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1200px] w-full mx-auto px-8 py-8 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 max-w-[800px] space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit blog post' : 'Add blog post'}</h1>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blog about your latest products or deals"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all pr-10"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 👇 EDDYTER EDITOR INTEGRATION */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
              <div className="rounded-lg overflow-hidden border border-gray-300">
                <EditorProvider>
                  <ConfigurableEditorWithAuth
                    apiKey={process.env.NEXT_PUBLIC_EDDYTER_API_KEY ?? ''}
                    initialContent={content || '<p></p>'}
                    onChange={(html: string) => setContent(html)}
                  />
                </EditorProvider>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-medium text-gray-900">Excerpt</label>
              <button className="text-gray-400 hover:text-black"><Sparkles className="w-4 h-4" /></button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Add a summary of the post to appear on your home page or blog."
                className="w-full h-20 outline-none resize-none text-sm text-gray-700"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-medium text-gray-900">Search engine listing</label>
              <button className="text-gray-400 hover:text-black"><Sparkles className="w-4 h-4" /></button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Add a title and description to see how this blog post might appear in a search engine listing</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[320px] space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">Visibility</label>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="visibility" checked={visibility === 'VISIBLE'} onChange={() => setVisibility('VISIBLE')} className="w-4 h-4 text-black focus:ring-black border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-700">Visible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="visibility" checked={visibility === 'HIDDEN'} onChange={() => setVisibility('HIDDEN')} className="w-4 h-4 text-black focus:ring-black border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-700">Hidden</span>
              </label>
            </div>
          </div>

          {/* 👇 PREMIUM IMAGE SECTION */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <label className="text-sm font-medium text-gray-900">Image</label>
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-100"
                    >
                      Upload New
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 flex flex-col items-center justify-center text-center bg-gray-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="bg-gray-100 text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isUploadingImage ? 'Uploading...' : 'Upload new'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
                  >
                    Select existing
                  </button>
                </div>
                <p className="text-xs text-gray-500">Accepts images, or drop an image to upload</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <label className="text-sm font-medium text-gray-900 block mb-2">Organization</label>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Blog</label>
              <div className="relative">
                <select value={blogName} onChange={(e) => setBlogName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all appearance-none bg-white">
                  <option value="News">News</option>
                  <option value="Updates">Updates</option>
                  <option value="Guides">Guides</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Add tags (comma separated)" className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-900">Theme template</label>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            <div className="relative">
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all appearance-none bg-white">
                <option value="Default blog post">Default blog post</option>
                <option value="Alternative">Alternative</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 px-8 flex justify-end z-20">
        <button onClick={handleSave} disabled={isSaving || !title.trim()} className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Save changes' : 'Save Post'}
        </button>
      </div>

      {/* 👇 Media Selector Modal */}
      <MediaSelectorModal
        tenantId={tenantId}
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(urls) => setImageUrl(urls[0] || null)}
      />
    </div>
  );
}