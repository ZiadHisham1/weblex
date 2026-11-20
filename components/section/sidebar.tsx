'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { SiteType } from '@prisma/client';
import { Icon } from '@/components/ui/Icon';
import { 
  Search, ChevronRight, Bell
} from 'lucide-react';

// Make sure this file exists at this path, or paste the component inline.
import { GearIcon } from '../icons/GearIcon';

type Tenant = { id: string; name: string; subdomain: string; siteType: SiteType };

// 👇 Define sub-menu configurations
const PRODUCT_SUB_MENUS = [
  { label: 'Collections', path: '/collections' },
  { label: 'Categories', path: '/categories' },
  { label: 'Inventory', path: '/inventory' },
];

const ORDER_SUB_MENUS = [
  { label: 'Drafts', path: '/orders/drafts' },
  { label: 'Shipping labels', path: '/orders/shipping-labels' },
  { label: 'Abandoned checkouts', path: '/orders/abandoned-checkouts' },
];

const CONTENT_SUB_MENUS = [
  { label: 'Files', path: '/content/files' },
  { label: 'Menus', path: '/content/menus' },
  { label: 'Blog posts', path: '/content/blog/posts' },
];

export function Sidebar({
  tenant,
  icons,
}: {
  tenant: Tenant;
  icons: Record<string, string>;
}) {
  const pathname = usePathname();
  const base = `/dashboard/t/${tenant.id}`;

  const isProductsRoute = PRODUCT_SUB_MENUS.some((menu) => pathname.includes(menu.path)) || pathname.includes('/products');
  const isOrdersRoute = ORDER_SUB_MENUS.some((menu) => pathname.includes(menu.path)) || pathname.includes('/orders');
  const isContentRoute = CONTENT_SUB_MENUS.some((menu) => pathname.includes(menu.path));

  const [isProductsOpen, setIsProductsOpen] = useState(isProductsRoute);
  const [isOrdersOpen, setIsOrdersOpen] = useState(isOrdersRoute);
  const [isContentOpen, setIsContentOpen] = useState(isContentRoute);

  useEffect(() => {
    if (isProductsRoute) setIsProductsOpen(true);
  }, [isProductsRoute]);

  useEffect(() => {
    if (isOrdersRoute) setIsOrdersOpen(true);
  }, [isOrdersRoute]);
  
  useEffect(() => {
    if (isContentRoute) setIsContentOpen(true);
  }, [isContentRoute]);

  // 👇 REMOVED the Settings group from here
  const groups = [
    {
      items: [
        { href: base, label: 'Home', Icon: 'home.svg' },
        { href: `${base}/orders`, label: 'Orders', Icon: 'inbox_icon.svg', type: 'orders' },
        { href: `${base}/products`, label: 'Products', Icon: 'products.svg', type: 'products' },
        { href: `${base}/customers`, label: 'Customers', Icon: 'customers.svg' },
        { href: `${base}/growth`, label: 'Growth', Icon: 'growth.svg' },
        { href: `${base}/discounts`, label: 'Discounts', Icon: 'discounts.svg' },
        { href: `${base}/content`, label: 'Content', Icon: 'content.svg', type: 'content' },
        { href: `${base}/markets`, label: 'Markets', Icon: 'markets.svg' },
        { href: `${base}/analytics`, label: 'Analytics', Icon: 'analytics.svg' },
      ],
    },
    {
      title: 'Sales chennels', // Kept your original spelling
      items: [
        { href: `${base}/editor`, label: 'Store front', Icon: 'Palette.svg' },
        { href: `${base}`, label: 'Pages', Icon: 'FileText.svg' },
        ...(tenant.siteType === 'PORTFOLIO' ? [{ href: `${base}/projects`, label: 'Projects', Icon: 'ImageIcon.svg' }] : []),
      ],
    },
    ...(tenant.siteType === 'SERVICE' ? [{
      title: 'Bookings',
      items: [
        { href: `${base}/services`, label: 'Services', Icon: 'Calendar.svg' },
        { href: `${base}/providers`, label: 'Providers', Icon: 'Users.svg' },
      ],
    }] : []),
  ];

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col bg-[#000] text-[#a3a3a3] font-sans ">
      
      {/* Top Logo Area */}
      <Link
        href="/dashboard"
        className="flex h-14 shrink-0 items-center gap-2 px-4 font-semibold transition-colors "
      >
        <span className="inline-block h-6 w-6 rounded bg-white" />
        <span className="text-white text-sm">Weblex</span>
      </Link>

      {/* Search Bar */}
      <div className="px-3 pb-2 pt-1">
        <button className="relative flex w-full overflow-hidden items-center justify-between border-0.5 border-[#ffffff4b] border-b-0 rounded-2xl bg-gradient-to-t from-transparent via-bg-white/5 to-white/20 px-3 py-1.5 text-sm text-gray-400 hover:bg-[#2a2a2a] transition-colors border focus:border-gray-600">
          <div className='absolute z-0 left-0 top-0 py-2 w-[100%] h-full rounded-xl  bg-white/20 p-6 shadow-xl backdrop-blur-md backdrop-saturate-150' />  
          <div className="flex z-2 items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </div>
          <span className="text-xs z-2 text-gray-500 font-medium bg-[#2a2a2a] px-1.5 py-0.5 rounded">Ctrl K</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.title && (
              <div className="px-3 pb-1 pt-3 text-xs font-medium text-gray-400 flex items-center justify-between group cursor-pointer hover:text-white transition-colors">
                {group.title} 
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
              </div>
            )}
            <ul className="space-y-[2px]">
              {group.items.map((item: any) => {
                const isChildActive = 
                  (item.type === 'products' && isProductsRoute) ||
                  (item.type === 'orders' && isOrdersRoute) ||
                  (item.type === 'content' && isContentRoute);

                const active = pathname === item.href || isChildActive;
                const pathMatch = pathname === item.href;
                const svg = icons[item.Icon];
                
                const isProductItem = item.type === 'products';
                const isOrderItem = item.type === 'orders';
                const isContentItem = item.type === 'content';

                const isOpen = 
                  (isProductItem && isProductsOpen) || 
                  (isOrderItem && isOrdersOpen) ||
                  (isContentItem && isContentOpen);

                const subMenus = 
                  isProductItem ? PRODUCT_SUB_MENUS : 
                  isOrderItem ? ORDER_SUB_MENUS : 
                  isContentItem ? CONTENT_SUB_MENUS : [];

                const CustomIcon = item.CustomIcon;

                return (
                  <li key={item.href} className="no-scrollbar flex flex-col">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (isProductItem) {
                          if (pathname !== item.href && !isProductsOpen){
                            setIsProductsOpen(!isProductsOpen);
                            setIsOrdersOpen(false);
                            setIsContentOpen(false);
                          }
                        } else if (isOrderItem) {
                          if (pathname !== item.href && !isOrdersOpen){
                            setIsOrdersOpen(!isOrdersOpen);
                            setIsProductsOpen(false);
                            setIsContentOpen(false);
                          }
                        } else if (isContentItem) {
                          if (pathname !== item.href && !isContentOpen){
                            setIsContentOpen(!isContentOpen);
                            setIsProductsOpen(false);
                            setIsOrdersOpen(false);
                          }
                        } else {
                            setIsProductsOpen(false);
                            setIsOrdersOpen(false);
                            setIsContentOpen(false);
                        }
                      }}
                      className={`flex items-center px-2 py-1.5 rounded-xl transition-colors ${
                        pathMatch
                          ? 'relative flex w-full overflow-hidden items-center border-[.1px] border-[#ffffff34] border-b-0 rounded-2xl bg-gradient-to-t from-white/10 via-bg-white/5 to-white/20 px-3 py-1.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors border focus:border-gray-600'
                          : 'hover:bg-[#1f1f1f] hover:text-white text-gray-300'
                      }`}
                    >
                      {CustomIcon ? (
                        <CustomIcon
                          strokeWidth={active || isOpen ? 2 : 1.5}
                          className={[
                            'shrink-0 w-4 h-4 mr-3',
                            'transition-opacity duration-150',
                            active || isOpen ? 'text-white opacity-100' : 'text-gray-400 opacity-100',
                          ].join(' ')}
                        />
                      ) : (
                        <Icon
                          svg={svg}
                          strokeWidth={active || isOpen ? 2 : 1.5}
                          className={[
                            'shrink-0 w-4 h-4 mr-1.5',
                            '[&_svg]:w-full [&_svg]:h-full [&_svg]:block',
                            'transition-opacity duration-150',
                            active || isOpen ? 'text-white opacity-100' : 'text-gray-400 opacity-100',
                          ].join(' ')}
                        />
                      )}
                      
                      <span className="text-[12px] tracking-wider">
                        <span>{item.label}</span>
                      </span>
                    </Link>

                    {isOpen && subMenus.length > 0 && (
                      <ul className="flex flex-col mt-1 space-y-[2px] pb-2">
                        {subMenus.map((subMenu) => {
                          const fullPath = `${base}${subMenu.path}`;
                          const isSubActive = pathname === fullPath || (subMenu.path !== '/content' && pathname.includes(subMenu.path));

                          return (
                            <li key={subMenu.path}>
                              <Link
                                href={fullPath}
                                className={`block pl-6 pr-3 py-1.5 text-[13px] transition-colors rounded-xl ${
                                  isSubActive
                                    ? 'relative flex w-full overflow-hidden items-center border-[.1px] border-[#ffffff34] border-b-0 rounded-2xl bg-gradient-to-t from-white/10 via-bg-white/5 to-white/20 px-3 py-1.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors border focus:border-gray-600'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
                                }`}
                              >
                                <div className=''>
                                  {/* {isSubActive ? (<div className='absolute z-0 left-0 top-0 py-2 w-[100%] h-full rounded-xl opacity-50 bg-white/20 p-6 shadow-xl backdrop-blur-md backdrop-saturate-150' />) : (<></>)} */}
                                  <span className='relativez-2'>{subMenu.label}</span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 👇 FOOTER AREA WITH SETTINGS + PROFILE */}
      <div className="mt-auto px-2 pb-4 pt-2">
        
        {/* Settings Link (Moved Here) */}
        <Link 
          href={`${base}/settings`} 
          className={`flex items-center px-2 py-1.5 rounded-md transition-colors mb-2 ${
            pathname === `${base}/settings`
              ? 'bg-[#1f1f1f] text-white font-medium'
              : 'hover:bg-[#1f1f1f] hover:text-white text-gray-300'
          }`}
        >
          <GearIcon
            strokeWidth={pathname === `${base}/settings` ? 2 : 1.5}
            className={[
              'shrink-0 w-4 h-4 mr-3',
              'transition-opacity duration-150',
              pathname === `${base}/settings` ? 'text-white opacity-100' : 'text-gray-400 opacity-100',
            ].join(' ')}
          />
          <span className="text-[13px]">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center justify-between px-2 py-2 mt-1 rounded-md hover:bg-[#1f1f1f] cursor-pointer group transition-colors border-t border-gray-800/50 pt-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              ZH
            </div>
            <span className="text-[13px] text-gray-300 group-hover:text-white truncate">
              ziadhisham
            </span>
            <span className="text-[10px] font-medium bg-[#2a2a2a] text-gray-300 px-1.5 py-0.5 rounded">
              dev
            </span>
          </div>
          <Bell className="w-4 h-4 text-gray-400 group-hover:text-white shrink-0" />
        </div>
      </div>
    </aside>
  );
}