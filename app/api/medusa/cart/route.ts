// app/api/medusa/cart/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTenantFromHost } from '@/lib/tenant-host';
import { getMedusaStoreClient } from '@/lib/medusa/client';

const COOKIE_NAME = 'cart_id';

// ---------------------------------------------------------------------------
// GET — current cart
// ---------------------------------------------------------------------------
export async function GET() {
  const tenant = await getTenantFromHost();
  if (!tenant || tenant.siteType !== 'COMMERCE') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(COOKIE_NAME)?.value ?? null;
  if (!cartId) return NextResponse.json({ cart: null });

  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);
    const { cart } = await sdk.store.cart.retrieve(cartId);
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ cart: null });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update line item quantity (quantity=0 removes the line)
// ---------------------------------------------------------------------------
export async function PATCH(req: Request) {
  const tenant = await getTenantFromHost();
  if (!tenant || tenant.siteType !== 'COMMERCE') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.line_id || typeof body.quantity !== 'number' || body.quantity < 0) {
    return NextResponse.json(
      { error: 'line_id and quantity (>=0) required' },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(COOKIE_NAME)?.value;
  if (!cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });

  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);

    if (body.quantity === 0) {
      await sdk.store.cart.deleteLineItem(cartId, body.line_id);
    } else {
      await sdk.store.cart.updateLineItem(cartId, body.line_id, {
        quantity: body.quantity,
      });
    }

    // Re-fetch the cart — SDK return shapes vary across versions.
    // This guarantees a consistent { cart } response regardless.
    const { cart } = await sdk.store.cart.retrieve(cartId);
    return NextResponse.json({ cart });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 400 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove line item
// ---------------------------------------------------------------------------
export async function DELETE(req: Request) {
  const tenant = await getTenantFromHost();
  if (!tenant || tenant.siteType !== 'COMMERCE') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const lineId = url.searchParams.get('line_id');
  if (!lineId) return NextResponse.json({ error: 'line_id required' }, { status: 400 });

  const cookieStore = await cookies();
  const cartId = cookieStore.get(COOKIE_NAME)?.value;
  if (!cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });

  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);
    await sdk.store.cart.deleteLineItem(cartId, lineId);
    const { cart } = await sdk.store.cart.retrieve(cartId);
    return NextResponse.json({ cart });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 400 });
  }
}