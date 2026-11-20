import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

export async function PATCH(req: Request, { params }: { params: Promise<{ tenantId: string; id: string }> }) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.items) return NextResponse.json({ error: 'Items required' }, { status: 400 });

  try {
    const menu = await prisma.tenantMenu.update({
      where: { id, tenantId },
      data: { items: body.items },
    });
    return NextResponse.json({ menu });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}