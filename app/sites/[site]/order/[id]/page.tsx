// app/sites/[site]/order/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantBySite } from "@/lib/tenant";
import { getMedusaStoreClient, medusaCall } from "@/lib/medusa/client";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site, id } = await params;
  const tenant = await getTenantBySite(site);
  if (!tenant || tenant.siteType !== "COMMERCE") notFound();

  let order: any = null;
  try {
    const { sdk } = await getMedusaStoreClient(tenant.id);
    const result = await medusaCall(() =>
      sdk.store.order.retrieve(id, {
        fields: "*items,*shipping_methods",
      } as any),
    );
    order = result.order;
  } catch {
    notFound();
  }

  if (!order) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (order.currency_code ?? "usd").toUpperCase(),
    }).format(n);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Thank you, {order.email}!</h1>
        <p className="text-gray-600 mt-1">
          Order <span className="font-mono">{order.display_id}</span> has been
          placed.
        </p>

        <section className="mt-8 rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold mb-3">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.items?.map((it: any) => (
              <li key={it.id} className="flex justify-between">
                <span>
                  {it.title} × {it.quantity}
                </span>
                <span>{fmt(it.unit_price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-semibold border-t pt-3">
            <span>Total</span>
            <span>{fmt(order.total)}</span>
          </div>
        </section>

        <Link
          href={`/sites/${site}`}
          className="mt-8 inline-block bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Back to store
        </Link>
      </div>
    </main>
  );
}