import React from "react";

export function OrdersIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={`w-5 h-5 ${ className || ''}`}
      {...props}
    >
      <path d="M1.75 8.75v2.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-2.5l-1.785-5.004a1.5 1.5 0 0 0-1.413-.996h-6.09a1.5 1.5 0 0 0-1.412.993zm12.5 0h-3.25a.75.75 0 0 0-.75.75.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75.75.75 0 0 0-.75-.75h-3.25"></path>
    </svg>
  );
}
