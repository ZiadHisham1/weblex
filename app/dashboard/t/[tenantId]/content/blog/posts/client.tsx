'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, FileText, Plus, MoreHorizontal, 
  Eye, EyeOff, Edit2, Trash2, Loader2 
} from 'lucide-react';

type BlogPost = {
  id: string;
  title: string;
  visibility: string;
  author: string;
  blogName: string;
  createdAt: Date;
};

export function PostsClient({ tenantId, initialPosts }: { tenantId: string; initialPosts: BlogPost[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  // Delete State
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPosts = initialPosts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/t/${tenantId}/blog/${postToDelete.id}`, { method: 'DELETE' });
      setPostToDelete(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between py-4 bg-white">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <FileText className="w-5 h-5 text-gray-500" /> Blog posts
        </div>
        <Link 
          href={`/dashboard/t/${tenantId}/content/blog/posts/new`}
          className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create post
        </Link>
      </header>

      <div className="py-6 pb-2">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search posts" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="py-6 overflow-auto flex-1">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium w-1/2">Title</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {post.title}
                    <div className="text-xs text-gray-400 font-normal mt-0.5">{post.blogName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${post.visibility === 'VISIBLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {post.visibility === 'VISIBLE' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.visibility === 'VISIBLE' ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.author}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 👇 New Edit Button */}
                    <Link 
                    href={`/dashboard/t/${tenantId}/content/blog/posts/${post.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-black rounded"
                    >
                    <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                    onClick={() => setPostToDelete(post)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    No blog posts found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete "{postToDelete.title}"?</p>
            <div className="flex gap-3">
              <button onClick={() => setPostToDelete(null)} disabled={isDeleting} className="flex-1 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}