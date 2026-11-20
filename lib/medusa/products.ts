import { getMedusaAdminClient, medusaCall } from "@/lib/medusa/client";
import type { TenantProductOption, ResolvedProduct } from "@/puck.config";

export async function getTenantProductsForPuck(tenantId: string): Promise<{
  productOptions: TenantProductOption[];
  productDetails: Record<string, ResolvedProduct>;
  globalFilters: {
    sizes: string[];
    colors: string[];
    tags: string[];
  };
}> {
  const { sdk, binding } = await getMedusaAdminClient(tenantId);

  // 1. Fetch products
  const { products } = await medusaCall(() =>
    sdk.admin.product.list({
      limit: 200,
      currency_code: "usd",
      region_id: binding.regionId || undefined,
      fields: "*variants.prices,*variants.options,*options,*tags,*sales_channels",
    } as any),
  );

  // 2. Fetch ALL global options, requesting the `values` array explicitly
  let globalOptions: any[] = [];
  try {
    const optionsRes = await medusaCall(() => 
      sdk.admin.productOption.list({ 
        limit: 1000,
        // Explicitly request the values array so we get everything!
        fields: "id,title,*values" 
      } as any)
    );
    globalOptions = optionsRes.product_options ?? [];
  } catch (e) {
    console.error("Failed to fetch global options", e);
  }

  // 3. Fetch ALL global tags
  let globalTags: any[] = [];
  try {
    const tagsRes = await medusaCall(() => 
      sdk.admin.productTag.list({ limit: 1000 } as any)
    );
    globalTags = tagsRes.product_tags ?? [];
  } catch (e) {
    console.error("Failed to fetch global tags", e);
  }

  // 4. Extract Global Filter Values
  const globalSizes = new Set<string>();
  const globalColors = new Set<string>();

  globalOptions.forEach((opt: any) => {
    const title = (opt.title || "").toLowerCase();
    // Ensure we are looking at the title of the option globally
    if (title === "size" || title === "sizes") {
      opt.values?.forEach((v: any) => globalSizes.add(v.value));
    } else if (title === "color" || title === "colour" || title === "colors") {
      opt.values?.forEach((v: any) => globalColors.add(v.value));
    }
  });

  const globalTagsList = globalTags.map((t: any) => t.value);

  // 5. Process Products
  const scoped = (products ?? []).filter((p: any) =>
    (p.sales_channels ?? []).some((sc: any) => sc.id === binding.salesChannelId),
  );

  const productOptions: TenantProductOption[] = scoped.map((p: any) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail ?? null,
  }));

  const productDetails: Record<string, ResolvedProduct> = {};
  
  for (const p of scoped) {
    const firstVariant = p.variants?.[0];
    const usdPrice = firstVariant?.prices?.find((pr: any) => pr.currency_code === "usd");
    const amount = usdPrice?.amount ?? 0;

    const allVariantOptions: Record<string, string>[] = [];
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        if (v.options && Array.isArray(v.options)) {
          const optionMap: Record<string, string> = {};
          v.options.forEach((opt: any) => {
            const optionTitle = opt.option?.title || "Option";
            optionMap[optionTitle] = opt.value; 
          });
          allVariantOptions.push(optionMap);
        }
      });
    }

    productDetails[p.id] = {
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail ?? null,
      variantId: firstVariant?.id ?? null,
      priceStr: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount),
      priceAmount: amount,
      description: p.description,
      options: allVariantOptions,
      tags: (p.tags ?? []).map((t: any) => t.value),
    };
  }

  return { 
    productOptions, 
    productDetails,
    globalFilters: {
      sizes: Array.from(globalSizes).sort(),
      colors: Array.from(globalColors).sort(),
      tags: globalTagsList.sort(),
    }
  };
}