// app/dashboard/t/[tenantId]/settings/policies/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Plus, ChevronRight, MoreHorizontal,
  RefreshCcw, Lock, FileText, Truck, 
  MessageSquare, Gavel, ShoppingCart
} from "lucide-react";

const WRITTEN_POLICIES = [
  { id: "refund", label: "Return and refund policy", icon: RefreshCcw, status: "No policy set" },
  { id: "privacy", label: "Privacy policy", icon: Lock, status: "Published", isAutomated: true },
  { id: "terms", label: "Terms of service", icon: FileText, status: "No policy set" },
  { id: "shipping", label: "Shipping policy", icon: Truck, status: "No policy set" },
  { id: "contact", label: "Contact information", icon: MessageSquare, status: "No policy set", isRequired: true },
  { id: "legal", label: "Legal notice", icon: Gavel, status: "No policy set" },
  { id: "cancellation", label: "Purchase options cancellation policy", icon: ShoppingCart, status: "No policy set", isRequired: true },
];

export default function PoliciesClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Policies
      </h1>

      {/* Return and cancellation rules Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Return and cancellation rules</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors">
            <Plus className="w-4 h-4" /> Rule
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Set conditions and fees for return and cancellation requests</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group">
          <span className="text-[13px] font-medium text-gray-900">Default rules</span>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-700">
              No rules set
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Written Policies Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Written policies</h2>
          <button className="text-gray-500 hover:text-gray-900 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">By default, policies appear in the footer of your online store and checkout</p>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          {WRITTEN_POLICIES.map((policy) => (
            <button 
              key={policy.id}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left"
            >
              {/* Left side: Icon + Title */}
              <div className="flex items-center gap-3 w-5/12">
                <policy.icon className="w-[18px] h-[18px] text-gray-500 shrink-0" strokeWidth={2} />
                <span className="text-[13px] font-medium text-gray-900 truncate">{policy.label}</span>
              </div>

              {/* Middle side: Required / Automated badges */}
              <div className="w-3/12 flex items-center">
                {policy.isAutomated && (
                  <span className="text-[12px] text-gray-600">Automated</span>
                )}
                {policy.isRequired && (
                  <span className="px-2 py-0.5 rounded bg-[#FDE8C4] text-[#9B5B00] text-[12px] font-semibold">
                    Required
                  </span>
                )}
              </div>

              {/* Right side: Status Pill + Chevron */}
              <div className="w-4/12 flex items-center justify-end gap-3">
                {policy.status === "Published" ? (
                  <span className="inline-flex px-2 py-[2px] rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800 border border-green-300/50">
                    Published
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[12px] font-medium text-gray-600">
                    {policy.status}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[13px] text-gray-500 leading-relaxed mt-4">
        Recommended policies are not legal advice. You are responsible for ensuring they are accurate and comply with applicable laws. <a href="#" className="underline">Learn more</a>
      </p>

    </div>
  );
}