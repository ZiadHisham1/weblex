// app/dashboard/t/[tenantId]/inventory/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { InventoryClient } from './client';

export default async function InventoryPage({
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

  let inventory: any[] = [];
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
  } else if (!tenant.medusa?.locationId) {
    error = 'No stock location configured for this store.';
  } else {
    try {
      const { sdk, binding } = await getMedusaAdminClient(tenantId);

      // Fetch products with variants + inventory items + location levels
      const result = await sdk.admin.product.list({
        limit: 200,
        fields:
          '*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels',
      } as any);

      const products = result.products ?? [];
      const locationId = binding.locationId;

      const rows: any[] = [];

      for (const product of products) {
        for (const variant of product.variants ?? []) {
          const inventoryItems = variant.inventory_items ?? [];

          let onHand = 0;
          let available = 0;
          let reserved = 0;
          let incoming = 0;
          let inventoryItemId: string | null = null;
          let locationLevelId: string | null = null;

          for (const invItem of inventoryItems) {
            const inventory = invItem.inventory;
            if (!inventory) continue;
            inventoryItemId = inventory.id;

            const levels = inventory.location_levels ?? [];
            for (const level of levels) {
              if (level.location_id === locationId) {
                onHand += level.stocked_quantity ?? 0;
                reserved += level.reserved_quantity ?? 0;
                incoming += level.incoming_quantity ?? 0;
                available +=
                  level.available_quantity ??
                  (level.stocked_quantity ?? 0) - (level.reserved_quantity ?? 0);
                locationLevelId = level.id;
              }
            }
          }

          if (!inventoryItemId) continue;

          rows.push({
            id: variant.id,
            productId: product.id,
            productTitle: product.title,
            variantTitle: variant.title,
            thumbnail: product.thumbnail ?? variant.thumbnail ?? null,
            sku: variant.sku ?? null,
            inventoryItemId,
            locationLevelId,
            onHand,
            available,
            committed: reserved,
            unavailable: reserved,
            incoming,
          });
        }
      }

      inventory = rows;
    } catch (e: any) {
      console.error('[Inventory Dashboard] Failed to load:', e.response?.data || e);
      error = e?.message ?? 'Failed to load inventory';
    }
  }

  return (
    <InventoryClient
      tenantId={tenantId}
      initialInventory={inventory}
      error={error}
      provisioning={provisioning}
    />
  );
}