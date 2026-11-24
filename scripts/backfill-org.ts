import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    where: { organizationId: null },
  });

  for (const t of tenants) {
    // slug must be unique — reuse subdomain, or prefix if needed
    const org = await prisma.organization.create({
      data: {
        name: t.name,
        slug: t.subdomain,
        timezone: 'UTC',
        currency: 'USD',
      },
    });

    await prisma.tenant.update({
      where: { id: t.id },
      data: { organizationId: org.id },
    });

    console.log(`Linked tenant ${t.subdomain} -> org ${org.id}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });