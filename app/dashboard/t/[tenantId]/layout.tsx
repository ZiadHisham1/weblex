import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/section/sidebar';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { loadIcons, SIDEBAR_ICONS } from '@/lib/icons';

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, subdomain: true, siteType: true },
  });

  if (!tenant) notFound();

  // ✅ read all sidebar SVGs on the server, pass as strings
  const icons = loadIcons(SIDEBAR_ICONS);

  return (
    <div className="flex h-screen no-scrollbar overflow-hidden bg-black text-gray-900">
      <Sidebar tenant={tenant} icons={icons} />
      <div className="flex flex-1 flex-col m-0.5 rounded-3xl bg-white overflow-hidden">
        {/* <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-6"> */}
          {/* <div className="font-medium">{tenant.name}</div> */}
          {/* <div className="text-sm text-gray-500">{tenant.subdomain}</div> */}
        {/* </header> */}
        <main className="flex-1 overflow-y-auto px-6 py-3">{children}</main>
      </div>
    </div>
  );
}