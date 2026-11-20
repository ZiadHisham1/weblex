import dotenv from "dotenv";
import path from "path";
import Medusa from "@medusajs/js-sdk";
import { Client } from "pg";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  const t = await db.query(`SELECT id FROM "Tenant" WHERE subdomain = 'acme'`);
  const tenantId = t.rows[0].id;
  const b = await db.query(`SELECT "salesChannelId" FROM "MedusaBinding" WHERE "tenantId" = $1`, [tenantId]);
  const salesChannelId = b.rows[0].salesChannelId;
  const sdk = new Medusa({ baseUrl: process.env.MEDUSA_URL!, apiKey: process.env.MEDUSA_ADMIN_KEY! });
  const name = `tenant-${tenantId}`;
  let loc = (await sdk.admin.stockLocation.list({ q: name } as any)).stock_locations.find((l:any) => l.name === name);
  if (!loc) {
    const created = await sdk.admin.stockLocation.create({ name, address: { address_1: "Default", city: "Default", country_code: "us" } } as any);
    loc = created.stock_location;
  }
  try { await sdk.admin.salesChannel.update(salesChannelId, { locations: [{ id: loc.id }] } as any); } catch {}
  try { await (sdk.admin.stockLocation as any).updateFulfillmentProviders(loc.id, { add: ["manual"] } as any); } catch {}
  await db.query(`UPDATE "MedusaBinding" SET "locationId" = $1 WHERE "tenantId" = $2`, [loc.id, tenantId]);
  console.log("✅ locationId set to", loc.id);
  await db.end();
}
main().catch(console.error);
