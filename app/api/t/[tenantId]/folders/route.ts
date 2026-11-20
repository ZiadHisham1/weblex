import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

// POST — Create a new folder
export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const folder = await prisma.folder.create({
    data: { tenantId, name: body.name },
  });

  return NextResponse.json({ folder });
}