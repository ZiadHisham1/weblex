// app/api/t/[tenantId]/orders/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Email and at least one item are required' }, { status: 400 });
  }

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);

    if (!binding.regionId) {
      return NextResponse.json({ error: 'Store region not configured' }, { status: 400 });
    }

    // 1. Find or create the customer by email
    let customerId: string | undefined;
    try {
      const customersRes = await sdk.admin.customer.list({ q: body.email, limit: 1 });
      const existingCustomer = customersRes.customers.find((c: any) => c.email === body.email);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer = await sdk.admin.customer.create({
          email: body.email,
          first_name: body.firstName || '',
          last_name: body.lastName || '',
        });
        customerId = newCustomer.customer.id;
      }
    } catch (e) {
      console.error('Failed to find or create customer', e);
    }

    // 2. Create the draft order
    const draftOrder = await sdk.admin.draftOrder.create({
      region_id: binding.regionId,
      sales_channel_id: binding.salesChannelId,
      email: body.email,
      customer_id: customerId,
      items: body.items.map((item: any) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({ draft_order: draftOrder.draft_order });
  } catch (e: any) {
    console.error('[Create Draft Order]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create order', detail: e.response?.data },
      { status: 500 }
    );
  }
}