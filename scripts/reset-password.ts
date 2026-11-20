import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Better Auth default scrypt params: N=16384, r=16, p=1, dkLen=64.
// OpenSSL's default maxmem is 32MB, but 128*N*r = 33.5MB, so we double it.
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scryptAsync(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  })) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

(async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email: ${email}`);
    process.exit(1);
  }

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: 'credential' },
  });
  if (!account) {
    console.error(`User ${email} has no credential (email/password) account.`);
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      select: { providerId: true },
    });
    console.error('Accounts:', accounts.map((a) => a.providerId).join(', ') || '(none)');
    process.exit(1);
  }

  const hashed = await hashPassword(newPassword);
  await prisma.account.update({
    where: { id: account.id },
    data: { password: hashed },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log(`✓ Password updated for ${email}`);
  console.log(`  Previous hash prefix: ${account.password?.slice(0, 20)}…`);
  console.log(`  New hash prefix:      ${hashed.slice(0, 20)}…`);
  console.log(`  Sessions cleared. Log in at http://localhost:3000/login`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('Failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
