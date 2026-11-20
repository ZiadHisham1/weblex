// lib/medusa/checkout.ts
import { NextResponse } from "next/server";
import { getTenantFromHost } from "@/lib/tenant-host";
import { getMedusaStoreClient } from "@/lib/medusa/client";
import { readCartId } from "@/lib/medusa/cart-cookie";

export type CheckoutCtx = {
  tenantId: string;
  cartId: string;
  sdk: Awaited<ReturnType<typeof getMedusaStoreClient>>["sdk"];
};

export async function withCheckout(
  fn: (ctx: CheckoutCtx) => Promise<NextResponse>,
): Promise<NextResponse> {
  const tenant = await getTenantFromHost();
  if (!tenant || tenant.siteType !== "COMMERCE") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cartId = await readCartId();
  if (!cartId) {
    return NextResponse.json({ error: "No cart" }, { status: 400 });
  }

  let sdk;
  try {
    ({ sdk } = await getMedusaStoreClient(tenant.id));
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Store not ready" },
      { status: 503 },
    );
  }

  try {
    return await fn({ tenantId: tenant.id, cartId, sdk });
  } catch (e: any) {
    const status = e?.status ?? e?.response?.status ?? 400;
    const detail = e?.response?.data ?? e?.body ?? null;
    console.error("[checkout]", status, e?.message, detail);
    return NextResponse.json(
      { error: e?.message ?? "Failed", detail },
      { status },
    );
  }
}