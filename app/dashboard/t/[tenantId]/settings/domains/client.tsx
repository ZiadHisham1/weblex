// app/dashboard/t/[tenantId]/settings/domains/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { Globe } from "lucide-react";

export default function DomainsClient({ 
  org, 
  subdomain 
}: { 
  org: Organization; 
  subdomain: string; 
}) {
  return (
    <div>
        {/* Top Action Buttons */}
        <div className="flex items-center justify-end gap-2 mb-10">
            <button className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            Connect existing
            </button>
            <button className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            Transfer domain
            </button>
            <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-colors">
            Buy new domain
            </button>
        </div>
        <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">

        {/* Page Header */}
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-6">
            Domains
        </h1>

        {/* Table Card */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#F9F9F9] border-b border-gray-200">
            <div className="col-span-6 text-[13px] font-medium text-gray-500">Domain</div>
            <div className="col-span-6 text-[13px] font-medium text-gray-500">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 bg-[#F9F9F9]">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-100 transition-colors">
                
                {/* Domain Column */}
                <div className="col-span-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                <span className="text-[13px] text-gray-900 font-medium">
                    {subdomain}.myweplox.com
                </span>
                <span className="px-2 py-[2px] rounded border border-gray-300 text-[11px] font-medium text-gray-600 ml-1">
                    Primary
                </span>
                </div>
                
                {/* Status Column */}
                <div className="col-span-6">
                <span className="inline-flex px-2 py-[2px] rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800 border border-green-300/50">
                    Connected
                </span>
                </div>

            </div>
            </div>
            
        </div>
        </div>
    </div>
  );
}