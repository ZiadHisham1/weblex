// lib/puck/index.ts
import "server-only";
import type { Config } from "@puckeditor/core";
import type { SiteType } from "@prisma/client";
import { buildConfig } from "@/puck.config";
import { getTenantProductsForPuck } from "@/lib/medusa/products";

export async function getPuckConfig(
  tenantId: string,
  siteType: SiteType,
  siteSubdomain: string,
): Promise<Config> {
  const { productOptions, productDetails } =
    siteType === "COMMERCE"
      ? await getTenantProductsForPuck(tenantId)
      : { productOptions: [], productDetails: {} };

  return buildConfig({
    tenantId,
    siteType,
    siteSubdomain,
    productOptions,
    productDetails,
  });
}