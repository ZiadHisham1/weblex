import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FolderOpen, ChevronRight, FileText } from 'lucide-react';

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  // Get all unique blogs based on posts
  const posts = await prisma.blogPost.findMany({
    where: { tenantId },
    select: { blogName: true },
  });

  const blogCounts = posts.reduce((acc, post) => {
    acc[post.blogName] = (acc[post.blogName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ensure "News" exists even if empty
  const blogs = Array.from(new Set(['News', ...Object.keys(blogCounts)]));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blogs</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {blogs.map((blog) => (
          <Link
            key={blog}
            href={`/dashboard/t/${tenantId}/content/blog/${blog.toLowerCase()}`}
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{blog}</h2>
                <p className="text-xs text-gray-500">{blogCounts[blog] || 0} posts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}