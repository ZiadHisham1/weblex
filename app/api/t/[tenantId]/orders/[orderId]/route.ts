// app/api/t/[tenantId]/orders/[orderId]/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; orderId: string }> }
) {
  const { tenantId, orderId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    const updatePayload: any = {};
    if (body.email) {
      updatePayload.email = body.email;
    }

    // 👇 Fetch existing order to grab full address details
    const { order: existingOrder } = await sdk.admin.order.retrieve(orderId, {
      fields: '*shipping_address,*billing_address',
    });

    // 👇 Helper to sanitize address (strip out read-only fields)
    const sanitizeAddress = (address: any, firstName?: string, lastName?: string) => {
      if (!address) return undefined;
      
      // Only include fields Medusa expects for updates
      return {
        first_name: firstName !== undefined ? firstName : address.first_name,
        last_name: lastName !== undefined ? lastName : address.last_name,
        company: address.company || null,
        address_1: address.address_1,
        address_2: address.address_2 || null,
        city: address.city,
        province: address.province || null,
        postal_code: address.postal_code || null,
        country_code: address.country_code,
        phone: address.phone || null,
      };
    };

    // Check if name update is requested
    if (body.firstName !== undefined || body.lastName !== undefined) {
      if (existingOrder.shipping_address) {
        updatePayload.shipping_address = sanitizeAddress(
          existingOrder.shipping_address, 
          body.firstName, 
          body.lastName
        );
      }
      
      if (existingOrder.billing_address) {
        updatePayload.billing_address = sanitizeAddress(
          existingOrder.billing_address, 
          body.firstName, 
          body.lastName
        );
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await sdk.admin.order.update(orderId, updatePayload);
    }

    // 2. Handle Item Updates
    if (body.items && Array.isArray(body.items)) {
      const { order } = await sdk.admin.order.retrieve(orderId, { fields: '*items' });
      const currentItems = order.items || [];
      const newItems = body.items;

      for (const currentItem of currentItems) {
        const newItem = newItems.find((i: any) => i.variantId === currentItem.variant_id);
        
        if (!newItem) {
           await sdk.admin.order.removeLineItem(orderId, currentItem.id);
        } else if (newItem.quantity !== currentItem.quantity) {
           await sdk.admin.order.updateLineItem(orderId, currentItem.id, {
             quantity: newItem.quantity,
           });
        }
      }

      for (const newItem of newItems) {
        const exists = currentItems.some((i: any) => i.variant_id === newItem.variantId);
        if (!exists) {
          await sdk.admin.order.addLineItem(orderId, {
            variant_id: newItem.variantId,
            quantity: newItem.quantity,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Order Update] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to update order', detail: e.response?.data },
      { status: 500 }
    );
  }
}