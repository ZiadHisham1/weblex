// app/dashboard/t/[tenantId]/orders/abandoned-checkouts/page.tsx
import Link from 'next/link';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { ShoppingCart, Info, ChevronDown } from 'lucide-react';

export default async function AbandonedCheckoutsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  return (
    <div className="mx-auto  space-y-4 pb-20">
      {/* ============================================================ */}
      {/* Header                                                       */}
      {/* ============================================================ */}
      <header className="flex items-center gap-3 pb-2">
        <ShoppingCart
          className="w-5 h-5 text-gray-700"
          strokeWidth={1.5}
        />
        <h1 className="text-xl font-semibold text-gray-900">
          Abandoned checkouts
        </h1>

        {/* Status filter pill */}
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
          Incomplete
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </header>

      {/* ============================================================ */}
      {/* Upgrade banner                                               */}
      {/* ============================================================ */}
      <div className="flex items-start justify-between gap-4 rounded-xl bg-[#D7F2FA] border border-[#B9E6F3] px-4 py-3.5">
        <div className="flex items-start gap-3 min-w-0">
          {/* Info icon */}
          <div className="shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-[#007A9E]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#004C63]">
              Upgrade to the new abandoned checkout automation
            </p>
            <p className="text-sm text-[#0B556A] mt-0.5">
              A new abandoned checkout automation is available. The new
              version features improved email editing and workflow
              customization.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button className="shrink-0 bg-white hover:bg-gray-50 border border-[#8FD9EC] text-[#004C63] text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
          View automation
        </button>
      </div>

      {/* ============================================================ */}
      {/* Empty state card                                             */}
      {/* ============================================================ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12">
          {/* Left: text */}
          <div className="max-w-xl">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
              Abandoned checkouts will show here
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              See when customers put an item in their cart but don&apos;t check
              out. You can also email customers a link to their cart.
            </p>
          </div>

          {/* Right: illustration */}
          <div className="shrink-0">
            <AbandonedCartIllustration />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Footer link                                                  */}
      {/* ============================================================ */}
      <div className="text-center pt-6">
        <Link
          href="#"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Learn more about abandoned checkouts
        </Link>
      </div>
    </div>
  );
}

/**
 * Illustration: a shopping cart with a box inside, sitting on a light
 * circular background, with a red "X" badge overlapping the top-right.
 */
function AbandonedCartIllustration() {
  return (
    <div className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Light circular background */}
        <circle cx="100" cy="105" r="78" fill="#EDEDED" />

        {/* ==================== Shopping cart ==================== */}
        {/* Handle (green outline stroke) */}
        <path
          d="M 40 70 L 55 70 L 72 130 L 155 130"
          fill="none"
          stroke="#1F7A5C"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cart basket (green stroke) */}
        <path
          d="M 72 130 L 78 108 L 148 108 L 155 130"
          fill="none"
          stroke="#1F7A5C"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cart body fill (subtle, matches interior) */}
        <path
          d="M 78 108 L 148 108 L 155 130 L 72 130 Z"
          fill="#EDEDED"
        />

        {/* Wheels */}
        <circle cx="88" cy="145" r="8" fill="#1F7A5C" />
        <circle cx="142" cy="145" r="8" fill="#1F7A5C" />

        {/* ==================== Box / package inside cart ==================== */}
        <g>
          {/* Box front */}
          <rect x="92" y="78" width="42" height="34" rx="2" fill="#B8B8B8" />
          {/* Box top */}
          <polygon
            points="92,78 105,68 147,68 134,78"
            fill="#D0D0D0"
          />
          {/* Box side */}
          <polygon
            points="134,78 147,68 147,102 134,112"
            fill="#A0A0A0"
          />
          {/* Tape strip */}
          <rect x="108" y="68" width="10" height="14" fill="#E8E8E8" />
        </g>

        {/* ==================== Red X badge ==================== */}
        <g>
          {/* Outer soft glow */}
          <circle cx="152" cy="52" r="26" fill="#F5D6D0" opacity="0.6" />
          {/* Red circle */}
          <circle cx="152" cy="52" r="22" fill="#E0593F" />
          {/* White X */}
          <path
            d="M 144 44 L 160 60 M 160 44 L 144 60"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}