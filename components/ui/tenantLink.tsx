// components/ui/TenantLink.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function TenantLink({
  href,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();

  // Detect if we are currently inside a /sites/[tenant] path
  const match = pathname.match(/^\/sites\/[^/]+/);
  
  // If we are in a tenant context, prepend the tenant path to the new link
  const finalHref = match ? `${match[0]}${href}` : href;

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  );
}