// app/dashboard/t/[tenantId]/growth/page.tsx
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { GrowthClient } from './client';

export default async function GrowthPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  return <GrowthClient tenantId={tenantId} />;
}