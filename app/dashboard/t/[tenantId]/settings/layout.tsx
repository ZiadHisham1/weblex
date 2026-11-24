import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { SettingsSidebar } from './settings-sidebar';
import { notFound } from 'next/navigation';

export default async function SettingsLayout({
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
    select: { name: true, subdomain: true },
  });

  if (!tenant) notFound();

  return (
    // This takes up the full space left by the wrapper
    <div className="w-full h-[100vh] flex bg-black">
      <aside className="w-[200px] h-full bg-[#1a1a1a] border-r border-[#2a2a2a] shrink-0 overflow-y-auto no-scrollbar">
        <SettingsSidebar 
          tenantId={tenantId} 
          storeName={tenant.name} 
          subdomain={tenant.subdomain} 
        />
      </aside>

      <main className="flex-1 h-full overflow-y-auto rounded-2xl bg-[#f8f9fa] px-6 py-6">
        {children}
      </main>
    </div>
  );
}