// app/dashboard/t/[tenantId]/settings/customer-privacy/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Info, ChevronRight, FileText, Cookie, Database, 
  ShieldCheck, Mail, UserCheck, Globe 
} from "lucide-react";

export default function CustomerPrivacyClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Customer privacy
      </h1>

      {/* Privacy Settings Section */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Privacy settings</h2>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          
          {/* Privacy Policy */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-start gap-3">
              <FileText className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Privacy policy</div>
                <div className="text-[13px] text-gray-500">Published on your online store</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium bg-[#F3F4F6] text-gray-700 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Automated
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
            </div>
          </button>

          {/* Cookie Banner */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-start gap-3">
              <Cookie className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Cookie banner</div>
                <div className="text-[13px] text-gray-500">Visible in Austria, Belgium and 14 other regions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium bg-[#F3F4F6] text-gray-700 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Automated
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
            </div>
          </button>

          {/* Data Sharing Opt Out */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-start gap-3">
              <Database className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Data sharing opt out page</div>
                <div className="text-[13px] text-gray-500">Active in California, Colorado and 13 other states</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium bg-[#F3F4F6] text-gray-700 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Automated
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {/* Network Intelligence Card (Disabled State) */}
      <div className="mb-3">
        <div className="border border-gray-200 rounded-xl bg-[#F4F4F5] p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px] font-medium text-gray-900">Shopify Network Intelligence</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[11px] font-medium text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Disabled
                </span>
              </div>
              <div className="text-[13px] text-gray-500">Not sharing customer data. Enable to access Shop and 5 other apps</div>
            </div>
          </div>
          <button className="text-[13px] font-medium text-gray-900 hover:underline px-2">
            Enable
          </button>
        </div>
      </div>

      {/* Description Text */}
      <p className="text-[13px] text-gray-600 leading-relaxed mb-10">
        When enabled, your customer data is securely used with other Shopify data to improve products, ad targeting, and personalization for your store as described in the <a href="#" className="underline">Additional Services Terms</a>. No other merchant can see your data.
      </p>

      {/* Marketing Settings Section */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <h2 className="text-[15px] font-semibold text-gray-900">Marketing settings</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          
          {/* E-mail and SMS */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-start gap-3">
              <Mail className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">E-mail and SMS marketing in checkout</div>
                <div className="text-[13px] text-gray-500">Ask your customers for their marketing preferences</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" strokeWidth={2} />
          </button>

          {/* Double opt-in */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-start gap-3">
              <UserCheck className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Double opt-in for marketing</div>
                <div className="text-[13px] text-gray-500">Ask your customers to confirm their contact details</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Data Storage Hosting Location */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <h2 className="text-[15px] font-semibold text-gray-900">Data storage hosting location</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-lg leading-none">🇺🇸</span>
          <span className="text-[13px] font-medium text-gray-900">United States</span>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div>
        <p className="text-[13px] text-gray-500">
          Recommended privacy settings are for your convenience. Compliance with laws and regulations is your responsibility. <a href="#" className="underline">Learn more</a>
        </p>
      </div>

    </div>
  );
}