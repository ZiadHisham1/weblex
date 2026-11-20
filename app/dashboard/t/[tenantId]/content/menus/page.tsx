import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/db';
import { MenusClient } from './client';

export default async function MenusPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  // 1. Fetch existing menus
  let menus = await prisma.tenantMenu.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });

  // 2. If no menus exist, seed the defaults for this tenant
  if (menus.length === 0) {
    await prisma.tenantMenu.createMany({
      data: [
        { tenantId, name: 'Main menu', handle: 'main-menu', items: [{ title: 'Home', url: '/' }, { title: 'Catalog', url: '/collections/all' }, { title: 'Contact', url: '/contact' }] },
        { tenantId, name: 'Footer menu', handle: 'footer', items: [{ title: 'Search', url: '/search' }, { title: 'Your Privacy Choices', url: '/privacy' }] },
        { tenantId, name: 'Customer account main menu', handle: 'customer-account', items: [{ title: 'Orders', url: '/account/orders' }, { title: 'Profile', url: '/account' }] },
      ],
    });
    menus = await prisma.tenantMenu.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <MenusClient tenantId={tenantId} initialMenus={menus} />
    </div>
  );
}