import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import Medusa from '@medusajs/js-sdk';
import { decryptSecret } from '../lib/crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

(async () => {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'acme' },
    include: { medusa: true },
  });
  if (!tenant?.medusa) {
    console.error('acme has no Medusa binding');
    process.exit(1);
  }

  const sdk = new Medusa({
    baseUrl: tenant.medusa.backendUrl,
    apiKey: decryptSecret(tenant.medusa.adminApiKey!),
  });

  const { region } = await sdk.admin.region.retrieve(tenant.medusa.regionId);
  console.log('Region:', JSON.stringify(region, null, 2));

  // Also inspect the product's actual stored prices
  const { product } = await sdk.admin.product.retrieve(
    'prod_01M6J4FF3MXW7XGNPR8K9F9H9E',
    { fields: '*variants.prices' } as any,
  );
  console.log('\nProduct prices (raw):');
  for (const v of (product.variants ?? []) as any[]) {
    console.log(`  variant ${v.id}`);
    if (!v.prices || v.prices.length === 0) {
      console.log('    (no prices at all)');
    } else {
      for (const p of v.prices) {
        console.log(`    ${p.currency_code ?? 'no-currency'} ${p.amount}`);
      }
    }
  }

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
