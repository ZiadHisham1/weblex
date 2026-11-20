// app/dashboard/t/[tenantId]/orders/shipping-labels/page.tsx
import Link from 'next/link';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { Truck, Check, Tag, Package, Barcode, MapPin } from 'lucide-react';

export default async function ShippingLabelsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const features = [
    {
      icon: Tag,
      text: 'Discounted shipping rates with top carriers',
    },
    {
      icon: Truck,
      text: 'Orders from every sales channel in one place',
    },
    {
      icon: Package,
      text: 'Pick, pack, and ship up to 250 orders at once',
    },
    {
      icon: Barcode,
      text: 'Scan items to verify before they ship',
    },
    {
      icon: MapPin,
      text: 'Tracking sent to customers automatically',
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 pb-20">
      {/* Header */}
      <header className="flex items-center gap-2 pb-4">
        <Truck className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold text-gray-900">Shipping labels</h1>
      </header>

      {/* Hero Card */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-14">
          {/* Left: Content */}
          <div className="max-w-md">
            {/* Carrier logos */}
            <div className="flex items-center gap-2 mb-6">
              {/* USPS-style red badge */}
              <div className="w-7 h-7 rounded-md bg-[#E31837] flex items-center justify-center">
                <div className="w-4 h-[3px] bg-white rounded-sm" />
              </div>
              {/* DHL-style yellow badge */}
              <div className="w-7 h-7 rounded-md bg-[#FFCC00] flex items-center justify-center">
                <span className="text-[8px] font-black text-[#D40511] tracking-tight leading-none">
                  DHL
                </span>
              </div>
              {/* FedEx-style purple badge */}
              <div className="w-7 h-7 rounded-md bg-[#4D148C] flex items-center justify-center">
                <span className="text-[7px] font-black text-white tracking-tighter leading-none">
                  FedEx
                </span>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight mb-6">
              Everything you need to ship,
              <br />
              included in your plan
            </h2>

            {/* Feature list */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <IconComponent
                      className="w-4 h-4 text-gray-500 shrink-0 mt-1"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {feature.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <Link
              href={`/dashboard/t/${tenantId}/settings/shipping/rates`}
              className="inline-block bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Set up city rates
            </Link>
          </div>

          {/* Right: Illustration */}
          <div className="relative flex items-center justify-center">
            <ShippingIllustration />
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center pt-6">
        <Link
          href="#"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Learn more about buying shipping labels
        </Link>
      </div>
    </div>
  );
}

/**
 * Inline SVG illustration matching the Shopify-style image:
 * a thermal label printer on top of two stacked boxes, plus a small box.
 * Includes soft color glow behind it.
 */
function ShippingIllustration() {
  return (
    <div className="relative w-full max-w-[480px] aspect-square">
      {/* Soft color glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-yellow-100 via-green-50 to-blue-100 blur-3xl opacity-80" />
      </div>

      <svg
        viewBox="0 0 480 480"
        className="relative w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ==================== Small right box ==================== */}
        <g>
          <rect x="318" y="300" width="120" height="90" rx="3" fill="#C89B6D" />
          <rect x="318" y="300" width="120" height="14" rx="2" fill="#B8895B" />
          <rect x="318" y="376" width="120" height="14" rx="2" fill="#A87A4E" />
          {/* Label on top */}
          <rect x="340" y="272" width="76" height="46" rx="2" fill="#FFFFFF" stroke="#D0D0D0" />
          <rect x="346" y="278" width="40" height="4" rx="1" fill="#444" />
          <rect x="346" y="286" width="64" height="3" rx="1" fill="#999" />
          <rect x="346" y="292" width="64" height="3" rx="1" fill="#999" />
          <rect x="346" y="298" width="48" height="3" rx="1" fill="#999" />
          <rect x="346" y="304" width="30" height="8" rx="1" fill="#222" />
          {/* Tapes */}
          <rect x="370" y="300" width="14" height="14" fill="#D9C29E" opacity="0.85" />
        </g>

        {/* ==================== Big bottom-left box ==================== */}
        <g>
          <rect x="70" y="270" width="220" height="130" rx="3" fill="#D4A876" />
          {/* Top face */}
          <polygon
            points="70,270 290,270 300,258 80,258"
            fill="#E0B98A"
          />
          {/* Front face */}
          <rect x="70" y="270" width="220" height="130" rx="3" fill="#D4A876" />
          {/* Side face */}
          <polygon
            points="290,270 300,258 300,388 290,400"
            fill="#B8895B"
          />
          {/* Tape strips on top */}
          <rect x="150" y="258" width="18" height="20" fill="#D9C29E" opacity="0.9" />
          <rect x="230" y="258" width="18" height="20" fill="#D9C29E" opacity="0.9" />
          {/* Fragile / handling icons */}
          <g stroke="#8A6540" strokeWidth="1.5" fill="none" strokeLinecap="round">
            {/* Box arrow (this way up) */}
            <rect x="88" y="298" width="14" height="14" rx="2" />
            <path d="M95 302 L95 308 M92 305 L95 302 L98 305" />
            {/* Handle with care */}
            <rect x="112" y="298" width="14" height="14" rx="2" />
            <path d="M116 305 L119 302 L122 305" />
            {/* Umbrella (keep dry) */}
            <rect x="136" y="298" width="14" height="14" rx="2" />
            <path d="M139 305 Q143 301 147 305 M143 305 L143 309" />
          </g>
          {/* Shipping label on front */}
          <g>
            <rect x="220" y="300" width="60" height="76" rx="2" fill="#FFFFFF" stroke="#C9C9C9" />
            {/* P logo box */}
            <rect x="224" y="304" width="14" height="14" rx="1" fill="#222" />
            <text
              x="231"
              y="314"
              fontSize="9"
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              P
            </text>
            <text
              x="242"
              y="311"
              fontSize="5"
              fontWeight="bold"
              fill="#333"
            >
              PRIORITY
            </text>
            <text x="242" y="316" fontSize="3.5" fill="#666">
              MAIL
            </text>
            {/* Address lines */}
            <rect x="224" y="322" width="52" height="2.5" rx="0.5" fill="#999" />
            <rect x="224" y="327" width="44" height="2.5" rx="0.5" fill="#999" />
            <rect x="224" y="332" width="50" height="2.5" rx="0.5" fill="#999" />
            <rect x="224" y="337" width="38" height="2.5" rx="0.5" fill="#999" />
            {/* Barcode */}
            <g fill="#222">
              {[...Array(18)].map((_, i) => (
                <rect
                  key={i}
                  x={224 + i * 3}
                  y="346"
                  width={i % 3 === 0 ? 1.8 : 1}
                  height="22"
                />
              ))}
            </g>
            {/* Bottom barcode number */}
            <rect x="224" y="372" width="52" height="2" rx="0.5" fill="#666" />
          </g>
        </g>

        {/* ==================== Box sitting on top-left ==================== */}
        <g>
          <polygon
            points="180,190 300,190 308,180 188,180"
            fill="#E0B98A"
          />
          <rect x="180" y="190" width="120" height="70" rx="3" fill="#D4A876" />
          <polygon
            points="300,190 308,180 308,250 300,260"
            fill="#B8895B"
          />
          {/* Tape strips */}
          <rect x="216" y="180" width="14" height="20" fill="#D9C29E" opacity="0.9" />
          <rect x="262" y="180" width="14" height="20" fill="#D9C29E" opacity="0.9" />
        </g>

        {/* ==================== Thermal printer ==================== */}
        <g>
          {/* Label paper coming out */}
          <rect x="205" y="150" width="60" height="52" rx="2" fill="#FFFFFF" stroke="#C9C9C9" />
          {/* P logo on paper */}
          <rect x="210" y="156" width="12" height="12" rx="1" fill="#222" />
          <text
            x="216"
            y="165"
            fontSize="8"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            P
          </text>
          <text x="226" y="162" fontSize="4.5" fontWeight="bold" fill="#333">
            PRIORITY
          </text>
          <text x="226" y="167" fontSize="3" fill="#666">
            MAIL
          </text>
          {/* Address lines */}
          <rect x="210" y="174" width="50" height="2" rx="0.5" fill="#999" />
          <rect x="210" y="179" width="42" height="2" rx="0.5" fill="#999" />
          <rect x="210" y="184" width="48" height="2" rx="0.5" fill="#999" />
          {/* Barcode on paper */}
          <g fill="#222">
            {[...Array(16)].map((_, i) => (
              <rect
                key={i}
                x={210 + i * 3.2}
                y="190"
                width={i % 2 === 0 ? 1.6 : 1}
                height="8"
              />
            ))}
          </g>

          {/* Printer body */}
          <rect x="195" y="112" width="80" height="44" rx="8" fill="#2B2B2B" />
          {/* Top highlight */}
          <rect x="195" y="112" width="80" height="10" rx="6" fill="#3A3A3A" />
          {/* Slot for paper */}
          <rect x="203" y="140" width="64" height="6" rx="1" fill="#111" />
          {/* Printer feet */}
          <rect x="205" y="156" width="10" height="4" rx="1" fill="#1A1A1A" />
          <rect x="255" y="156" width="10" height="4" rx="1" fill="#1A1A1A" />
          {/* Power LED */}
          <circle cx="262" cy="126" r="2.5" fill="#4ADE80" />
        </g>
      </svg>
    </div>
  );
}