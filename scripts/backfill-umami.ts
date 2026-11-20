// scripts/backfill-umami.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env vars FIRST
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function backfill() {
  // 👇 Import Prisma AFTER env vars are loaded
  const { prisma } = await import('@/lib/db');

  const tenants = await prisma.tenant.findMany({
    where: { umamiWebsiteId: null },
  });

  console.log(`Found ${tenants.length} tenants without Umami IDs`);

  for (const tenant of tenants) {
    try {
      const res = await fetch('http://localhost:3001/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.UMAMI_API_TOKEN}`,
        },
        body: JSON.stringify({
          name: tenant.name,
          domain: `${tenant.subdomain}.lvh.me`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { umamiWebsiteId: data.id },
        });
        console.log(`✅ Created Umami website for ${tenant.subdomain}: ${data.id}`);
      } else {
        console.error(`❌ Failed for ${tenant.subdomain}:`, await res.text());
      }
    } catch (err) {
      console.error(`❌ Error for ${tenant.subdomain}:`, err);
    }
  }

  console.log('Done!');
  process.exit(0);
}

backfill();