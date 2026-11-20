import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { Client } from 'pg';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// Medusa's Postgres (from medusa-app/.env: port 5433, db medusa_store)
const MEDUSA_DB =
  'postgres://medusa:medusa_dev_password@localhost:5433/medusa_store';

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scryptAsync(password, salt, 64, {
    N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2,
  })) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

(async () => {
  const email = process.argv[2] ?? 'admin@medusajs.com';
  const newPassword = process.argv[3] ?? 'admin123456';

  const client = new Client({ connectionString: MEDUSA_DB });
  await client.connect();

  // Look for the user
  const { rows } = await client.query(
    'select id, email from "user" where email = $1',
    [email],
  );
  if (rows.length === 0) {
    console.log(`No Medusa admin user with email ${email}.`);
    const all = await client.query('select id, email from "user"');
    console.log('Existing users:', all.rows.map(r => r.email));
    await client.end();
    return;
  }

  const user = rows[0];
  // Medusa stores credentials in the provider_identity table
  const hashed = await hashPassword(newPassword);
  const result = await client.query(
    `update provider_identity
       set provider_metadata = jsonb_set(
         provider_metadata,
         '{password}',
         to_jsonb($1::text)
       )
     where entity_id = $2 and provider = 'emailpass'`,
    [hashed, user.email],
  );
  console.log(
    result.rowCount === 0
      ? `User ${email} has no emailpass provider identity — cannot reset via this path`
      : `✓ Password reset for ${email} → ${newPassword}`,
  );

  await client.end();
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
