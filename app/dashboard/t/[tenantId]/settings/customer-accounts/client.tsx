// app/dashboard/t/[tenantId]/settings/customer-accounts/client.tsx
"use client";

import ToggleButton from "@/components/ui/ToggleButton";
import { Organization } from "@prisma/client";
import { 
  Info, LogIn, Settings2, PackageSearch, Lock, 
  Wallet, Globe 
} from "lucide-react";
import { useState } from "react";

export default function CustomerAccountsClient({ 
  org, 
  subdomain 
}: { 
  org: Organization; 
  subdomain: string; 
}) {
  const [isToggled, setIsToggled] = useState(false)

 const handleToggle = () => {
  setIsToggled(prev => {
    const next = !prev;
    return next;
  });
};

  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-20">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Customer accounts
      </h1>

      {/* Sign-in links Section */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Sign-in links</h2>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm flex items-center justify-between p-4">
          <div className="flex items-start gap-3">
            <LogIn className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-[14px] font-medium text-gray-900 mb-0.5">Show sign-in links</div>
              <div className="text-[13px] text-gray-500">Show sign-in links in the header of online store and at checkout</div>
            </div>
          </div>
          
         <ToggleButton />
        </div>
      </div>

      {/* Customer accounts Section */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <h2 className="text-[15px] font-semibold text-gray-900">Customer accounts</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>

        {/* First Group */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
          
          {/* Configurations */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <Settings2 className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Configurations</div>
                <div className="text-[13px] text-gray-500">Configure apps, branding, and features for checkout and customer accounts</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Customize
            </button>
          </div>

          {/* Order actions */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <PackageSearch className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Order actions</div>
                <div className="text-[13px] text-gray-500">
                  Allow customers to buy again, return, or cancel. Set conditions with <a href="#" className="underline">returns and cancellation rules</a>.
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Manage
            </button>
          </div>
        </div>

        {/* Second Group */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          
          {/* Authentication */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Authentication</div>
                <div className="text-[13px] text-gray-500">Manage sign-in methods and account access</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Manage
            </button>
          </div>

          {/* Store credit */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <Wallet className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Store credit</div>
                <div className="text-[13px] text-gray-500">Allow customers to see and spend store credit</div>
              </div>
            </div>
            {/* Custom Toggle Switch */}
            <ToggleButton />
          </div>

          {/* URL */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Globe className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
                <div>
                  <div className="text-[14px] font-medium text-gray-900 mb-0.5">URL</div>
                  <div className="text-[13px] text-gray-500">Use this URL anywhere you'd like customers to access customer accounts</div>
                </div>
              </div>
              <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Manage
              </button>
            </div>
            
            {/* URL Input Field */}
            <div className="ml-[30px] bg-[#F3F3F3] text-[13px] text-gray-700 rounded-lg p-2.5 border border-gray-200 truncate">
              https://{subdomain}.myweblex.com/account
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}