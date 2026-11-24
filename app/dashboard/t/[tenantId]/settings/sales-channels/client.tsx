// app/dashboard/t/[tenantId]/settings/sales-channels/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";

export default function SalesChannelsClient({ org }: { org: Organization }) {
  return (
    <div>
        {/* Top Action Buttons */}
        <div className="flex items-center justify-end gap-2 mb-10">
            <button className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            Edit channel mappings
            </button>
            <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-colors">
            weblex App Store
            </button>
        </div>
        <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">

        {/* Page Header */}
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-6">
            Sales channels
        </h1>

        {/* Main Card */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-1 ml-1">
                <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-200/50 rounded-md transition-colors">
                All
                </button>
                <button className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-900 rounded-md">
                Installed
                </button>
                <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-200/50 rounded-md transition-colors">
                Uninstalled
                </button>
            </div>
            <div className="flex items-center gap-1 pr-1">
                <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                <ArrowUpDown className="w-4 h-4" />
                </button>
            </div>
            </div>

            {/* Table Header */}
            <div className="px-4 py-2 bg-gray-50/30 border-b border-gray-200">
            <span className="text-[13px] font-medium text-gray-900">App</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
            
            {/* Online Store */}
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                    { /* Mocking the Shopify Green Bag Icon */ }
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 7H18L19.5 21H4.5L6 7Z" fill="white"/>
                    <path d="M9 11V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-900 mb-0.5">Online Store</span>
                    <span className="text-[12px] text-gray-500">Public app by Shopify</span>
                </div>
                </div>
                <button className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-md transition-colors">
                <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Headless */}
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#7ED4D9] flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-900 mb-0.5">Headless</span>
                    <span className="text-[12px] text-gray-500">Public app by Shopify</span>
                </div>
                </div>
                <button className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-md transition-colors">
                <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Point of Sale */}
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#2CB1E8] flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="8" width="14" height="12" rx="2" stroke="white" strokeWidth="2"/>
                    <path d="M9 8V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-900 mb-0.5">Point of Sale</span>
                    <span className="text-[12px] text-gray-500">Public app by Shopify</span>
                </div>
                </div>
                <button className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-md transition-colors">
                <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            </div>
        </div>

        </div>
    </div>
  );
}