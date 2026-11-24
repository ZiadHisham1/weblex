// app/dashboard/t/[tenantId]/settings/organization-details/client.tsx
"use client";

import { Organization, Tenant } from "@prisma/client";
import { 
  Pencil, Globe, Mail, MapPin, Plus, Search, 
  SlidersHorizontal, ArrowUpDown, CheckCircle2
} from "lucide-react";

// Type extension because we included tenants in the Prisma query
type OrganizationWithStores = Organization & {
  tenants: Tenant[];
};

export default function OrganizationClient({ org }: { org: OrganizationWithStores }) {
  return (
    <div className="mx-auto mb-30 w-full max-w-[850px] h-full py-10 px-4 md:px-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">{org.name}</h1>
        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">Organization overview</h2>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        
        {/* Contact Details Card */}
        <div className="relative h-fit border border-gray-200 rounded-2xl p-5 overflow-hidden bg-white shadow-sm">
          {/* Subtle Map Background */}
          <div 
            className="absolute left-40 inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-cover bg-center"
            style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')" }}
          />
          
          <div className="relative z-10 flex justify-between items-start mb-4">
            <h3 className="font-medium text-gray-900">Contact details</h3>
            <button className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 text-sm font-medium">
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </button>
          </div>

          <div className="relative z-10 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span>{org.website || "No website"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{org.email || "No email"}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="leading-tight">
                {org.addressLine1 ? (
                  <>
                    {org.addressLine1}, {org.city}, {org.country}
                    {org.postalCode && `, ${org.postalCode}`}
                  </>
                ) : (
                  "No address set"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Business Details Card */}
        <div className="border h-full border-gray-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col">
          <h3 className="font-medium text-gray-900 mb-4">Organization business details</h3>
          <div className="flex-1 border-1 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <Plus className="w-4 h-4 gap-0.5 mx-1 text-black font-semibold" />
            <span className="text-gray-800 font-semibold">Add new entity</span>
          </div>
        </div>
      </div>

      {/* Business Entities Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Business entities</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Entity
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden mb-10 shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-900 rounded-full">All</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-full">Active</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-full">Archived</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><Search className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><SlidersHorizontal className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><ArrowUpDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Empty State */}
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">No business entities found</h3>
          <p className="text-sm text-gray-500">Try changing the filters or search term</p>
        </div>
      </div>

      {/* Stores Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Stores</h2>
        <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm font-medium transition-colors">
          Create store
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-900 rounded-md">All</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><Search className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><SlidersHorizontal className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><ArrowUpDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Store</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Type</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {org.tenants.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No stores linked to this organization.</div>
          ) : (
            org.tenants.map((store) => (
              <div key={store.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                {/* Store Name & Icon */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center text-white font-bold shrink-0">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-gray-900 truncate">{store.name}</span>
                    <span className="text-xs text-gray-500 truncate">{store.subdomain}.myweblex.com</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </div>
                
                {/* Type Badge */}
                <div className="col-span-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    Dev
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}