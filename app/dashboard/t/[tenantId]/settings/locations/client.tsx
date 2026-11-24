// app/dashboard/t/[tenantId]/settings/locations/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Plus, Search, ArrowUpDown, Info, MapPin, 
  ChevronUp, ChevronDown, Store, ChevronsUpDown, LayoutGrid
} from "lucide-react";

export default function LocationsClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Locations
      </h1>

      {/* All Locations Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">All locations</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors">
            <Plus className="w-4 h-4" /> Location
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Using 2 of 200 active locations available on your plan</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 flex-1">
              <button className="flex items-center gap-1 text-[13px] font-medium text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors ml-1">
                All <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <div className="relative flex items-center w-full max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5" />
                <input 
                  type="text" 
                  placeholder="Search and filter" 
                  className="w-full pl-8 pr-3 py-1 text-[13px] bg-transparent border-none focus:ring-0 placeholder:text-gray-500 outline-none"
                />
              </div>
            </div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors mr-1">
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="col-span-6 flex items-center gap-1 text-[13px] font-medium text-gray-900 cursor-pointer">
              Location <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="col-span-3 text-[13px] font-medium text-gray-900">POS Subscription</div>
            <div className="col-span-3 text-[13px] font-medium text-gray-900">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
              <div className="col-span-6 flex flex-col">
                <span className="text-[13px] font-medium text-gray-900 mb-0.5">My Custom Location</span>
                <span className="text-[12px] text-gray-500">123 Main St, Toronto Ontario, Canada</span>
              </div>
              <div className="col-span-3">
                <span className="inline-flex px-2 py-0.5 rounded text-[12px] font-semibold bg-[#A5E6EE] text-blue-900">
                  POS Pro
                </span>
              </div>
              <div className="col-span-3">
                <span className="inline-flex px-2 py-0.5 rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800">
                  Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
              <div className="col-span-6 flex flex-col">
                <span className="text-[13px] font-medium text-gray-900 mb-0.5">Shop location</span>
                <span className="text-[12px] text-gray-500">Egypt</span>
              </div>
              <div className="col-span-3">
                <span className="inline-flex px-2 py-0.5 rounded text-[12px] font-semibold bg-[#A5E6EE] text-blue-900">
                  POS Pro
                </span>
              </div>
              <div className="col-span-3">
                <span className="inline-flex px-2 py-0.5 rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Default Location */}
      <div className="mb-10">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Default location</h2>
        <p className="text-[13px] text-gray-500 mb-3">This location is used by Shopify and apps when no other location is specified</p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-start gap-3">
            <MapPin className="w-[18px] h-[18px] text-gray-500 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-[13px] font-medium text-gray-900 mb-0.5">Shop location</div>
              <div className="text-[13px] text-gray-500">Egypt</div>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
        </div>
      </div>

      {/* Point of Sale Subscriptions */}
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Point of Sale subscriptions</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-3">Start selling in person from any location with the in-person selling features included in your Shopify plan</p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-[#2CB1E8] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-gray-900 mb-0.5">Point of Sale</div>
              <div className="text-[13px] text-gray-500">Installed</div>
            </div>
          </div>
          <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Open
          </button>
        </div>
      </div>

      {/* App and Custom Fulfillment Locations */}
      <div>
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">App and custom fulfillment locations</h2>
        <p className="text-[13px] text-gray-500 mb-3">3rd-party services that manage inventory and fulfill orders</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-200">
          
          <div className="px-4 py-2.5 bg-gray-50/50 text-[13px] font-medium text-gray-500 flex justify-between">
            <span>Location</span>
            <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={2} />
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-[13px] font-medium text-gray-900 mb-0.5">weblex Test Data</div>
                <div className="text-[12px] text-gray-500">1 location</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-gray-900">App</span>
                <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={2} />
              </div>
            </div>

            <div className="relative pl-[18px] ml-1">
              <div className="absolute z-0 left-1 top-[-10] border-gray-300 border-l-4 border-b-4 w-10 h-10 rounded-bl-2xl" />
              <div className="relative p-2 border border-gray-100 rounded-2xl flex z-1 bg-white flex-col">
                <span className="text-[13px] font-medium text-gray-900 mb-0.5">Snow City Warehouse</span>
                <span className="text-[12px] text-gray-500">Egypt</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}