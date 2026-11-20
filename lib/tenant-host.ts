// lib/tenant-host.ts
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

const ROOT = (process.env.ROOT_DOMAIN || 'localhost:3000').split(':')[0];

export async function getTenantFromHost() {
  const h = await headers();
  const host = (h.get('x-tenant-host') ?? h.get('host') ?? '').toLowerCase().split(':')[0];

  let key: string | null = null;
  
  // 👇 Add .lvh.me check here
  if (host.endsWith('.localhost') || host.endsWith('.lvh.me')) {
    key = host.split('.')[0];
  } 
  else if (host !== ROOT && host !== `www.${ROOT}`) {
    key = host;
  }

  if (!key) return null;

  return prisma.tenant.findFirst({
    where: {
      OR: [
        { subdomain: key },
        { domains: { some: { hostname: key, verified: true } } },
      ],
    },
    include: { medusa: true },
  });
}