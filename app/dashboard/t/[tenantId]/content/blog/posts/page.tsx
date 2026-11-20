import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { PostsClient } from './client';

export default async function BlogPostsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const posts = await prisma.blogPost.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="h-full bg-white">
      <PostsClient tenantId={tenantId} initialPosts={posts} />
    </div>
  );
}