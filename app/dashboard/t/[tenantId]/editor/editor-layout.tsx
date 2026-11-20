"use client";

import { useState, useEffect } from "react";
import { X, Maximize, Minimize } from "lucide-react";
import { PuckEditorClient } from "./client";
import type { Data } from "@puckeditor/core";
import type { SiteType } from "@prisma/client";
import type { TenantProductOption, ResolvedProduct } from "@/puck.config";

export function EditorLayout({
  tenantId,
  initialData,
  pagePath,
  siteType,
  siteSubdomain,
  productOptions,
  productDetails,
}: {
  tenantId: string;
  initialData: Data;
  pagePath: string;
  siteType: SiteType;
  siteSubdomain: string;
  productOptions: TenantProductOption[];
  productDetails: Record<string, ResolvedProduct>;
}) {
  const [isFull, setIsFull] = useState(false);
  const [initialRect, setInitialRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Measure the available space on the dashboard when the component mounts
  useEffect(() => {
    // We measure the parent element to know where the editor *should* sit normally
    const parent = document.getElementById("editor-container-wrapper");
    if (parent) {
      const rect = parent.getBoundingClientRect();
      setInitialRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  if (!initialRect) return <div className="h-[calc(100vh-120px)] w-full animate-pulse bg-gray-100 rounded-2xl" />;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ease-in-out ${
          isFull ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFull(false)}
      />

      {/* 
        The Container
        We hardcode the exact starting pixel values so the browser can animate between them.
        The transition duration is exactly 300ms.
      */}
      <div
        style={{
          position: "fixed",
          top: isFull ? 0 : initialRect.top,
          left: isFull ? 0 : initialRect.left,
          width: isFull ? "100vw" : initialRect.width,
          height: isFull ? "100vh" : initialRect.height,
          transitionProperty: "all",
          transitionDuration: "300ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", // Tailwind's smooth ease-in-out
        }}
        className={`z-[9999] bg-white flex flex-col overflow-hidden will-change-[top,left,width,height]
          ${isFull ? "rounded-none p-4 shadow-2xl" : "rounded-2xl border border-gray-200 shadow-sm"}
        `}
      >
        {/* Exit Button */}
        <div
          className={`absolute top-9 left-45 z-50 transition-opacity duration-300 ${
            isFull ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setIsFull(false)}
            className="flex items-center justify-center px-3 py-0.5 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-lg border border-orange-500 transition-colors cursor-pointer"
          >
            <Minimize className="w-5 h-5 mr-1.5" />
            Minimize
          </button>
        </div>

        {/* Maximize Button */}
        <div
          className={`absolute top-5 left-40 z-50 transition-opacity duration-300 ${
            !isFull ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setIsFull(true)}
            className="flex items-center justify-center px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md shadow-md transition-colors cursor-pointer"
          >
            <Maximize className="w-3 h-3 mr-1.5" />
            Maximize
          </button>
        </div>

        {/* Inner Puck Editor */}
        <div className="flex-1 w-full h-full overflow-hidden">
          <PuckEditorClient
            tenantId={tenantId}
            initialData={initialData}
            pagePath={pagePath}
            siteType={siteType}
            siteSubdomain={siteSubdomain}
            productOptions={productOptions}
            productDetails={productDetails}
          />
        </div>
      </div>
    </>
  );
}