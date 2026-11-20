// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { RESERVED } from '@/lib/reserved';
import { auth } from '@/lib/auth/config';
import { provisionTenant } from '@/lib/provisioning/provision-tenant';
import { DEFAULT_COMMERCE_PAGE, DEFAULT_BLANK_PAGE } from '@/lib/default-templates';

const Body = z.object({
  subdomain: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/, 'Only a-z, 0-9, and hyphens'),
  name: z.string().min(1).max(80),
  siteType: z.enum(['COMMERCE', 'SERVICE', 'PORTFOLIO']).default('COMMERCE'),
  email: z.string().email(),
  password: z.string().min(8),
  ownerName: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { subdomain, name, siteType, email, password, ownerName } = parsed.data;

  if (RESERVED.has(subdomain)) {
    return NextResponse.json({ error: 'That name is reserved' }, { status: 400 });
  }

  const rootDomain = process.env.ROOT_DOMAIN;
  if (!rootDomain) {
    console.error('ROOT_DOMAIN is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const existingTenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (existingTenant) {
    return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
  }

  // 1. Create user
  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name: ownerName },
      headers: req.headers,
    });
    if (!result.user) {
      return NextResponse.json({ error: 'Signup failed. Email may be in use.' }, { status: 400 });
    }
    userId = result.user.id;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Signup failed' }, { status: 400 });
  }

  // Choose the initial layout
  const initialPageData = siteType === 'COMMERCE' ? DEFAULT_COMMERCE_PAGE : DEFAULT_BLANK_PAGE;

  // 2. Create tenant atomically, with compensating delete on failure
  let tenantId: string;
  try {
    const tenant = await prisma.tenant.create({
      data: {
        subdomain,
        name,
        siteType,
        instance: { 
          create: { 
            data: { '/': initialPageData } as Prisma.InputJsonValue 
          } 
        },
        members: { create: { userId, role: 'OWNER' } },
        ...(siteType === 'COMMERCE'
          ? { medusa: { create: { provisioningState: 'PENDING' } } }
          : {}),
      },
    });
    tenantId = tenant.id;
  } catch (e: any) {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (cleanupErr) {
      console.error('Failed to clean up orphan user', userId, cleanupErr);
    }
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
    }
    console.error('signup failed', e);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }

  // 👇 3. Create the Umami Website for this tenant (NEW CODE)
  try {
    const umamiRes = await fetch('http://localhost:3001/api/websites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.UMAMI_API_TOKEN}`,
      },
      body: JSON.stringify({
        name: name,
        domain: `${subdomain}.lvh.me`, // 👈 Updated
      }),
    });

    if (umamiRes.ok) {
      const umamiData = await umamiRes.json();
      // Update the tenant with the new Website ID
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { umamiWebsiteId: umamiData.id },
      });
      console.log(`[Signup] Umami website created for tenant ${tenantId}: ${umamiData.id}`);
    } else {
      console.error('[Signup] Failed to create Umami website:', await umamiRes.text());
    }
  } catch (err) {
    // We don't block the signup if Umami fails, but we log it
    console.error('[Signup] Umami fetch error:', err);
  }

  // 4. Fire-and-forget provisioning
  if (siteType === 'COMMERCE') {
    provisionTenant(tenantId).catch((err) => {
      console.error('Background provisioning failed for tenant', tenantId, err);
    });
  }

  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${subdomain}.${rootDomain}/`;
  return NextResponse.json({ url, tenantId });
}