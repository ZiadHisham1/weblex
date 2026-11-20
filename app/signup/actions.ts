// app/signup/actions.ts
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { RESERVED } from '@/lib/reserved';
import { Prisma } from '@prisma/client';
import { provisionTenant } from '@/lib/provisioning/provision-tenant';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80),
  subdomain: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
  siteName: z.string().min(1).max(80),
  siteType: z.enum(['COMMERCE', 'SERVICE', 'PORTFOLIO']),
});

const emptyPuckPage = { content: [] as unknown[], root: { props: {} } };

export async function signupAction(formData: FormData) {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: 'Invalid input. Check all fields.' };
  }
  const { email, password, name, subdomain, siteName, siteType } = parsed.data;

  if (RESERVED.has(subdomain)) {
    return { error: 'That subdomain is reserved.' };
  }

  // Pre-check to give a friendly error before we create the user
  const existing = await prisma.tenant.findUnique({ where: { subdomain } });
  if (existing) {
    return { error: 'That subdomain is already taken.' };
  }

  // 1. Create the Better Auth user (this also signs them in)
  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    });
    if (!result.user) {
      return { error: 'Signup failed. Email may already be in use.' };
    }
    userId = result.user.id;
  } catch (e: any) {
    return { error: e?.message ?? 'Signup failed.' };
  }

  // 2. Create tenant + membership + medusa binding + instance atomically.
  //    If ANY of this fails, we compensate by deleting the user.
  let tenantId: string;
  let needsProvisioning = false;
  try {
    const tenant = await prisma.tenant.create({
      data: {
        subdomain,
        name: siteName,
        siteType,
        instance: {
          create: {
            data: { '/': emptyPuckPage } as Prisma.InputJsonValue,
          },
        },
        members: {
          create: { userId, role: 'OWNER' },
        },
        // Seed a PENDING MedusaBinding for commerce tenants so the dashboard
        // can render "Provisioning…" instead of "not configured".
        ...(siteType === 'COMMERCE'
          ? {
              medusa: {
                create: {
                  provisioningState: 'PENDING',
                },
              },
            }
          : {}),
      },
    });
    tenantId = tenant.id;
    needsProvisioning = siteType === 'COMMERCE';
  } catch (e: any) {
    // Compensating action: don't leave an orphan user
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (cleanupErr) {
      console.error('Failed to clean up orphan user', userId, cleanupErr);
    }

    if (e?.code === 'P2002') {
      return { error: 'That subdomain is already taken.' };
    }
    console.error('tenant create failed', e);
    return { error: 'Could not create your site. Please try again.' };
  }

  // 3. Fire-and-forget provisioning. Do NOT await.
  //    If it fails, the binding lands in FAILED state and the user can retry
  //    from the dashboard.
  if (needsProvisioning) {
    provisionTenant(tenantId).catch((err) => {
      console.error('Background provisioning failed for tenant', tenantId, err);
    });
  }

  redirect(`/dashboard/t/${tenantId}`);
}