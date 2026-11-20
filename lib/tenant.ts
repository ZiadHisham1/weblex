import { cache } from 'react';
import { prisma } from '@/lib/db';

// lib/tenant.ts
export const getTenantBySite = cache(async (site: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { subdomain: site },
        { domains: { some: { hostname: site, verified: true } } },
      ],
    },
    include: { instance: true },
  });
  
  // 👇 Temporary log to verify
  console.log('Umami ID:', tenant?.umamiWebsiteId);
  
  return tenant;
});