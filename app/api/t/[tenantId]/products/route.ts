import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { decryptSecret } from '@/lib/crypto';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET — list products
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
    const result = await sdk.admin.product.list({
      limit: 100,
      currency_code: 'usd',
      region_id: binding.regionId || undefined,
      fields: '*variants.prices,*sales_channels',
    } as any);

    const products = (result.products ?? []).filter((p: any) =>
      (p.sales_channels ?? []).some((sc: any) => sc.id === binding.salesChannelId),
    );
    return NextResponse.json({ products, count: products.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create product + stock the auto-created inventory item
// ---------------------------------------------------------------------------
// app/api/t/[tenantId]/products/route.ts (POST function)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (typeof body.price !== 'number' || body.price <= 0) {
    return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
  }

  const stockQuantity = typeof body.stock === 'number' && body.stock >= 0 ? Math.floor(body.stock) : 0;

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    if (!binding.locationId) return NextResponse.json({ error: 'No stock location' }, { status: 503 });

    const baseSku = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sku = `${baseSku}-${Date.now().toString(36)}`;

    // Format images for Medusa v2 (expects array of { url: string })
    const medusaImages = (body.images || []).map((url: string) => ({ url }));

    // 1. Create the product with all new fields
    const created = await sdk.admin.product.create({
      title: body.title,
      description: body.description ?? '',
      status: body.status ?? 'draft',
      thumbnail: body.images?.[0] || null, // 👈 Set the first image as the thumbnail
      images: medusaImages,                // 👈 Add the rest to the gallery
      collection_id: body.collectionId || undefined,
      categories: body.categoryIds?.map((id: string) => ({ id })) || [],
      sales_channels: [{ id: binding.salesChannelId }],
      options: [{ title: 'Default', values: ['Default'] }],
      variants: [{
        title: 'Default',
        sku,
        options: { Default: 'Default' },
        manage_inventory: true,
        prices: [{ amount: body.price, currency_code: 'usd' }],
      }],
    } as any);

    const product = created.product;
    const variantId = product?.variants?.[0]?.id;
    if (!variantId) return NextResponse.json({ error: 'No variant created' }, { status: 500 });

    // 2. Handle Inventory (Using the raw REST logic you already have)
    const adminKeyRes = await prisma.medusaBinding.findUnique({
      where: { tenantId },
      select: { adminApiKey: true },
    });
    const rawKey = adminKeyRes?.adminApiKey ? decryptSecret(adminKeyRes.adminApiKey) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${rawKey}`,
    };
    const baseUrl = binding.backendUrl;

    // Fetch variant to find auto-created inventory item
    const variantRes = await fetch(
      `${baseUrl}/admin/products/${product.id}/variants/${variantId}?fields=*inventory_items`,
      { headers }
    );

    let inventoryItemId = null;
    if (variantRes.ok) {
      const variantData = await variantRes.json();
      inventoryItemId = variantData.variant?.inventory_items?.[0]?.inventory_item_id;
    }

    // If no inventory item exists, create it
    if (!inventoryItemId) {
      const invRes = await fetch(`${baseUrl}/admin/inventory-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sku, title: body.title, requires_shipping: true }),
      });
      const invData = await invRes.json();
      inventoryItemId = invData.inventory_item?.id;

      // Link it
      await fetch(`${baseUrl}/admin/products/${product.id}/variants/${variantId}/inventory-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inventory_item_id: inventoryItemId, required_quantity: 1 }),
      });
    }

    // 3. Stock the location
    if (inventoryItemId && stockQuantity > 0) {
      await fetch(`${baseUrl}/admin/inventory-items/${inventoryItemId}/location-levels`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          location_id: binding.locationId,
          stocked_quantity: stockQuantity,
        }),
      });
    }

    return NextResponse.json({ product });
  } catch (e: any) {
    console.error('Product create failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed', detail: e.response?.data || e },
      { status: 500 }
    );
  }
}

// Helper: stock the location level, or create it if it doesn't exist
async function stockAndReturn(
  inventoryItemId: string,
  locationId: string,
  stockQuantity: number,
  baseUrl: string | null,
  headers: Record<string, string>,
  product: any,
) {
  if (!baseUrl) {
    return NextResponse.json({ error: 'Backend URL missing' }, { status: 500 });
  }

  // Fetch existing levels for this item to see if one exists for this location
  const levelsRes = await fetch(
    `${baseUrl}/admin/inventory-items/${inventoryItemId}/location-levels`,
    { headers }
  );
  const levelsData = await levelsRes.json().catch(() => ({}));
  const existingLevel = (levelsData.inventory_item_location_levels ?? []).find(
    (l: any) => l.location_id === locationId,
  );

  if (existingLevel) {
    // UPDATE existing level
    const updateRes = await fetch(
      `${baseUrl}/admin/inventory-items/${inventoryItemId}/location-levels/${existingLevel.id}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ stocked_quantity: stockQuantity }),
      }
    );
    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      console.error('[inventory] Failed to update level:', err);
    }
  } else {
    // CREATE new level
    const createRes = await fetch(
      `${baseUrl}/admin/inventory-items/${inventoryItemId}/location-levels`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          location_id: locationId,
          stocked_quantity: stockQuantity,
        }),
      }
    );
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      console.error('[inventory] Failed to create level:', err);
    }
  }

  return NextResponse.json({ product, stockQuantity, inventoryItemId });
}