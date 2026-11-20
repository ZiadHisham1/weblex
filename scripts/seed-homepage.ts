// scripts/seed-homepage.ts
import dotenv from "dotenv";
import path from "path";
import { Client } from "pg";
import { DEFAULT_COMMERCE_PAGE } from "../lib/default-templates";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing from .env");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log("✅ Connected to database.");

    // Fetch the tenant
    const tenantRes = await client.query(`SELECT id FROM "Tenant" WHERE subdomain = $1`, ["acme"]);
    if (tenantRes.rowCount === 0) {
      console.error("❌ Tenant 'acme' not found");
      process.exit(1);
    }
    const tenantId = tenantRes.rows[0].id;

    // Check if instance exists
    const instanceRes = await client.query(`SELECT data FROM "SiteInstance" WHERE "tenantId" = $1`, [tenantId]);
    
    let currentData: Record<string, any> = {};
    if (instanceRes.rowCount && instanceRes.rows[0].data) {
      currentData = typeof instanceRes.rows[0].data === "string" 
        ? JSON.parse(instanceRes.rows[0].data) 
        : instanceRes.rows[0].data;
    }

    currentData['/'] = DEFAULT_COMMERCE_PAGE;

    if (instanceRes.rowCount === 0) {
      console.log("Creating new SiteInstance...");
      await client.query(
        `INSERT INTO "SiteInstance" (id, "tenantId", data, version, "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, 1, NOW(), NOW())`,
        [tenantId, JSON.stringify(currentData)]
      );
    } else {
      console.log("Updating existing SiteInstance...");
      await client.query(
        `UPDATE "SiteInstance" SET data = $1, version = version + 1, "updatedAt" = NOW() WHERE "tenantId" = $2`,
        [JSON.stringify(currentData), tenantId]
      );
    }

    console.log("✅ Seeded homepage template for acme.localhost:3000");
  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);