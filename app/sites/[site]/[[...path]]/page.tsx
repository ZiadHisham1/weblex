import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientRender } from '@/components/puck/ClientRender';
import { getTenantProductsForPuck } from '@/lib/medusa/products';
import '@puckeditor/core/puck.css';

export default async function LiveTenantSite({
  params,
}: {
  params: Promise<{ site: string; path?: string[] }>;
}) {
  const { site, path } = await params;
  const requestedPath = path && path.length > 0 ? '/' + path.join('/') : '/';

  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { subdomain: site },
        { domains: { some: { hostname: site, verified: true } } },
      ],
    },
    include: { instance: true },
  });

  if (!tenant) notFound();

  const allData = (tenant.instance?.data as Record<string, any>) || {};
  let pageData = allData[requestedPath];
  if (!pageData && requestedPath === '/') {
    pageData = { content: [], root: { props: {} } };
  }
  if (!pageData) notFound();

  // 1. Fetch the raw serializable data
  const { productOptions, productDetails, globalFilters } =
    tenant.siteType === "COMMERCE"
      ? await getTenantProductsForPuck(tenant.id)
      : { 
          productOptions: [], 
          productDetails: {}, 
          globalFilters: { sizes: [], colors: [], tags: [] } 
        };

  // 2. Package it into the context object
  const configCtx = {
    tenantId: tenant.id,
    siteType: tenant.siteType,
    siteSubdomain: tenant.subdomain,
    productOptions,
    productDetails,
    globalFilters,
  };

  // 3. Pass only serializable data to the Client Component
  return <ClientRender data={pageData} configCtx={configCtx} />;
}