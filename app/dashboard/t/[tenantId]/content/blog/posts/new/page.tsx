import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { BlogPostEditor } from './client'; // 👈 Updated import

export default async function NewBlogPostPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });

  return (
    <div className="min-h-screen bg-white">
      <BlogPostEditor tenantId={tenantId} defaultAuthor={tenant.name} />
    </div>
  );
}