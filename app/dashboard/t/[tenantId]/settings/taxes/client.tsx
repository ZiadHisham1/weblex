// app/dashboard/t/[tenantId]/settings/taxes/client.tsx
"use client";

import ToggleButton from "@/components/ui/ToggleButton";
import { Organization } from "@prisma/client";
import { 
  Search, ArrowUpDown, ShieldCheck, Info, 
  ChevronRight, ChevronLeft, Tag, 
  MapPin, Receipt, FileText, Globe, Box
} from "lucide-react";

const REGIONS = [
  { id: "egypt", flag: "🇪🇬", name: "Egypt", collecting: "Taxes" },
  { id: "australia", flag: "🇦🇺", name: "Australia", collecting: "—" },
  { id: "canada", flag: "🇨🇦", name: "Canada", collecting: "—" },
  { id: "eu", flag: "🇪🇺", name: "European Union", collecting: "—" },
  { id: "hongkong", flag: "🇭🇰", name: "Hong Kong SAR", collecting: "—" },
  { id: "israel", flag: "🇮🇱", name: "Israel", collecting: "—" },
  { id: "japan", flag: "🇯🇵", name: "Japan", collecting: "—" },
  { id: "malaysia", flag: "🇲🇾", name: "Malaysia", collecting: "—" },
  { id: "newzealand", flag: "🇳🇿", name: "New Zealand", collecting: "—" },
  { id: "norway", flag: "🇳🇴", name: "Norway", collecting: "—" },
  { id: "singapore", flag: "🇸🇬", name: "Singapore", collecting: "—" },
  { id: "southkorea", flag: "🇰🇷", name: "South Korea", collecting: "—" },
  { id: "switzerland", flag: "🇨🇭", name: "Switzerland", collecting: "—" },
  { id: "uae", flag: "🇦🇪", name: "United Arab Emirates", collecting: "—" },
  { id: "uk", flag: "🇬🇧", name: "United Kingdom", collecting: "—" },
];

export default function TaxesClient({ org }: { org: Organization }) {
  return (
    <div className="relative">
        {/* Top Right Report Button */}
        <div className="flex justify-end ">
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            Reports
            </button>
        </div>
        <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32 relative">

        {/* Page Header */}
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
            Taxes and duties
        </h1>

        {/* Tax service Section */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Tax service</h2>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Manage
            </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Shopify Tax</div>
                <div className="text-[13px] text-gray-500">Automatically calculates sales tax at checkout</div>
            </div>
            </div>
        </div>

        {/* Tax Regions Section */}
        <div className="mb-8">
            <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-[15px] font-semibold text-gray-900">Tax regions</h2>
            <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            </div>
            <p className="text-[13px] text-gray-500 mb-4">
            Where you collect and remit tax from customers. Create a <a href="#" className="underline">Market</a> to add a new tax region.
            </p>
            
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50/50">
                <div className="relative flex items-center w-full max-w-xs ml-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-transparent border-none focus:ring-0 placeholder:text-gray-500 outline-none"
                />
                </div>
                <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors mr-1">
                <ArrowUpDown className="w-4 h-4" />
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 bg-white">
                <div className="col-span-6 text-[13px] font-medium text-gray-500">Region</div>
                <div className="col-span-6 text-[13px] font-medium text-gray-500">Collecting</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
                {REGIONS.map((region) => (
                <div key={region.id} className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-6 flex items-center gap-3">
                    <span className="text-lg leading-none">{region.flag}</span>
                    <span className="text-[13px] text-gray-900">{region.name}</span>
                    </div>
                    <div className="col-span-6 text-[13px] text-gray-900">
                    {region.collecting}
                    </div>
                </div>
                ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center gap-2 p-2 border-t border-gray-200 bg-white">
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
            </div>
            </div>

            {/* Categorize Products Row (Attached to Table) */}
            <div className="mt-2 border border-gray-200 rounded-xl bg-[#F8F8F8] p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Categorize products</div>
                <div className="text-[12px] text-gray-500">Determines regional tax rate accuracy based on product categories</div>
            </div>
            <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#FCE974] text-yellow-900 text-[11px] font-bold border border-yellow-300">14</span>
                <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </div>
            </div>
        </div>

        {/* Duties and Import Taxes */}
        <div className="mb-8">
            <div className="flex items-center gap-1.5 mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Duties and import taxes</h2>
            <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4">
            <div className="flex items-start justify-between mb-4">
                <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Collect duties and import taxes at checkout</div>
                <div className="text-[13px] text-gray-500">Prevent surprise fees for international customers at delivery · 0.5% transaction fee</div>
                </div>
                <button className="px-2.5 py-1 text-[12px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200 shrink-0">
                Set up
                </button>
            </div>
            
            <div className="bg-[#DDF4FF] rounded-lg p-2.5 flex items-start gap-2 border border-[#B6E2F5]">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[12px] text-gray-800 leading-relaxed">
                <span className="font-semibold">Delivered duty paid (DDP)</span> shipping labels are only available when you ship from some of your fulfillment locations
                </p>
            </div>
            </div>
        </div>

        {/* Customs Information */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Customs information</h2>
            <button className="text-gray-500 hover:text-gray-900 font-bold tracking-widest px-2">...</button>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
            <div className="p-4">
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Country of origin</div>
                <div className="text-[13px] text-gray-500">Included in 0 out of 22 variants · No default set</div>
            </div>
            <div className="p-4">
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">Harmonized System (HS) codes</div>
                <div className="text-[13px] text-gray-500">Included in 1 out of 22 variants</div>
            </div>
            </div>
        </div>

        {/* Additional Configuration */}
        <div>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Additional configuration</h2>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
            
            {/* Row 1 */}
            <div className="flex items-start justify-between p-4">
                <div className="flex items-start gap-3">
                <Tag className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
                <div>
                    <div className="text-[13px] font-medium text-gray-900 mb-0.5">Include sales tax in product price and shipping rate</div>
                    <div className="text-[13px] text-gray-500">
                    Assumes a 14% tax rate, which is adjusted to local tax rates in markets with <a href="#" className="underline">dynamic tax inclusion</a>.
                    </div>
                </div>
                </div>
                <ToggleButton />
            </div>

            {/* Row 2 */}
            <div className="flex items-start justify-between p-4">
                <div className="flex items-start gap-3">
                <Receipt className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
                <div>
                    <div className="text-[13px] font-medium text-gray-900 mb-0.5">Charge sales tax on shipping</div>
                    <div className="text-[13px] text-gray-500">Automatically calculated for Canada, European Union, and United States.</div>
                </div>
                </div>
                <ToggleButton />
            </div>

            {/* Row 3 */}
            <div className="flex items-start justify-between p-4">
                <div className="flex items-start gap-3">
                <Globe className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
                <div>
                    <div className="text-[13px] font-medium text-gray-900 mb-0.5">Charge VAT on digital goods</div>
                    <div className="text-[13px] text-gray-500">
                    VAT is charged at checkout for <a href="#" className="underline">digital products</a> sold to European customers.
                    </div>
                </div>
                </div>
                <ToggleButton />
            </div>

            </div>
        </div>

        </div>
    </div>
  );
}