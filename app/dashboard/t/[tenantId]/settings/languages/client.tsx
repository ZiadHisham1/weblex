// app/dashboard/t/[tenantId]/settings/languages/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  MoreHorizontal, X, Sparkles, Star, Download, Languages as LangIcon 
} from "lucide-react";

export default function LanguagesClient({ org }: { org: Organization }) {
  return (
    <div>
        {/* Top Action Button */}
        <div className="flex items-center justify-end mb-8">
        <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-colors">
            Add language
        </button>
        </div>
        <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
        {/* Page Header */}
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-1.5">
            Languages
        </h1>
        <p className="text-[13px] text-gray-600 mb-8">
            Adding translations to your store improves cross-border conversion by an average of 13%
        </p>

        {/* Main Language Table Card */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden mb-6">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="col-span-5 text-[13px] font-medium text-gray-500">Language</div>
            <div className="col-span-3 text-[13px] font-medium text-gray-500">Status</div>
            <div className="col-span-4 text-[13px] font-medium text-gray-500">Domains</div>
            </div>

            {/* Table Body (English) */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="col-span-5 flex flex-col">
                <span className="text-[13px] font-medium text-gray-900">English</span>
                <span className="text-[12px] text-gray-500">Default</span>
            </div>
            <div className="col-span-3">
                <span className="inline-flex px-2 py-[2px] rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800 border border-green-300/50">
                Published
                </span>
            </div>
            <div className="col-span-4 flex items-center justify-between">
                <button className="flex items-center gap-1 text-[13px] text-gray-900 hover:text-black transition-colors">
                1 domain <span className="text-gray-400 text-[10px]">▼</span>
                </button>
                <button className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
            </div>

            {/* Purple Banner Row */}
            <div className="bg-[#F4EEFF] px-4 py-3 flex items-center justify-between border-t border-[#E5D5FF]">
            <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" strokeWidth={2} />
                <span className="text-[13px] font-medium text-gray-900">
                Add German for your customers in the International market
                </span>
            </div>
            <button className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <X className="w-4 h-4" strokeWidth={2} />
            </button>
            </div>
        </div>

        {/* weblex Translate & Adapt App Card */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-center justify-between mb-8">
            <div className="flex items-start gap-4">
            {/* Mock App Icon */}
            <div className="w-10 h-10 rounded-lg bg-[#2E94EA] flex items-center justify-center shrink-0">
                <LangIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5 flex items-center gap-2">
                weblex Translate & Adapt
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-1">
                4.4 <Star className="w-3.5 h-3.5 text-gray-800 fill-gray-800" /> 
                </div>
                <div className="text-[13px] text-gray-500">
                Translate your store and cater to global audiences
                </div>
            </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-medium transition-colors">
            <Download className="w-4 h-4" strokeWidth={2} />
            Install
            </button>
        </div>

        {/* Footer Link */}
        <div className="text-center">
            <span className="text-[13px] text-gray-700">
            To change your account language, <a href="#" className="underline hover:text-black">manage account</a>.
            </span>
        </div>

        </div>
    </div>
  );
}