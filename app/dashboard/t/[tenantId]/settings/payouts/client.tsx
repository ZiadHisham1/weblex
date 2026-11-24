// app/dashboard/t/[tenantId]/settings/payouts/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

// Custom SVG to perfectly match the dashed circle in the design
function DashedCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export default function PayoutsClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-12 px-6 md:px-0">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-1">
          Payouts
        </h1>
      </div>

      <h2 className="text-[15px] font-medium text-gray-900 mb-4 ml-1">
        Set up payouts
      </h2>

      {/* Setup Card */}
      <div className="border border-gray-200 rounded-2xl bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Step 1: Add Business Details */}
        <Link 
          href={`/dashboard/t/${org.id}/settings/organization-details`}
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group border-b border-gray-100"
        >
          <div className="flex items-center gap-4">
            <DashedCircle />
            <span className="text-[14px] font-medium text-gray-900">
              Add business details
            </span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>

        {/* Step 2: Add Payout Method (Locked State) */}
        <div className="flex items-center justify-between p-4 bg-white opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <DashedCircle />
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-gray-600">
                Add payout method
              </span>
              <span className="text-[13px] text-gray-500 mt-0.5">
                Available after you add business details
              </span>
            </div>
          </div>
          <Lock className="w-[18px] h-[18px] text-gray-700 mr-1" strokeWidth={1.5} />
        </div>

      </div>
    </div>
  );
}