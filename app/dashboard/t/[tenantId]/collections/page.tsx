import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { CollectionsClient } from './client';

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let collections: any[] = [];
  let error: string | null = null;
  let provisioning = false;

  if (
    tenant.medusa?.provisioningState === 'PENDING' ||
    tenant.medusa?.provisioningState === 'PROVISIONING'
  ) {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error = 'Store not ready. Provisioning state: ' + (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk } = await getMedusaAdminClient(tenantId);
      // Added *products to fetch the product count for the column
      const result = await sdk.admin.productCollection.list({
      limit: 100,
      fields: 'id,title,handle,metadata,created_at,*products',
    } as any);

    // 👇 Filter
    collections = (result.collections ?? []).filter(
      (c: any) => c.metadata?.tenantId === tenantId,
    );
    } catch (e: any) {
      console.error('[Collections Dashboard] Failed to load:', e.response?.data || e);
      error = e?.message ?? 'Failed to load collections';
    }
  }

  return (
    <CollectionsClient
      tenantId={tenantId}
      initialCollections={collections}
      error={error}
      provisioning={provisioning}
    />
  );
}