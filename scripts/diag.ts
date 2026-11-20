// scripts/diag.ts
import { getMedusaAdminClient, getMedusaStoreClient, medusaCall } from "@/lib/medusa/client";
import { prisma } from "@/lib/db";

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { medusa: { isNot: null } },
    include: { medusa: true },
  });
  if (!tenant?.medusa) {
    console.error("No tenant with a medusa binding");
    process.exit(1);
  }
  console.log("Tenant:", tenant.subdomain, tenant.id);

  const { sdk: admin, binding } = await getMedusaAdminClient(tenant.id);

  const list = await medusaCall(() =>
    admin.admin.product.list({
      limit: 5,
      currency_code: "usd",
      region_id: binding.regionId || undefined,
      fields: "*variants.prices,*sales_channels",
    } as any),
  );

  console.log("Admin list products:");
  for (const p of list.products ?? []) {
    console.log(
      " -",
      p.id,
      p.title,
      "| sales_channels:",
      (p.sales_channels ?? []).map((sc: any) => sc.id),
    );
    for (const v of p.variants ?? []) {
      console.log(
        "     variant",
        v.id,
        v.title,
        "| manage_inventory:",
        (v as any).manage_inventory,
        "| prices:",
        JSON.stringify(v.prices),
      );
    }
  }

  const first = (list.products ?? [])[0];
  if (first) {
    const detail = await medusaCall(() =>
      admin.admin.product.retrieve(first.id, {
        fields: "*variants,*variants.prices,*variants.options,*variants.price_set,*variants.price_set.prices",
      } as any),
    );
    console.log("\nFull product detail (first):");
    console.log(JSON.stringify(detail.product, null, 2));
  }

  // Store client smoke test (what the storefront product page would see)
  try {
    const { sdk: store } = await getMedusaStoreClient(tenant.id);
    const res = await store.store.product.list({
      limit: 1,
      fields: "*variants.calculated_price",
    } as any);
    console.log("\nStore list sample:");
    console.log(JSON.stringify(res.products?.[0], null, 2));
  } catch (e) {
    console.error("Store list failed:", e);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});