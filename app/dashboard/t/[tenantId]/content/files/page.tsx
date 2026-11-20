import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { FileManagerClient } from './client';

export default async function FilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const { tenantId } = await params;
  const { folder: folderId } = await searchParams;
  
  await requireTenantAccess(tenantId, 'VIEWER');

  // 👇 If we are in a folder, filter by that folder. 
  // If we are in the Root ("Files"), return ALL assets regardless of folder.
  const assetWhereClause = folderId 
    ? { tenantId, folderId } 
    : { tenantId };

  const [folders, assets] = await Promise.all([
    prisma.folder.findMany({ 
      where: { tenantId }, 
      orderBy: { createdAt: 'asc' } 
    }),
    prisma.tenantAsset.findMany({
      where: assetWhereClause,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const activeFolder = folderId ? folders.find(f => f.id === folderId) : null;

  return (
    <div className="h-[calc(100vh-60px)] flex bg-[#f8f9fa] border border-gray-200 rounded-2xl overflow-hidden">
      <FileManagerClient 
        tenantId={tenantId} 
        initialAssets={assets} 
        folders={folders} 
        activeFolderId={folderId || null}
        activeFolderName={activeFolder?.name || null}
      />
    </div>
  );
}