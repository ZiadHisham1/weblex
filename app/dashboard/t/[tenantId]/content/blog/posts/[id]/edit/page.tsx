import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BlogPostEditor } from './client'; // 👈 Import from the new folder

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ tenantId: string; id: string }>;
}) {
  const { tenantId, id } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  const [tenant, post] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    prisma.blogPost.findUnique({ where: { id } }),
  ]);

  if (!post || post.tenantId !== tenantId) notFound();

  // Ensure tags is an array
  const formattedPost = {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };

  return (
    <div className="min-h-screen bg-white">
      <BlogPostEditor 
        tenantId={tenantId} 
        defaultAuthor={tenant?.name || 'Admin'} 
        initialData={formattedPost} 
      />
    </div>
  );
}