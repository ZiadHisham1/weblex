// app/api/t/[tenantId]/orders/[orderId]/capture/route.ts
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

  try {
    // 👇 1. Read the requested capture amount from the body
    const body = await req.json().catch(() => ({}));
    const captureAmount = body.amount; // e.g., 5000 for $50.00

    const { sdk } = await getMedusaAdminClient(tenantId);

    // 2. Retrieve the order to find the specific Payment ID
    const { order } = await sdk.admin.order.retrieve(orderId, {
      fields: '*payment_collections,*payment_collections.payments',
    });

    const payment = order.payment_collections?.[0]?.payments?.[0];
    
    if (!payment) {
      return NextResponse.json({ error: 'No payment found to capture' }, { status: 400 });
    }

    const paymentId = payment.id;
    const authorizedAmount = payment.amount;

    // 👇 3. Validate the amount (Cannot capture more than authorized)
    if (captureAmount && captureAmount > authorizedAmount) {
      return NextResponse.json({ error: 'Capture amount exceeds authorized amount' }, { status: 400 });
    }

    // 👇 4. Perform the capture (Full or Partial)
    const result = await sdk.admin.payment.capture(paymentId, {
      amount: captureAmount || authorizedAmount, // If no amount provided, capture full
    });

    return NextResponse.json({ success: true, payment: result.payment });
  } catch (e: any) {
    console.error('[Capture Payment] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to capture payment', detail: e.response?.data },
      { status: 500 }
    );
  }
}