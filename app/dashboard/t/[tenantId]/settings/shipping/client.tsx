// app/dashboard/t/[tenantId]/settings/shipping/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Info, ChevronUp, ChevronDown, Store, Globe, 
  Truck, MapPin, Package, Box, Plus, Calculator, ArrowUpDown
} from "lucide-react";

export default function ShippingClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Shipping and delivery
      </h1>

      {/* Shipping Section */}
      <div className="mb-10">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Shipping</h2>

        <div className="border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col">
          
          {/* Expanded: Shipping Options */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-medium text-gray-900 mb-0.5">Shipping options</h3>
                <p className="text-[13px] text-gray-500">Manage where you ship and what it costs</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-500">3 markets</span>
                <ChevronUp className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-[#F6F6F7] border border-gray-200 rounded-lg p-3 flex items-center justify-between mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-medium text-gray-900 mb-0.5">Shipping has moved to Markets</div>
                  <div className="text-[13px] text-gray-500">Your shipping rates haven't changed—just where you manage them. <a href="#" className="underline">Learn more</a></div>
                </div>
              </div>
              <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 shrink-0">
                Switch back
              </button>
            </div>

            {/* Markets Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 mb-3">
              
              {/* Egypt */}
              <div className="flex items-center p-3">
                <div className="w-1/3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-[13px] text-gray-900">Egypt</span>
                </div>
                <div className="w-2/3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-600">Standard</span>
                </div>
              </div>

              {/* International */}
              <div className="flex items-center p-3">
                <div className="w-1/3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-[13px] text-gray-900">International</span>
                </div>
                <div className="w-2/3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-600">Standard</span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-600">Free International Shipping</span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-600">International Shipping</span>
                </div>
              </div>

              {/* Mexico */}
              <div className="flex items-center p-3">
                <div className="w-1/3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-[13px] text-gray-900">Mexico</span>
                </div>
                <div className="w-2/3 flex items-center gap-1.5">
                  <span className="text-[13px] text-gray-700">Not shipping</span>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Market
            </button>
          </div>

          {/* Collapsed Rows */}
          <div className="divide-y divide-gray-100">
            
            {/* Delivery estimates */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="text-left">
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Delivery estimates</div>
                <div className="text-[13px] text-gray-500">Show customers when they can expect their orders to arrive</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">Off</span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </button>

            {/* Shipping labels */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="text-left flex items-start gap-1.5">
                <div>
                  <div className="text-[14px] font-medium text-gray-900 mb-0.5">Shipping labels</div>
                  <div className="text-[13px] text-gray-500">Buy discounted shipping labels and manage preferred carriers</div>
                </div>
                <Info className="w-3.5 h-3.5 text-gray-400 mt-1" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-700">
                  <Calculator className="w-3.5 h-3.5" /> Calculate rates
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </button>

            {/* Packages */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="text-left flex items-start gap-1.5">
                <div>
                  <div className="text-[14px] font-medium text-gray-900 mb-0.5">Packages</div>
                  <div className="text-[13px] text-gray-500">Set package sizes to get accurate shipping rates</div>
                </div>
                <Info className="w-3.5 h-3.5 text-gray-400 mt-1" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">1 box</span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </button>

            {/* Carrier accounts */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="text-left">
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Carrier accounts</div>
                <div className="text-[13px] text-gray-500">Connect your existing carrier account to use your own rates</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">None</span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </button>

            {/* Order routing */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="text-left">
                <div className="text-[14px] font-medium text-gray-900 mb-0.5">Order routing</div>
                <div className="text-[13px] text-gray-500">Manage how locations are assigned to new orders</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">2 rules</span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* Additional Delivery Methods */}
      <div className="mb-10">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Additional delivery methods</h2>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <Store className="w-[18px] h-[18px] text-gray-500" strokeWidth={2} />
              <span className="text-[14px] font-medium text-gray-900">Local delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-700">Off</span>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" strokeWidth={2} />
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <Package className="w-[18px] h-[18px] text-gray-500" strokeWidth={2} />
              <span className="text-[14px] font-medium text-gray-900">Pickup in store</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-700">Off</span>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" strokeWidth={2} />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <MapPin className="w-[18px] h-[18px] text-gray-500" strokeWidth={2} />
              <span className="text-[14px] font-medium text-gray-900">Pickup points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-700">Off</span>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-gray-900">Documents</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Create document <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 border-b border-gray-200">
            <span className="text-[13px] font-medium text-gray-900">Name</span>
            <button className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Date modified <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {["Pick list", "Packing Slip", "Invoice"].map((doc) => (
              <div key={doc} className="px-4 py-3 text-[14px] text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                {doc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Customizations */}
      <div className="mb-10">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Delivery customizations</h2>
        <p className="text-[13px] text-gray-500 mb-3">Customizations control how delivery options appear to buyers at checkout. You can hide, reorder, and rename delivery options.</p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/30">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors border border-gray-200">
            <Plus className="w-4 h-4" /> Delivery customization
          </button>
        </div>
      </div>

      {/* Custom Order Fulfillment */}
      <div>
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Custom order fulfillment</h2>
        <p className="text-[13px] text-gray-500 mb-3">Add an email to notify anyone who fulfills orders for you</p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/30">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors border border-gray-200">
            <Plus className="w-4 h-4" /> Fulfillment service
          </button>
        </div>
      </div>

    </div>
  );
}