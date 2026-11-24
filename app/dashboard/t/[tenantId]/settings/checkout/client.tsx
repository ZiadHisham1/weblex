// app/dashboard/t/[tenantId]/settings/checkout/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { Info, ChevronDown, ChevronRight, MapPin, ShoppingCart } from "lucide-react";

export default function CheckoutClient({ org }: { org: Organization }) {
  return (
    <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
      
      {/* Page Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-8">
        Checkout
      </h1>

      {/* Configurations */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Configurations</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Customize checkout and customer accounts</p>
        
        <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] font-semibold text-gray-900">ziadhisham configuration</span>
              <span className="px-2 py-[2px] rounded text-[11px] font-semibold bg-[#D1F5B8] text-green-800">
                Active
              </span>
            </div>
            <span className="text-[12px] text-gray-500">Last saved: Jun 4 at 11:37 am EDT</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">Duplicate</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">Edit</button>
            <button className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">•••</button>
          </div>
        </div>
      </div>

      {/* Customer Contact Method */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Customer contact method</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">
          The contact method customers enter at checkout will receive order and shipping notifications
        </p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
          {/* Option 1 */}
          <div className="flex items-start gap-3">
            <input type="radio" name="contact" defaultChecked className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300" />
            <div>
              <div className="text-[13px] font-medium text-gray-900">Phone number or email</div>
              <div className="text-[12px] text-gray-500">An SMS App is required to send SMS updates</div>
            </div>
          </div>
          
          {/* Option 2 */}
          <div className="flex items-start gap-3">
            <input type="radio" name="contact" className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300" />
            <div className="text-[13px] font-medium text-gray-900">Email</div>
          </div>

          {/* Option 3 */}
          <div className="flex items-start gap-3">
            <input type="radio" name="contact" defaultChecked className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300" />
            <div>
              <div className="text-[13px] font-medium text-gray-900 flex items-center gap-1">
                Show a link for customers to track their order with <a href="#" className="underline">Shop</a>
              </div>
              <div className="text-[12px] text-gray-500">Customers will be able to download the app from the order status page</div>
            </div>
          </div>

          {/* Option 4 */}
          <div className="flex items-start gap-3">
            <input type="radio" name="contact" className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300" />
            <div>
              <div className="text-[13px] font-medium text-gray-900">Require customers to sign in to their account before checkout</div>
              <div className="text-[12px] text-gray-500">Customers can only use email when sign-in is required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Customer information</h2>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          <div className="flex items-center justify-between p-4">
            <span className="text-[13px] font-medium text-gray-900">Full name</span>
            <select className="text-[13px] font-medium text-gray-700 bg-gray-50 border-none rounded-md py-1 pl-2 pr-8 focus:ring-0 cursor-pointer">
              <option>Only require last name</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-[13px] font-medium text-gray-900">Company name</span>
            <select className="text-[13px] font-medium text-gray-700 bg-gray-50 border-none rounded-md py-1 pl-2 pr-8 focus:ring-0 cursor-pointer">
              <option>Don't include</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-[13px] font-medium text-gray-900">Address line 2 (apartment, unit, etc.)</span>
            <select className="text-[13px] font-medium text-gray-700 bg-gray-50 border-none rounded-md py-1 pl-2 pr-8 focus:ring-0 cursor-pointer">
              <option>Optional</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-[13px] font-medium text-gray-900">Shipping address phone number</span>
            <select className="text-[13px] font-medium text-gray-700 bg-gray-50 border-none rounded-md py-1 pl-2 pr-8 focus:ring-0 cursor-pointer">
              <option>Don't include</option>
            </select>
          </div>
        </div>
      </div>

      {/* Marketing Opt-in */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Marketing opt-in</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Show a checkbox for customers to sign up for marketing</p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
          
          {/* Email Row */}
          <div>
            <div className="text-[13px] font-semibold text-gray-900 mb-2">Email</div>
            <div className="flex gap-4 items-center">
              <select className="w-1/2 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg py-2 px-3 focus:ring-black focus:border-black cursor-pointer appearance-none">
                <option>Checkout and sign-in</option>
              </select>
              <div className="w-1/2 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-[13px] text-gray-400">
                Email me with news and offers
              </div>
            </div>
          </div>

          {/* Preselect Box */}
          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="text-[13px] font-medium text-gray-900 mb-1">Preselect checkbox in certain regions</div>
            <div className="text-[13px] text-gray-500">None selected</div>
          </div>

          {/* SMS Row */}
          <div>
            <div className="text-[13px] font-semibold text-gray-900 mb-2">SMS</div>
            <div className="flex gap-4 items-center">
              <select className="w-1/2 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg py-2 px-3 focus:ring-black focus:border-black cursor-pointer appearance-none">
                <option>Don't show</option>
              </select>
              <div className="w-1/2 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-[13px] text-gray-400">
                Text me with news and offers
              </div>
            </div>
          </div>

          {/* WhatsApp Row */}
          <div>
            <div className="text-[13px] font-semibold text-gray-900 mb-2">WhatsApp</div>
            <div className="flex gap-4 items-center">
              <select className="w-1/2 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg py-2 px-3 focus:ring-black focus:border-black cursor-pointer appearance-none">
                <option>Don't show</option>
              </select>
              <div className="w-1/2 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-[13px] text-gray-400">
                Message me on WhatsApp with news and offers
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tipping */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Tipping</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Customers can choose between 3 presets or enter a custom amount</p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center gap-3">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          <span className="text-[13px] font-medium text-gray-900">Show tipping options at checkout</span>
        </div>
      </div>

      {/* Abandoned Checkout Emails */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[15px] font-semibold text-gray-900">Abandoned checkout emails</h2>
            <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          </div>
          <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Customize email
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Send an email to customers who didn't finish checking out</p>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-5">
          
          {/* Blue Banner */}
          <div className="bg-[#DDF4FF] rounded-lg p-3 flex items-start gap-2 border border-[#B6E2F5]">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-gray-800 leading-relaxed">
              A new abandoned checkout automation is available. The new version features improved email editing and workflow customization. <a href="#" className="underline">View automation</a>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
            <span className="text-[13px] font-medium text-gray-900">Send abandoned checkout emails automatically</span>
          </div>

          <div>
            <div className="text-[13px] text-gray-600 mb-2">Send to</div>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="abandon_to" className="mt-0.5 w-4 h-4 text-black focus:ring-black border-gray-300" />
                <span className="text-[13px] text-gray-900">Anyone who abandons their checkout</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="abandon_to" defaultChecked className="mt-0.5 w-4 h-4 text-black focus:ring-black border-gray-300" />
                <span className="text-[13px] text-gray-900">Email subscribers who abandon their checkout</span>
              </label>
            </div>
          </div>

          <div>
            <div className="text-[13px] text-gray-600 mb-2">Send after</div>
            <div className="space-y-2">
              {["1 hour", "6 hours", "10 hours (recommended)", "24 hours"].map((time) => (
                <label key={time} className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="abandon_time" defaultChecked={time === "10 hours (recommended)"} className="mt-0.5 w-4 h-4 text-black focus:ring-black border-gray-300" />
                  <span className="text-[13px] text-gray-900">{time}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Checkout Language */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Checkout language</h2>
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-900">English</span>
          <button className="text-[13px] font-medium text-gray-900 hover:underline">Edit checkout content</button>
        </div>
      </div>

      {/* Advanced Preferences */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Advanced preferences</h2>
        
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <MapPin className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-medium text-gray-900">Address collection</span>
                <span className="text-[12px] text-gray-500">Manage how you collect shipping and billing addresses</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-gray-900">Add-to-cart limit</span>
                  <span className="px-1.5 py-[1px] rounded bg-gray-100 text-[11px] font-medium text-gray-600">Recommended</span>
                </div>
                <span className="text-[12px] text-gray-500">Protects your available inventory quantities from being revealed</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-1.5 py-[1px] rounded bg-[#D1F5B8] text-[11px] font-semibold text-green-800 border border-green-300/50">On</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      </div>

      {/* Checkout Rules */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-[15px] font-semibold text-gray-900">Checkout rules</h2>
          <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
          Rules set parameters for how the cart or checkout responds to different customer scenarios. You can set product limits, perform age verification and more.
        </p>
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm text-[13px] text-gray-700">
          There are no apps installed with rules for checkout or cart. Visit the <a href="#" className="underline">Shopify App Store</a> to install one.
        </div>
      </div>

    </div>
  );
}