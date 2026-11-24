// app/dashboard/t/[tenantId]/layout.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { loadIcons, SIDEBAR_ICONS } from '@/lib/icons';
import { CommandPalette } from '@/components/CommandPalette';
import { SidebarLayoutWrapper } from '@/components/section/sidebar-layout-wrapper';

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

  const icons = loadIcons(SIDEBAR_ICONS);

  return (
    <div className="flex h-screen no-scrollbar overflow-hidden bg-black text-gray-900">
      {/* 👇 Wrapper handles the padding & backgrounds now */}
      <SidebarLayoutWrapper tenant={tenant} icons={icons}>
        <div className='w-full'>
          {children}
        </div>
      </SidebarLayoutWrapper>
      
      <CommandPalette tenantId={tenant.id} />
    </div>
  );
}