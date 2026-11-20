// app/dashboard/t/[tenantId]/settings/shipping/zones/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { ServiceZonesClient } from './client';

export default async function ServiceZonesPage({
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

  let zones: any[] = [];
  let fulfillmentSets: any[] = [];
  let stockLocations: any[] = [];
  let error: string | null = null;

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    
    if (!binding.locationId) {
      throw new Error('No Stock Location configured for this tenant');
    }

    // 👇 THE OPTIMAL FETCH: One API call for everything
    const locationRes = await sdk.admin.stockLocation.retrieve(binding.locationId, {
      fields: 'id,name,*fulfillment_sets,*fulfillment_sets.service_zones,*fulfillment_sets.service_zones.geo_zones',
    });

    const stockLocation = locationRes.stock_location;
    if (!stockLocation) {
      throw new Error('Stock Location not found');
    }

    stockLocations = [stockLocation];

    // 👇 Extract sets and flatten zones from the nested response
    const linkedSets = stockLocation.fulfillment_sets || [];
    fulfillmentSets = linkedSets;

    zones = linkedSets.flatMap((set: any) =>
      (set.service_zones || []).map((zone: any) => ({
        ...zone,
        fulfillment_set: {
          id: set.id,
          name: set.name,
          type: set.type,
        },
        locations: [{
          id: stockLocation.id,
          name: stockLocation.name,
        }],
      }))
    );

  } catch (e: any) {
    console.error('[Service Zones] Failed to load:', e.response?.data || e);
    error = e?.message ?? 'Failed to load data';
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <ServiceZonesClient
      tenantId={tenantId}
      initialZones={zones}
      fulfillmentSets={fulfillmentSets}
      stockLocations={stockLocations}
    />
  );
}