// scripts/check-tenants.ts
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Check .env.local / .env in project root.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

(async () => {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      subdomain: true,
      name: true,
      deletedAt: true,
      domains: { select: { hostname: true, verified: true } },
    },
  });
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));

  const match = await prisma.tenant.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { subdomain: 'acme' },
        { domains: { some: { hostname: 'acme', verified: true } } },
      ],
    },
    include: { instance: true },
  });
  console.log('MATCH for subdomain=acme:', JSON.stringify(match, null, 2));

  await prisma.$disconnect();
})();