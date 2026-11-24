// app/dashboard/t/[tenantId]/settings/payments/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  AlertCircle, CreditCard, ChevronRight, Plus, 
  Target, Scissors, Wallet, Lock, Store, Banknote
} from "lucide-react";

export default function PaymentsClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-20">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-6">
        Payments
      </h1>

      {/* Warning Banner */}
      <div className="bg-[#FCF4D4] border border-[#F5E6A3] rounded-xl p-4 mb-10 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" stroke="white" />
        <div>
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">
            Development stores can only process test payments
          </h3>
          <p className="text-[13px] text-gray-700 leading-relaxed">
            Activate the test payment gateway, or set your payment provider to test mode. Learn more about testing in development stores.
          </p>
        </div>
      </div>

      {/* Test Payment Gateway */}
      <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Test payment gateway</h2>
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden mb-8">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-3">
            <CreditCard className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
            <span className="text-[14px] font-medium text-gray-900">Payment methods</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-5 rounded border border-gray-200 bg-gray-100 flex items-center justify-center shadow-sm z-10">
                <div className="w-4 h-1 bg-gray-300 rounded-sm"></div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
          </div>
        </button>
      </div>

      {/* More Ways to Pay */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">More ways to pay</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Offer methods processed offsite or through custom checkout integrations</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors">
          <Plus className="w-4 h-4" /> Method
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden mb-8">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-gray-900">PayPal</span>
            <span className="px-2 py-[2px] rounded text-[11px] font-semibold bg-[#FDE8C4] text-[#9B5B00]">
              Inactive
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-5 rounded bg-white border border-gray-200 flex items-center justify-center shadow-sm text-[#003087] font-bold text-[10px]">
              P
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
          </div>
        </button>
      </div>

      {/* Manual Payment Methods */}
      <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Manual payment methods</h2>
      <p className="text-[13px] text-gray-500 mb-3">Accept payments outside your online store, like bank deposits or cash on delivery</p>
      
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center mb-8 bg-gray-50/30">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors border border-gray-200">
          <Plus className="w-4 h-4" /> Method
        </button>
      </div>

      {/* Payment Configuration */}
      <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Payment configuration</h2>
      
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
        {[
          { icon: Target, label: "Payment capture method" },
          { icon: Scissors, label: "Payment method customizations" },
          { icon: CreditCard, label: "Gift card expiration" },
          { icon: Wallet, label: "Apple Wallet passes" },
          { icon: Store, label: "Add business entity" },
        ].map((item, idx) => (
          <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <item.icon className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
              <span className="text-[14px] font-medium text-gray-900">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
          </button>
        ))}
      </div>

    </div>
  );
}