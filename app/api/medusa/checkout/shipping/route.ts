// app/api/medusa/checkout/shipping/route.ts
import { NextResponse } from "next/server";
import { withCheckout } from "@/lib/medusa/checkout";

export async function POST(req: Request) {
  return withCheckout(async ({ sdk, cartId }) => {
    const body = await req.json().catch(() => null);
    if (!body?.option_id) {
      return NextResponse.json({ error: "option_id required" }, { status: 400 });
    }

    try {
      // 👇 Add the shipping method
      const { cart } = await sdk.store.cart.addShippingMethod(cartId, {
        option_id: body.option_id,
      } as any);

      return NextResponse.json({ cart });
    } catch (e: any) {
      console.error("[checkout/shipping] Error:", e.response?.data || e);
      return NextResponse.json(
        { error: e?.message || "Failed to add shipping method" },
        { status: 400 }
      );
    }
  });
}