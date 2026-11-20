// app/api/medusa/checkout/address/route.ts
import { NextResponse } from "next/server";
import { withCheckout } from "@/lib/medusa/checkout";

export async function POST(req: Request) {
  return withCheckout(async ({ sdk, cartId }) => {
    const body = await req.json().catch(() => null);

    if (!body?.email || !body?.shipping_address) {
      return NextResponse.json(
        { error: "email and shipping_address required" },
        { status: 400 },
      );
    }

    try {
      // Medusa v2 cart.update saves both email and addresses
      const { cart } = await (sdk.store.cart as any).update(cartId, {
        email: body.email,
        shipping_address: body.shipping_address,
        billing_address: body.billing_address ?? body.shipping_address,
      });

      return NextResponse.json({ cart });
    } catch (e: any) {
      console.error("[checkout/address] Error:", e.response?.data || e.message);
      return NextResponse.json(
        { error: e?.message ?? "Failed to update address", detail: e.response?.data },
        { status: 400 }
      );
    }
  });
}