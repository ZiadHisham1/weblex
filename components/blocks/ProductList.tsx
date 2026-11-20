import React from "react";
import { TenantLink } from "../ui/tenantLink";
import { QuickAddButton } from "@/components/cart/QuickAddButton";

export type ResolvedProduct = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variantId: string | null;
  priceStr: string;
  priceAmount: number;
  description?: string | null;
  options: Record<string, string>[]; 
  tags: string[];
};

export function ProductList({
  title,
  productIds,
  columns = "4",
  productDetails,
}: {
  title: string;
  productIds: string[];
  columns?: string;
  productDetails: Record<string, ResolvedProduct>;
}) {
  if (!productIds || productIds.length === 0) {
    return (
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">
          No products selected yet. Open the editor and pick from the Medusa
          catalog.
        </p>
      </section>
    );
  }

  const items = productIds
    .map((id) => productDetails[id])
    .filter((p): p is ResolvedProduct => Boolean(p));

  if (items.length === 0) {
    return (
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">
          The selected products are no longer available in this store.
        </p>
      </section>
    );
  }

  const cols = Number(columns) || 4;
  const gridCols =
    cols === 2
      ? "grid-cols-2"
      : cols === 3
      ? "grid-cols-2 md:grid-cols-3"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto w-full bg-white">
      <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className={`grid ${gridCols} gap-x-4 gap-y-10`}>
        {items.map((p) => (
          <div key={p.id} className="group relative flex flex-col">
            <TenantLink
            href={`/product/${p.handle}`}
            className="relative block aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4"
            >
              {p.thumbnail ? (
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </TenantLink>

            <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <QuickAddButton variantId={p.variantId} />
            </div>

            <div className="flex flex-col flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {p.title}
              </h3>
              <p className="text-sm text-gray-500 font-semibold mt-auto">
                {p.priceStr}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}