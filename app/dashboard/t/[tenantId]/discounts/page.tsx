import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { DiscountsClient } from './client';

export default async function DiscountsPage({
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

  let promotions: any[] = [];
  let error: string | null = null;
  let provisioning = false;

  if (
    tenant.medusa?.provisioningState === 'PENDING' ||
    tenant.medusa?.provisioningState === 'PROVISIONING'
  ) {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error =
      'Store not ready. Provisioning state: ' +
      (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk } = await getMedusaAdminClient(tenantId);

      // Paginate through all promotions so tenant-specific ones aren't missed
      // when other tenants' promotions fill earlier pages.
      const tenantPromotions: any[] = [];
      const pageSize = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await sdk.admin.promotion.list({
          limit: pageSize,
          offset,
          // 👇 '*' keeps base fields (code, status, type, is_automatic, etc.)
          //    and we explicitly add the relations we need.
          // fields: '*application_method,*rules,metadata,*',
          
        } as any);

        const batch = result.promotions ?? [];
        tenantPromotions.push(
          ...batch.filter((p: any) => p.metadata?.tenantId === tenantId)
        );

        hasMore = batch.length === pageSize;
        offset += pageSize;

        // Safety cap to avoid unbounded loops
        if (offset > 5000) break;
      }

      promotions = tenantPromotions;
    } catch (e: any) {
      console.error(
        '[Discounts Dashboard] Failed to load:',
        e.response?.data || e
      );
      error = e?.message ?? 'Failed to load discounts';
    }
  }

  return (
    <DiscountsClient
      tenantId={tenantId}
      initialPromotions={promotions}
      error={error}
      provisioning={provisioning}
    />
  );
}