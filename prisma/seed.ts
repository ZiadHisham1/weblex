import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import 'dotenv/config';
import { provisionTenant } from '../lib/provisioning/provision-tenant';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
});

const emptyPuckPage = { content: [], root: { props: {} } };

async function main() {
  // 1. Demo user
  let demoUserId: string;
  const existing = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (existing) {
    demoUserId = existing.id;
  } else {
    const signUp = await auth.api.signUpEmail({
      body: { email: 'demo@example.com', password: 'demo1234', name: 'Demo User' },
    });
    if (!signUp.user) throw new Error('Failed to create demo user');
    demoUserId = signUp.user.id;
  }

  // 2. Acme (commerce)
  const acme = await prisma.tenant.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      subdomain: 'acme',
      name: 'Acme Corp',
      siteType: 'COMMERCE',
      instance: { create: { data: { '/': emptyPuckPage } } },
    },
  });
  await prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId: demoUserId, tenantId: acme.id } },
    update: {},
    create: { userId: demoUserId, tenantId: acme.id, role: 'OWNER' },
  });

  // 3. Demo (portfolio)
  const demo = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      subdomain: 'demo',
      name: 'Demo Portfolio',
      siteType: 'PORTFOLIO',
      instance: { create: { data: { '/': emptyPuckPage } } },
    },
  });
  await prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId: demoUserId, tenantId: demo.id } },
    update: {},
    create: { userId: demoUserId, tenantId: demo.id, role: 'OWNER' },
  });

  // 4. Provision Acme with Medusa
  console.log('Provisioning Acme with Medusa...');
  const acmeResult = await provisionTenant(acme.id);
  console.log('Acme provisioning:', acmeResult);

  console.log({ demoUserId, acme: acme.id, demo: demo.id });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());