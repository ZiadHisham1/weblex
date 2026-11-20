import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import Medusa from '@medusajs/js-sdk';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

(async () => {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'acme' },
    include: { medusa: true },
  });
  if (!tenant) {
    console.error('No tenant with subdomain "acme"');
    process.exit(1);
  }
  if (!tenant.medusa) {
    console.error('acme has no MedusaBinding. Provisioning has not run for this tenant.');
    console.error('Run: POST /api/t/<tenantId>/provision/retry, or check the MedusaBinding table.');
    process.exit(1);
  }
  if (tenant.medusa.provisioningState !== 'READY') {
    console.error(`acme's MedusaBinding is not READY (state: ${tenant.medusa.provisioningState})`);
    if (tenant.medusa.lastError) {
      console.error(`Last error: ${tenant.medusa.lastError}`);
    }
    process.exit(1);
  }
  if (!tenant.medusa.publishableKey) {
    console.error('acme has no publishableKey on the binding');
    process.exit(1);
  }
  if (!tenant.medusa.backendUrl) {
    console.error('acme has no backendUrl on the binding');
    process.exit(1);
  }

  console.log(`acme tenant:       ${tenant.id}`);
  console.log(`backendUrl:        ${tenant.medusa.backendUrl}`);
  console.log(`publishableKey:    ${tenant.medusa.publishableKey.slice(0, 12)}…`);
  console.log(`salesChannelId:    ${tenant.medusa.salesChannelId}`);
  console.log(`regionId:          ${tenant.medusa.regionId}`);
  console.log('');

  const sdk = new Medusa({
    baseUrl: tenant.medusa.backendUrl,
    publishableKey: tenant.medusa.publishableKey,
  });

  let result: any;
  try {
    result = await sdk.store.product.list({ limit: 100 });
  } catch (e: any) {
    console.error('sdk.store.product.list failed:', e?.message ?? e);
    if (e?.status) console.error('Status:', e.status);
    if (e?.body) console.error('Body:', JSON.stringify(e.body, null, 2));
    process.exit(1);
  }

  console.log(`Visible on acme.localhost: ${result.products.length} product(s)\n`);
  if (result.products.length === 0) {
    console.log(
      'No products are visible to acme\'s publishable key. This means no product is\n' +
      'attached to the tenant\'s sales channel. Fix: create products via\n' +
      'http://localhost:3000/dashboard/t/<acme-id>/products/new, OR link an existing\n' +
      'product to the channel with scripts/link-product-to-acme.ts.',
    );
  }
  for (const p of result.products) {
    console.log(`- ${p.title}`);
    console.log(`  product id: ${p.id}`);
    console.log(`  handle:     ${p.handle}`);
    const variants = p.variants ?? [];
    if (variants.length === 0) {
      console.log(`  (no variants)`);
    }
    for (const v of variants) {
      const price = v.calculated_price;
      const priceStr = price
        ? `${price.currency_code.toUpperCase()} ${(price.calculated_amount / 100).toFixed(2)}`
        : 'n/a';
      console.log(`  variant:    ${v.id}`);
      console.log(`    title:    "${v.title}"`);
      console.log(`    price:    ${priceStr}`);
    }
    console.log('');
  }

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
