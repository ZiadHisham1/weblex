// editor/client.tsx (client)
"use client";
import { useMemo } from "react";
import { Puck, type Data } from "@puckeditor/core";
import { useRouter } from "next/navigation";
import { buildConfig } from "@/puck.config";
import type { ResolvedProduct, TenantProductOption } from "@/puck.config";
import type { SiteType } from "@prisma/client";
import "@puckeditor/core/puck.css";

export function PuckEditorClient({
  tenantId,
  initialData,
  pagePath,
  siteType,
  siteSubdomain,
  productOptions,
  productDetails,
}: {
  tenantId: string;
  initialData: Data;
  pagePath: string;
  siteType: SiteType;
  siteSubdomain: string;
  productOptions: TenantProductOption[];
  productDetails: Record<string, ResolvedProduct>;
}) {
  const router = useRouter();
  const config = useMemo(
    () =>
      buildConfig({
        tenantId,
        siteType,
        siteSubdomain,
        productOptions,
        productDetails,
      }),
    [tenantId, siteType, siteSubdomain, productOptions, productDetails],
  );

  const handlePublish = async (data: Data) => {
    const res = await fetch(`/api/sites/${tenantId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, path: pagePath }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(`Publish failed: ${body.error ?? res.statusText}`);
      return;
    }
    alert("Page published successfully!");
    router.refresh();
  };

  return <Puck config={config} data={initialData} onPublish={handlePublish} />;
}