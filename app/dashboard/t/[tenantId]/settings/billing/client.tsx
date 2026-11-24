// app/dashboard/t/[tenantId]/settings/billing/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  ChevronRight, PlusCircle, Search, SlidersHorizontal, 
  ArrowUpDown, ChevronLeft, BookOpen 
} from "lucide-react";

// Mock data to match the screenshot exactly
const MOCK_BILLS = [
  { id: "1", date: "Oct 28, 2026", number: "#612691217", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "2", date: "Sep 28, 2026", number: "#596279410", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "3", date: "Aug 29, 2026", number: "#580879556", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "4", date: "Jul 30, 2026", number: "#565942838", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "5", date: "Jun 30, 2026", number: "#551680949", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "6", date: "May 31, 2026", number: "#537691472", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "7", date: "May 1, 2026",  number: "#523728591", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "8", date: "Apr 1, 2026",  number: "#509929581", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "9", date: "Mar 2, 2026",  number: "#496215621", type: "Billing cycle", status: "Paid", amount: "$0.00" },
  { id: "10", date: "Jan 31, 2026", number: "#481938769", type: "Billing cycle", status: "Paid", amount: "$0.00" },
];

export default function BillingClient({ org }: { org: Organization }) {
  return (
    <div>
    {/* Top Bar Actions */}
      <div className="flex justify-end mb-8">
        <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <BookOpen className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          Billing profile
        </button>
      </div>
      
    <div className="mx-auto w-full max-w-[850px] px-4 md:px-8 pb-20">

      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Billing
      </h1>

      {/* Current Billing Cycle Section */}
      <h2 className="text-[15px] font-medium text-gray-900 mb-4">Current billing cycle</h2>
      
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden mb-10">
        {/* Top half of current cycle */}
        <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200">
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">$0.00</span>
              <span className="text-[14px] text-gray-500 font-medium">USD</span>
            </div>
            <div className="text-[13px] text-gray-600">
              Running total • Oct 28, 2026 - Nov 27, 2026
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={2} />
        </div>

        {/* Add payment method */}
        <button className="w-full flex items-center gap-2 p-4 text-[14px] font-medium text-gray-800 hover:bg-gray-50 transition-colors">
          <PlusCircle className="w-[18px] h-[18px] text-gray-600" strokeWidth={1.5} />
          Add payment method
        </button>
      </div>

      {/* Past Bills Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-medium text-gray-900">Past bills</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Export bills
          </button>
          <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Create expense report
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-900 rounded-md">All</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Paid</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Open</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Failed</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Processing</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Refunded</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors">Canceled</button>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><Search className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><SlidersHorizontal className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><ArrowUpDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-gray-200 text-[13px] font-medium text-gray-500">
          <div className="col-span-1 flex items-center">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          </div>
          <div className="col-span-3">Date issued</div>
          <div className="col-span-3">Bill number</div>
          <div className="col-span-3">Bill type</div>
          <div className="col-span-2">Payment status</div>
          <div className="col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 hidden" /> {/* spacer */}
        </div>
        
        {/* We need to adjust the grid for the amounts to fit properly, so I will override the header grid slightly */}
        <div className="hidden">Fix grid above</div>

        {/* Corrected Table Header */}
        <div className="grid grid-cols-[40px_2fr_2fr_2fr_1.5fr_1fr] gap-4 px-4 py-3 border-b border-gray-200 text-[13px] font-medium text-gray-500">
          <div className="flex items-center">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          </div>
          <div>Date issued</div>
          <div>Bill number</div>
          <div>Bill type</div>
          <div>Payment status</div>
          <div className="text-right pr-4">Amount</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {MOCK_BILLS.map((bill) => (
            <div 
              key={bill.id} 
              className="grid grid-cols-[40px_2fr_2fr_2fr_1.5fr_1fr] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
              </div>
              
              <div className="text-[14px] text-gray-900">{bill.date}</div>
              <div className="text-[14px] text-gray-900">{bill.number}</div>
              <div className="text-[14px] text-gray-900">{bill.type}</div>
              
              <div>
                <span className="inline-flex px-2 py-[2px] rounded text-[12px] font-semibold bg-[#D1F5B8] text-green-800 border border-green-300/50">
                  {bill.status}
                </span>
              </div>
              
              <div className="text-[14px] text-gray-900 text-right pr-4">
                {bill.amount}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
          <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}