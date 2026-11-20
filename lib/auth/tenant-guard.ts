import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from './session';

type Role = 'VIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER';

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

function hasRole(actual: Role, required: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

/**
 * For server components / pages.
 * Redirects to /login if unauthenticated.
 * Returns 404 (not 403) if not a member — don't leak tenant existence.
 */
export const requireTenantAccess = cache(
  async (tenantId: string, minRole: Role = 'VIEWER') => {
    const session = await getSession();
    if (!session) redirect(`/login?next=/dashboard/t/${tenantId}`);

    const member = await prisma.tenantMember.findUnique({
      where: { userId_tenantId: { userId: session.user.id, tenantId } },
    });

    if (!member) notFound();
    if (!hasRole(member.role as Role, minRole)) notFound();

    return { session, member };
  },
);

/**
 * For API route handlers.
 * Returns a discriminated union so the caller can `if (!ok) return NextResponse...`
 */
export async function requireTenantAccessApi(
  tenantId: string,
  minRole: Role = 'VIEWER',
): Promise<
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>>; member: { role: string } }
  | { ok: false; status: number; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, error: 'Unauthorized' };

  const member = await prisma.tenantMember.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
  });

  if (!member) return { ok: false, status: 404, error: 'Not found' };
  if (!hasRole(member.role as Role, minRole)) {
    return { ok: false, status: 404, error: 'Not found' };
  }

  return { ok: true, session, member };
}