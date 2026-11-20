// lib/medusa/inventory.ts
import "server-only";

export async function setupInventoryForVariant(
  sdk: any,
  variantId: string,
  locationId: string,
  sku: string,
  quantity: number = 100 // Default stock
) {
  try {
    // 1. Create the inventory item
    const inventoryItem = await sdk.admin.inventoryItem.create({
      sku,
      title: sku,
      requires_shipping: true,
    });

    // 2. Link inventory item to the variant
    await sdk.admin.product.updateVariant(variantId, {
      inventory_items: [{ inventory_item_id: inventoryItem.inventory_item.id, required_quantity: 1 }],
    });

    // 3. Set stock level at the location
    await sdk.admin.inventoryItem.updateLevel(inventoryItem.inventory_item.id, locationId, {
      stocked_quantity: quantity,
    });

    return inventoryItem.inventory_item.id;
  } catch (e: any) {
    console.error("[Inventory Setup Failed]", e.response?.data || e);
    throw new Error(`Failed to set up inventory: ${e.message}`);
  }
}