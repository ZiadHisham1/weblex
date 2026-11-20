import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.handle) return NextResponse.json({ error: 'Name and handle required' }, { status: 400 });

  try {
    const menu = await prisma.tenantMenu.create({
      data: {
        tenantId,
        name: body.name,
        handle: body.handle,
        items: [],
      },
    });
    return NextResponse.json({ menu });
  } catch (e: any) {
    return NextResponse.json({ error: 'Handle already exists or DB error' }, { status: 500 });
  }
}