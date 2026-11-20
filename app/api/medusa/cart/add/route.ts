import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTenantFromHost } from '@/lib/tenant-host';
import { getMedusaStoreClient } from '@/lib/medusa/client';

const COOKIE_NAME = 'cart_id';

export async function POST(req: Request) {
  const tenant = await getTenantFromHost();
  if (!tenant || tenant.siteType !== 'COMMERCE') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.variant_id || typeof body.quantity !== 'number') {
    return NextResponse.json({ error: 'variant_id and quantity required' }, { status: 400 });
  }

  const regionId = tenant.medusa?.regionId;
  if (!regionId) {
    return NextResponse.json({ error: 'Store not ready' }, { status: 503 });
  }

  const cookieStore = await cookies();
  const existingCartId: string | null = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const { sdk } = await getMedusaStoreClient(tenant.id);

  // Resolve a cart id: use existing (if valid) or create new
  let cartId: string;
  if (existingCartId) {
    try {
      await sdk.store.cart.retrieve(existingCartId);
      cartId = existingCartId;
    } catch {
      const created = await sdk.store.cart.create({ region_id: regionId });
      cartId = created.cart.id;
      cookieStore.set(COOKIE_NAME, cartId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === 'production',
      });
    }
  } else {
    const created = await sdk.store.cart.create({ region_id: regionId });
    cartId = created.cart.id;
    cookieStore.set(COOKIE_NAME, cartId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  try {
    const updated = await sdk.store.cart.createLineItem(cartId, {
      variant_id: body.variant_id,
      quantity: body.quantity,
    });
    return NextResponse.json({ cart: updated.cart });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to add' }, { status: 400 });
  }
}