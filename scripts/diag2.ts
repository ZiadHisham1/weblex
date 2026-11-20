import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Medusa from "@medusajs/js-sdk";
import { decryptSecret } from "../lib/crypto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

(async () => {
  const t = await prisma.tenant.findFirst({
    where: { subdomain: "acme" },
    include: { medusa: true },
  });
  if (!t?.medusa) throw new Error("no binding");

  const b = t.medusa;
  const token = decryptSecret(b.adminApiKey!);
  const VAR = "variant_01M6J6V2GZEHR5JW09MXYDQZYQ";

  // 1. Fetch variant WITH price_set_id and price_set relation
  const varResp = await fetch(
    `${b.backendUrl}/admin/products/prod_01M6J6V2FD7ZV6ERWXHVGK9WQJ/variants/${VAR}?fields=*price_set,*price_set.prices`,
    { headers: { "x-medusa-access-token": token } },
  );
  console.log("=== /admin/products/.../variants/:id ===");
  console.log(JSON.stringify(await varResp.json(), null, 2));

  // 2. Try the pricing module directly (this is what add-to-cart uses)
  //    There's no public "calculate" endpoint; use the store pricing on the cart path
  //    by asking the store API for the variant with calculated_price.
  console.log("\n=== /store/products (publishable key) ===");
  const storeResp = await fetch(
    `${b.backendUrl}/store/products?handle=test-jacket&fields=*variants.calculated_price,*variants.prices`,
    { headers: { "x-publishable-api-key": b.publishableKey! } },
  );
  const storeData = await storeResp.json();
  console.log("status:", storeResp.status);
  console.log(JSON.stringify(storeData, null, 2));

  // 3. Add line item to a fresh cart and read the exact error body
  console.log("\n=== Add to fresh cart (admin route) ===");
  const cartResp = await fetch(`${b.backendUrl}/admin/carts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-medusa-access-token": token },
    body: JSON.stringify({ region_id: b.regionId }),
  });
  const cartJson = await cartResp.json();
  const cartId = cartJson.cart?.id;
  console.log("cart:", cartId);

  const addResp = await fetch(`${b.backendUrl}/admin/carts/${cartId}/line-items`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-medusa-access-token": token },
    body: JSON.stringify({ variant_id: VAR, quantity: 1 }),
  });
  console.log("add status:", addResp.status);
  console.log("add body:", await addResp.text());

  await prisma.$disconnect();
})();
