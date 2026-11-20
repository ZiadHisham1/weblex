// app/dashboard/t/[tenantId]/editor/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireTenantAccess } from "@/lib/auth/tenant-guard";
import { getTenantProductsForPuck } from "@/lib/medusa/products";
import { EditorLayout } from "./editor-layout"; // Import the new wrapper
import type { Data } from "@puckeditor/core";

export default async function EditorPage({ params, searchParams }) {
  const { tenantId } = await params;
  const { path: pagePath = "/" } = await searchParams;
  await requireTenantAccess(tenantId, "EDITOR");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { instance: true },
  });
  if (!tenant) notFound();

  const { productOptions, productDetails } =
    tenant.siteType === "COMMERCE"
      ? await getTenantProductsForPuck(tenant.id)
      : { productOptions: [], productDetails: {} };

  const allData = (tenant.instance?.data as Record<string, Data>) ?? {};
  const pageData = allData[pagePath] ?? ({ content: [], root: { props: {} } } as Data);

  // Hand off all data to the Client Component wrapper
  return (
    <div id="editor-container-wrapper" className="w-full h-[calc(100vh-120px)] relative">
      <EditorLayout
        tenantId={tenant.id}
        initialData={pageData}
        pagePath={pagePath}
        siteType={tenant.siteType}
        siteSubdomain={tenant.subdomain}
        productOptions={productOptions}
        productDetails={productDetails}
      />
    </div>
  );
}