// app/dashboard/t/[tenantId]/settings/metafields/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Info, Tag, Blend, Layers, User, ShoppingBag, 
  FileEdit, Building2, MapPin, Map, ArrowRightLeft, 
  FileText, BookOpen, PenTool, Globe, Store, 
  Search, ArrowUpDown, ChevronRight
} from "lucide-react";

// Array for the first list
const METAFIELDS = [
  { id: "products", label: "Products", count: 2, icon: Tag },
  { id: "variants", label: "Variants", count: 0, icon: Blend },
  { id: "collections", label: "Collections", count: 0, icon: Layers },
  { id: "customers", label: "Customers", count: 0, icon: User },
  { id: "orders", label: "Orders", count: 0, icon: ShoppingBag },
  { id: "draft-orders", label: "Draft orders", count: 0, icon: FileEdit },
  { id: "companies", label: "Companies", count: 0, icon: Building2 },
  { id: "company-locations", label: "Company locations", count: 0, icon: Building2 },
  { id: "locations", label: "Locations", count: 0, icon: MapPin },
  { id: "transfers", label: "Transfers", count: 0, icon: ArrowRightLeft },
  { id: "pages", label: "Pages", count: 0, icon: FileText },
  { id: "blogs", label: "Blogs", count: 0, icon: BookOpen },
  { id: "blog-posts", label: "Blog posts", count: 0, icon: PenTool, isActive: true }, // Highlighted row
  { id: "markets", label: "Markets", count: 0, icon: Globe },
  { id: "shop", label: "Shop", count: 1, icon: Store },
];

export default function MetafieldsClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-10">
        Metafields and metaobjects
      </h1>

      {/* Metafield definitions Section */}
      <div className="mb-12">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Metafield definitions</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Add a custom piece of data to a specific part of your store.</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
          {METAFIELDS.map((item) => (
            <button 
              key={item.id} 
              className={`w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors group ${
                item.isActive ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
                <span className="text-[14px] font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">{item.count}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Metaobject definitions Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[15px] font-semibold text-gray-900">Metaobject definitions</h2>
            <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          </div>
          <button className="text-[13px] font-medium text-gray-900 hover:underline">
            Add definition
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Create a multi-field object for custom content or data structures.</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
          
          {/* Search Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
            <div className="relative flex items-center w-full max-w-xs ml-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-transparent border-none focus:ring-0 placeholder:text-gray-500 outline-none"
              />
            </div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors mr-1">
              <ArrowUpDown className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="col-span-6 text-[13px] font-medium text-gray-900">Definition name</div>
            <div className="col-span-3 text-[13px] font-medium text-gray-900">Added by</div>
            <div className="col-span-3 text-[13px] font-medium text-gray-900">Entries</div>
          </div>

          {/* Table Body */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="col-span-6 text-[13px] text-gray-900">Knowledge Base Facts</div>
            <div className="col-span-3 text-[13px] text-gray-900">Shopify</div>
            <div className="col-span-3 text-[13px] text-gray-900">2</div>
          </div>

        </div>
      </div>

    </div>
  );
}