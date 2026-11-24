// app/dashboard/t/[tenantId]/settings/customer-events/client.tsx
"use client";

import { Organization } from "@prisma/client";
import { Info } from "lucide-react";

// Custom SVG Illustration to match the screenshot precisely
function PixelsIllustration() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
      {/* Light gray background circle */}
      <circle cx="105" cy="70" r="55" fill="#F0F0F0" />
      
      {/* Background document shapes */}
      <rect x="85" y="50" width="60" height="10" rx="2" fill="#D9D9D9" />
      <rect x="85" y="65" width="40" height="8" rx="2" fill="#D9D9D9" />
      <rect x="85" y="80" width="50" height="8" rx="2" fill="#D9D9D9" />
      
      {/* Foreground white browser window */}
      <rect x="35" y="25" width="80" height="60" rx="4" fill="white" stroke="#E5E5E5" strokeWidth="2" />
      
      {/* Browser header lines (the colored code snippets) */}
      <rect x="45" y="35" width="15" height="4" rx="2" fill="#D9D9D9" />
      <rect x="65" y="35" width="25" height="4" rx="2" fill="#FCD34D" /> {/* Yellow */}
      <rect x="95" y="35" width="10" height="4" rx="2" fill="#D9D9D9" />
      
      <rect x="45" y="45" width="10" height="4" rx="2" fill="#F87171" /> {/* Red */}
      <rect x="60" y="45" width="30" height="4" rx="2" fill="#D9D9D9" />
      
      <rect x="45" y="55" width="20" height="4" rx="2" fill="#5EEAD4" /> {/* Teal */}
      <rect x="70" y="55" width="15" height="4" rx="2" fill="#FCD34D" /> {/* Yellow */}
      
      <rect x="45" y="65" width="25" height="4" rx="2" fill="#FCD34D" /> {/* Yellow */}
      <rect x="75" y="65" width="15" height="4" rx="2" fill="#D9D9D9" />

      {/* Connector lines (The circuit/plug shape) */}
      <path d="M75 85 L75 105 L95 105" stroke="#1F2937" strokeWidth="2.5" fill="none" />
      <circle cx="100" cy="105" r="4.5" fill="white" stroke="#1F2937" strokeWidth="2.5" />
      
      {/* Little arrows on the browser sides */}
      <path d="M40 50 L35 55 L40 60" stroke="#D9D9D9" strokeWidth="2" fill="none" />
      <path d="M110 50 L115 55 L110 60" stroke="#D9D9D9" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function CustomerEventsClient({ org }: { org: Organization }) {
  return (
    <div>
        {/* Top Action Buttons */}
        <div className="flex items-center justify-end gap-2 mb-8">
            <button className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            Add custom pixel
            </button>
            <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-colors">
            Explore pixel apps
            </button>
        </div>
        <div className="mx-auto w-full max-w-[850px] pt-10 px-4 md:px-8 pb-32">
        {/* Page Header */}
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-10">
            Customer events
        </h1>

        {/* Pixels Section */}
        <div className="max-w-[850px]">
            <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Pixels</h2>
            <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            </div>

            {/* Empty State Card */}
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
            
            <PixelsIllustration />
            
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">
                This is where you'll manage your pixels
            </h3>
            <p className="text-[13px] text-gray-500 mb-6 max-w-[400px]">
                Collect customer events through app pixel or custom pixel integrations.
            </p>
            
            {/* Inner Action Buttons */}
            <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Add custom pixel
                </button>
                <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors">
                Explore pixel apps
                </button>
            </div>

            </div>

            {/* Bottom Link */}
            <div className="flex justify-center mt-6">
            <a href="#" className="text-[13px] font-medium text-gray-800 hover:underline">
                Learn more about pixels
            </a>
            </div>

        </div>
        </div>
    </div>
  );
}