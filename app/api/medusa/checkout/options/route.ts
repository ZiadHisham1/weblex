// app/api/medusa/checkout/options/route.ts
import { NextResponse } from "next/server";
import { withCheckout } from "@/lib/medusa/checkout";

export async function GET() {
  return withCheckout(async ({ sdk, cartId }) => {
    try {
      const { cart } = await sdk.store.cart.retrieve(cartId);

      if (!cart?.shipping_address?.country_code) {
        return NextResponse.json({ options: [] });
      }

      // 👇 List options specifically for this cart
      const { shipping_options } = await (sdk.store.fulfillment as any).listCartOptions({
        cart_id: cartId,
      });

      const options = (shipping_options ?? []).map((o: any) => ({
        id: o.id,
        name: o.name,
        amount: o.amount,
        // Make sure this matches the shipping profile of your products
        shipping_profile_id: o.shipping_profile_id, 
      }));

      return NextResponse.json({ options });
    } catch (e: any) {
      console.error("[checkout/options]", e);
      return NextResponse.json({ options: [] });
    }
  });
}