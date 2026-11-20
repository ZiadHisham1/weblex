// app/api/t/[tenantId]/inventory/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

// ---------------------------------------------------------------------------
// GET — list inventory levels grouped by variant
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);

    if (!binding.locationId) {
      return NextResponse.json({ error: 'No stock location configured' }, { status: 503 });
    }

    // Fetch products with their variants, inventory items, and location levels
    const result = await sdk.admin.product.list({
      limit: 200,
      fields: '*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels,*variants.inventory_items.inventory.location_levels.stock_locations',
    } as any);

    const products = result.products ?? [];

    // Build inventory rows - one per variant
    const rows: any[] = [];

    for (const product of products) {
      for (const variant of product.variants ?? []) {
        const inventoryItems = variant.inventory_items ?? [];
        
        // Aggregate inventory data across all inventory items for this variant
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
            if (level.location_id === binding.locationId) {
              onHand += level.stocked_quantity ?? 0;
              reserved += level.reserved_quantity ?? 0;
              incoming += level.incoming_quantity ?? 0;
              available += level.available_quantity ?? (level.stocked_quantity - level.reserved_quantity) ?? 0;
              locationLevelId = level.id;
            }
          }
        }

        // Skip variants without any inventory item (likely not tracked)
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
          unavailable: reserved, // In Medusa, reserved = committed/unavailable
          incoming,
        });
      }
    }

    return NextResponse.json({ inventory: rows, count: rows.length });
  } catch (e: any) {
    console.error('[Inventory GET]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to fetch inventory', detail: e.response?.data },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST — update inventory level for a specific inventory item
// ---------------------------------------------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.inventory_item_id) {
    return NextResponse.json({ error: 'inventory_item_id required' }, { status: 400 });
  }

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);

    if (!binding.locationId) {
      return NextResponse.json({ error: 'No stock location configured' }, { status: 503 });
    }

    const inventoryItemId = body.inventory_item_id as string;
    const stockedQuantity = typeof body.stocked_quantity === 'number' ? body.stocked_quantity : undefined;

    if (stockedQuantity === undefined || stockedQuantity < 0) {
      return NextResponse.json({ error: 'stocked_quantity (>=0) required' }, { status: 400 });
    }

    // First, check if a location level exists
    const levelsRes = await sdk.admin.inventoryItem.listLocationLevels(inventoryItemId, {
      location_id: binding.locationId,
    } as any);

    const existingLevel = (levelsRes.inventory_item_location_levels ?? []).find(
      (l: any) => l.location_id === binding.locationId,
    );

    if (existingLevel) {
      // Update existing level
      await sdk.admin.inventoryItem.updateLocationLevel(
        inventoryItemId,
        binding.locationId,
        { stocked_quantity: stockedQuantity } as any,
      );
    } else {
      // Create new level
      await sdk.admin.inventoryItem.createLocationLevel(inventoryItemId, {
        location_id: binding.locationId,
        stocked_quantity: stockedQuantity,
      } as any);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Inventory POST]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to update inventory', detail: e.response?.data },
      { status: 500 },
    );
  }
}