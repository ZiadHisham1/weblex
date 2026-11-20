// app/dashboard/t/[tenantId]/customers/[id]/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { CustomerDetailClient } from './client';
import { loadIcons } from '@/lib/icons';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string; id: string }>;
}) {
  const { tenantId, id } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let customer: any = null;
  let error: string | null = null;

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.customer.retrieve(id, {
      fields: '*addresses',
    });
    customer = result.customer;
  } catch (e: any) {
    console.error('[Customer Detail] Failed to load:', e.response?.data || e);
    error = e?.message ?? 'Failed to load customer details';
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading customer: {error || 'Customer not found'}</p>
      </div>
    );
  }

  const icons = loadIcons(['customers.svg']);
  const customerIcon = icons['customers.svg'];

  return (
    <CustomerDetailClient
      tenantId={tenantId}
      customer={customer}
      customerIcon={customerIcon}
    />
  );
}