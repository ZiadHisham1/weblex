// app/api/medusa/checkout/complete/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTenantFromHost } from '@/lib/tenant-host';
import { getMedusaStoreClient } from '@/lib/medusa/client';

const COOKIE_NAME = 'cart_id';

export async function POST() {
  try {
    const tenant = await getTenantFromHost();
    if (!tenant || tenant.siteType !== 'COMMERCE') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 400 });
    }

    const { sdk } = await getMedusaStoreClient(tenant.id);

    // 1. Fetch cart
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: '*payment_collection,*payment_collection.payment_sessions,*items,*shipping_methods,*shipping_address,*email'
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // 2. Ensure shipping method is applied
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      console.log("[Checkout] Adding missing shipping method...");
      const options = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId });
      if (!options.shipping_options || options.shipping_options.length === 0) {
        return NextResponse.json({ error: 'No shipping options available' }, { status: 400 });
      }
      await sdk.store.cart.addShippingMethod(cartId, {
        option_id: options.shipping_options[0].id,
      });
    }

    // 3. Ensure payment session
    const sessions = cart.payment_collection?.payment_sessions || [];
    const hasSystemSession = sessions.some((s: any) => s.provider_id === 'pp_system_default');
    
    if (!hasSystemSession) {
      console.log("[Checkout] Initializing payment session...");
      let paymentCollectionId = cart.payment_collection?.id;
      
      if (!paymentCollectionId) {
        const collectionRes: any = await sdk.client.fetch(`/store/payment-collections`, {
          method: 'POST',
          body: { cart_id: cartId },
        });
        paymentCollectionId = collectionRes.payment_collection?.id;
      }

      await sdk.client.fetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
        method: 'POST',
        body: { provider_id: 'pp_system_default' },
      });
    }

    // 4. Complete cart using sdk.client.fetch (inherits correct headers)
    console.log("[Checkout] Completing cart via SDK client fetch...");
    try {
      const responseData: any = await sdk.client.fetch(`/store/carts/${cartId}/complete`, {
        method: 'POST',
      });

      if (responseData.type === 'order') {
        cookieStore.delete(COOKIE_NAME);
        return NextResponse.json({ type: 'order', order: responseData.order });
      }

      return NextResponse.json({
        type: 'cart',
        cart: responseData.cart,
        error: responseData.error?.message ?? 'Unknown error',
      }, { status: 400 });

    } catch (err: any) {
      // 👇 Log the exact error from Medusa
      console.log("============= RAW MEDUSA RESPONSE =============");
      console.log(JSON.stringify(err.response?.data || err, null, 2));
      console.log("===============================================");

      return NextResponse.json(
        { 
          error: err.message || 'Failed to complete cart',
          details: err.response?.data 
        },
        { status: err.status || 400 }
      );
    }

  } catch (e: any) {
    console.error("=============== GENERAL CRASH ===============");
    console.error(e.message);
    console.error("=============================================");

    return NextResponse.json(
      { error: e.message, details: e.response?.data },
      { status: 500 }
    );
  }
}