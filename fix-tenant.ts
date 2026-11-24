import { provisionTenant } from './lib/provisioning/provision-tenant';
import { prisma } from './lib/db';

async function fix() {
  const tenantId = '3f3ba324-4960-4f6e-be00-bf69ef67719a';
  console.log(`Fixing tenant ${tenantId}...`);

  const result = await provisionTenant(tenantId);
  console.log('Provision Result:', result);

  const binding = await prisma.medusaBinding.findUnique({ where: { tenantId } });
  console.log('Final Binding:', binding);
}

fix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
