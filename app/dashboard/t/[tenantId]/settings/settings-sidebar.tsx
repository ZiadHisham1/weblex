'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, Search, Store, Users, Receipt, 
  Settings, Calendar, ReceiptText, CreditCard, ShoppingBag, 
  UserCircle, Truck, BadgeDollarSign, MapPin, Puzzle, 
  Globe, Bell, FileText, Shield, Languages, ListFilter,
  Activity, BadgeInfo
} from 'lucide-react';
import { GearIcon } from '../icons/GearIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const SETTINGS_NAV = [
  { label: 'General', path: '/settings', icon: Settings },
  { label: 'Plan', path: '/settings/plan', icon: Calendar },
  { label: 'Billing', path: '/settings/billing', icon: ReceiptText },
  { label: 'Payments', path: '/settings/payments', icon: CreditCard },
  { label: 'Checkout', path: '/settings/checkout', icon: ShoppingBag },
  { label: 'Customer accounts', path: '/settings/customer-accounts', icon: UserCircle },
  { label: 'Shipping and delivery', path: '/settings/shipping', icon: Truck },
  { label: 'Taxes and duties', path: '/settings/taxes', icon: BadgeDollarSign },
  { label: 'Locations', path: '/settings/locations', icon: MapPin },
  { label: 'Apps', path: '/settings/apps', icon: Puzzle },
  { label: 'Sales channels', path: '/settings/sales-channels', icon: Globe },
  { label: 'Domains', path: '/settings/domains', icon: Globe },
  { label: 'Customer events', path: '/settings/customer-events', icon: Activity },
  { label: 'Notifications', path: '/settings/notifications', icon: Bell },
  { label: 'Metafields and metaobjects', path: '/settings/metafields', icon: ListFilter },
  { label: 'Languages', path: '/settings/languages', icon: Languages },
  { label: 'Customer privacy', path: '/settings/customer-privacy', icon: Shield },
  { label: 'Policies', path: '/settings/policies', icon: FileText },
];

export function SettingsSidebar({ tenantId, storeName, subdomain }: { tenantId: string, storeName: string, subdomain: string }) {
  const pathname = usePathname();
  const base = `/dashboard/t/${tenantId}`;
  const [isHovered, setIsHovered] = useState(false);

  const checkPathname = (currentRoute: string) => {
    alert(pathname)
    alert(currentRoute)
    if (pathname === currentRoute) return true;
    return false
  } 

  return (
    <div className="flex flex-col h-full text-sm font-sans bg-[#111] text-gray-300">
      
      {/* Header */}
      <div className="py-2 px-2 flex items-center justify-center">
        <Link 
        href={`${base}`} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex w-full items-center p-1 rounded-md transition-colors text-gray-400 hover:text-white group"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        
        {/* Text Animation Container */}
        <div className="flex-1 ml-1 relative h-5 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {!isHovered ? (
              <motion.h2
                key="settings"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute inset-0 text-white font-semibold text-xs flex items-center"
              >
                Settings
              </motion.h2>
            ) : (
              <motion.h2
                key="back"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute inset-0 text-white font-semibold text-xs flex items-center"
              >
                Back
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
      </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center gap-2 overflow-hidden bg-[#2a2a2a] border border-white/30 border-b-0 rounded-xl px-3 py-1">
          <div className='absolute z-1 left-0 top-0 w-full h-full bg-gradient-to-t from-white/10 via-white/15 to-white/20 backdrop-blur-2xl'></div>
          <div className='overflow-hidden z-0 absolute left-0 w-10 h-30'>

          <div className='z-1 rounded-full left-0 top-0 w-20 h-full bg-radial from-transparent from-5% to-white  backdrop-blur-2xl'></div>
          </div>
          <Search className="w-4 h-4 z-2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search settings" 
            className="w-full z-2 bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-10">
        
        {/* Organization Section (Top) */}
        <div className="mb-4">
          <p className="px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Themer</p>
          <ul className="space-y-0.5 mb-4 pb-4 border-b border-[#2a2a2a]">
            {[
              { label: 'Organization', path: '/settings/organization-details', icon: Store },
              { label: 'Users',        path: '/settings/organization-account', icon: Users },
              { label: 'Payouts',      path: '/settings/payouts',              icon: Receipt },
            ].map((item) => {
              const fullPath = `${base}${item.path}`;
              const isActive = pathname === fullPath;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    href={fullPath}
                    className={`flex items-center gap-2.5 px-2 py-1 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'relative w-full overflow-hidden border-[.1px] border-[#ffffff34] border-b-0 rounded-2xl bg-gradient-to-t from-white/10 via-bg-white/5 to-white/20 text-sm text-white hover:bg-[#2a2a2a] transition-colors focus:border-gray-600'
                        : 'hover:bg-[#2a2a2a] text-gray-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
                    <span className="text-[13px]">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Store Header */}
        <div className="flex items-center justify-between px-2 mb-2 pb-2 border-b border-[#2a2a2a]">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-white">{storeName}</span>
            <span className="text-[11px] text-gray-400 truncate">{subdomain}.myweblex.com</span>
          </div>
          <div className="w-6 h-6 rounded bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
            ZH
          </div>
        </div>

        {/* Main Settings Nav */}
        <ul className="space-y-0.5 pt-2">
          {SETTINGS_NAV.map((item) => {
            const fullPath = `${base}${item.path}`;
            const isActive = pathname === fullPath;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  href={fullPath}
                  className={`flex items-center gap-2.5 px-2 py-1 rounded-lg transition-colors ${
                    isActive 
                      ? 'relative w-full overflow-hidden border-[.1px] border-[#ffffff34] border-b-0 rounded-2xl bg-gradient-to-t from-white/10 via-bg-white/5 to-white/20 text-sm text-white hover:bg-[#2a2a2a] transition-colors focus:border-gray-600' 
                      : 'hover:bg-[#2a2a2a] text-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Profile */}
      <div className="p-3 mt-auto border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2 px-2 py-1.5">
           <div className="w-6 h-6 rounded bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            ZH
          </div>
          <div className="flex flex-col overflow-hidden">
             <span className="text-[13px] text-gray-200">Ziad Hisham</span>
             <span className="text-[11px] text-gray-500 truncate">ziadhisham947@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}