import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { CustomersClient } from './client';

export default async function CustomersPage({
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

  let customers: any[] = [];
  let error: string | null = null;
  let provisioning = false;

  if (tenant.medusa?.provisioningState === 'PENDING' || tenant.medusa?.provisioningState === 'PROVISIONING') {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error = 'Store not ready. Provisioning state: ' + (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const { sdk } = await getMedusaAdminClient(tenantId);
      const result = await sdk.admin.customer.list({
        limit: 100,
        fields: '*addresses',
      } as any);

      customers = result.customers ?? [];
    } catch (e: any) {
      console.error('[Customers Dashboard] Failed to load:', e.response?.data || e);
      error = e?.message ?? 'Failed to load customers';
    }
  }

  return (
    <CustomersClient
      tenantId={tenantId}
      initialCustomers={customers}
      error={error}
      provisioning={provisioning}
    />
  );
}