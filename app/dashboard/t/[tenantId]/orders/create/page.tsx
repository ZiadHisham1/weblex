// app/dashboard/t/[tenantId]/orders/create/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { DraftOrderClient } from './draft-order-client';
import { loadIcons } from '@/lib/icons'; // 👈 Import loadIcons here

export default async function CreateDraftOrderPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'EDITOR');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let products: any[] = [];
  let region: any = null;
  let error: string | null = null;

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    
    const prodRes = await sdk.admin.product.list({
      limit: 100,
      fields: 'id,title,variants.id,variants.title,variants.sku,*variants.prices',
    });
    
    products = prodRes.products || [];

    if (binding.regionId) {
      const regionRes = await sdk.admin.region.retrieve(binding.regionId);
      region = regionRes.region;
    }
  } catch (e: any) {
    console.error('Failed to load data:', e);
    error = e.message;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  // 👇 Load the icon on the server
  const icons = loadIcons(["draft.svg"]);
  const draftIcon = icons['draft.svg'];

  return (
    <DraftOrderClient
      tenantId={tenantId}
      products={products}
      region={region}
      draftIcon={draftIcon} // 👈 Pass the icon to the client
    />
  );
}