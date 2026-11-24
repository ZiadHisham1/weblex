// components/section/sidebar-layout-wrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import type { SiteType } from '@prisma/client';

type Tenant = { id: string; name: string; subdomain: string; siteType: SiteType };

export function SidebarLayoutWrapper({
  tenant,
  icons,
  children,
}: {
  tenant: Tenant;
  icons: Record<string, string>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 👇 Check if we are in settings
  const isSettingsRoute = pathname.includes('/settings');

  return (
    <>
      <Sidebar tenant={tenant} icons={icons} />
      
      <div 
        className={`flex flex-1 flex-col overflow-hidden transition-colors ${
          isSettingsRoute 
            ? 'bg-white m-0 rounded-none p-0'       // 👈 Settings: No padding, no margin, no rounding
            : 'bg-white m-0.5 w-full rounded-3xl py-3 px-4' // 👈 Normal: Rounded card with padding
        }`}
      >
        {children}
      </div>
    </>
  );
}