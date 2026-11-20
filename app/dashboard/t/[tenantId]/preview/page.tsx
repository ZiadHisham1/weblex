import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { getPuckConfig } from "@/lib/puck";
import { requireTenantAccess } from "@/lib/auth/tenant-guard";
import "@puckeditor/core/puck.css";

const EMPTY_PAGE: Data = { content: [], root: { props: {} } } as Data;

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { tenantId } = await params;
  const { path: pagePath = "/" } = await searchParams;

  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { instance: true },
  });

  if (!tenant) notFound();

  const allData = (tenant.instance?.data as Record<string, Data>) ?? {};
  const pageData = allData[pagePath] ?? EMPTY_PAGE;
  const allPages = Object.keys(allData);

  const config = await getPuckConfig(tenant.id, tenant.siteType);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 min-w-0">
          <div className="shrink-0">
            <span className="font-semibold">{tenant.name}</span>
            <span className="ml-2 text-sm text-gray-300 font-mono">{pagePath}</span>
          </div>

          {/* Page switcher */}
          <nav className="flex gap-1 text-sm overflow-x-auto">
            {allPages.map((p) => (
              <Link
                key={p}
                href={`?path=${encodeURIComponent(p)}`}
                className={
                  'px-3 py-1 rounded whitespace-nowrap transition-colors ' +
                  (p === pagePath
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800')
                }
              >
                {p}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/dashboard/t/${tenant.id}`}
            className="text-sm text-gray-300 hover:text-white"
          >
            Back
          </Link>
          <Link
            href={`/dashboard/t/${tenant.id}/editor?path=${encodeURIComponent(pagePath)}`}
            className="text-sm bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-gray-200"
          >
            Edit this page
          </Link>
        </div>
      </div>

      {/* Rendered page */}
      <div className="flex-1 overflow-y-auto bg-white">
        <Render config={config} data={pageData} />
      </div>
    </div>
  );
}