// app/dashboard/t/[tenantId]/settings/notifications/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { 
  Info, User, Users, Package, ChevronRight, Code2 
} from "lucide-react";

export default function NotificationsClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Notifications
      </h1>

      {/* Sender Email Section */}
      <div className="mb-10">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Sender email</h2>
        <p className="text-[13px] text-gray-500 mb-4">The email your store uses to send and receive emails from your customers</p>
        
        {/* Blue Info Banner */}
        <div className="bg-[#DDF4FF] border border-[#B6E2F5] rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] text-gray-900 leading-relaxed">
              Public domains like Gmail don't support custom sending. Customers will see your email as <span className="font-semibold">store+90816610600@shopifyemail.com</span>. For better brand recognition, use a custom domain or <a href="#" className="underline">create a new one</a>.
            </p>
          </div>
        </div>

        {/* Input Box Card */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-center">
          <input 
            type="email" 
            defaultValue="zzziadhisham947@gmail.com"
            className="w-full bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* First Group of Settings */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        
        {/* Customer notifications */}
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-start gap-4">
            <User className="w-5 h-5 text-gray-500 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-medium text-gray-900 mb-0.5">Customer notifications</span>
              <span className="text-[13px] text-gray-500">Notify customers about order and account events</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
        </button>

        {/* Staff notifications */}
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-start gap-4">
            <Users className="w-5 h-5 text-gray-500 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-medium text-gray-900 mb-0.5">Staff notifications</span>
              <span className="text-[13px] text-gray-500">Notify staff members about new order events</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
        </button>

        {/* Fulfillment request notification */}
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-start gap-4">
            <Package className="w-5 h-5 text-gray-500 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-medium text-gray-900 mb-0.5">Fulfillment request notification</span>
              <span className="text-[13px] text-gray-500">Notify your fulfillment service provider when you mark an order as fulfilled</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
        </button>

      </div>

      {/* Second Group (Webhooks) */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm mb-10">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
          <div className="flex items-start gap-4">
            <Code2 className="w-5 h-5 text-gray-500 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-medium text-gray-900 mb-0.5">Webhooks</span>
              <span className="text-[13px] text-gray-500">Send XML or JSON notifications about store events to a URL</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}