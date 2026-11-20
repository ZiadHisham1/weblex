// scripts/create-shipping-option.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MEDUSA_URL = process.env.MEDUSA_URL;
const MEDUSA_ADMIN_KEY = process.env.MEDUSA_ADMIN_KEY;

if (!MEDUSA_URL || !MEDUSA_ADMIN_KEY) {
  console.error("❌ MEDUSA_URL or MEDUSA_ADMIN_KEY is missing from .env");
  process.exit(1);
}

// Medusa v2 Admin API expects Basic Auth for secret keys
const headers = {
  "Content-Type": "application/json",
  Authorization: `Basic ${MEDUSA_ADMIN_KEY}`,
};

async function api(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`${MEDUSA_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { text };
  }

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const SERVICE_ZONE_ID = "serzo_01M6JPZQBIMNK4QVAJVHV"; 
  const LOCATION_ID = "sloc_01M6J6BENE7G402T3K893JSR"; 

  console.log(`Using Stock Location ID: ${LOCATION_ID}`);

  // 1. Link "manual" fulfillment provider to location
  console.log("Enabling 'manual' fulfillment provider for location...");
  try {
    await api(`/admin/stock-locations/${LOCATION_ID}/fulfillment-providers`, "POST", {
      add: ["manual"],
    });
    console.log("✅ Linked 'manual' provider.");
  } catch (e: any) {
    console.log("ℹ️ Note:", e.message);
  }

  // 2. Create a Shipping Option Type
  console.log("Creating shipping option type...");
  let optionType;
  try {
    const res = await api(`/admin/shipping-option-types`, "POST", {
      label: "Standard",
      description: "Standard shipping",
      code: "standard",
    });
    optionType = res.shipping_option_type;
    console.log("✅ Created shipping option type:", optionType.id);
  } catch (e: any) {
    console.log("  Checking if it already exists...");
    const res = await api(`/admin/shipping-option-types?q=standard`);
    optionType = res.shipping_option_types?.find((t: any) => t.code === "standard");
    if (!optionType) {
      console.error("Failed to create/find option type:", e.message);
      process.exit(1);
    }
    console.log("ℹ️ Using existing shipping option type:", optionType.id);
  }

  // 3. Fetch a Shipping Profile
  console.log("Fetching shipping profiles...");
  const profiles = await api(`/admin/shipping-profiles`);
  const profileId = profiles.shipping_profiles?.[0]?.id;
  
  if (!profileId) {
    console.error("❌ No shipping profile found.");
    process.exit(1);
  }
  console.log(`Using shipping profile ID: ${profileId}`);

  // 4. Create the actual Shipping Option
  console.log(`Creating shipping option for service zone ${SERVICE_ZONE_ID}...`);
  try {
    // We send both type_id and shipping_option_type_id just in case
    const payload = {
      name: "Standard Shipping",
      service_zone_id: SERVICE_ZONE_ID,
      shipping_profile_id: profileId,
      price_type: "flat",
      provider_id: "manual", 
      type_id: optionType.id,
      shipping_option_type_id: optionType.id,
      prices: [
        { amount: 0, currency_code: "usd" }
      ],
    };

    const optRes = await api(`/admin/shipping-options`, "POST", payload);
    console.log("✅ Created shipping option:", optRes.shipping_option.id, optRes.shipping_option.name);
  } catch (e: any) {
    console.error("❌ Failed to create shipping option:", e.message);
  }

  process.exit(0);
}

main().catch(console.error);