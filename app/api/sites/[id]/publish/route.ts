import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

const Body = z.object({
  path: z.string().startsWith('/').max(200),
  data: z.object({
    content: z.array(z.any()),
    root: z.object({ props: z.record(z.string(), z.any()) }).passthrough().optional(),
  }).passthrough(),
  version: z.number().int().nonnegative().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { id: true } });
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const authCheck = await requireTenantAccessApi(id, 'EDITOR');
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { path, data } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const instance = await tx.siteInstance.findUnique({ where: { tenantId: id } });
    const existing = (instance?.data as Record<string, unknown>) ?? {};
    const next = { ...existing, [path]: data } as Prisma.InputJsonValue;

    return tx.siteInstance.upsert({
      where: { tenantId: id },
      update: { data: next, version: { increment: 1 } },
      create: { tenantId: id, data: next, version: 1 },
    });
  });

  return NextResponse.json({ success: true, version: result.version });
}