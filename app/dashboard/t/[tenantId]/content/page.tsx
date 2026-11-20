import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { Library } from 'lucide-react';
import { ContentClient } from './client';
import { ContentIcon } from '@/components/icons/ContentIcon';

export default async function ContentPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  // Fetch assets from DB
  const assets = await prisma.tenantAsset.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate metrics for the top grid
  const totalAssets = assets.length;
  const imagesCount = assets.filter(a => a.type.startsWith('image/')).length;
  const recentAssets = assets.slice(0, 3);

  return (
    <div className="mx-auto space-y-4 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <ContentIcon className='w-5 h-5' />
          <h1 className="text-xl font-semibold text-gray-900">Assets</h1>
        </div>
      </header>

      <ContentClient
        tenantId={tenantId}
        initialAssets={assets}
        metrics={{ totalAssets, imagesCount }}
        recentAssets={recentAssets}
      />
    </div>
  );
}