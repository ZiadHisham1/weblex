// app/api/t/[tenantId]/menus/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

// PATCH — Update menu items
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
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
    console.error('[Menu PATCH]', e);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}

// DELETE — Delete a menu (with protection)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const menu = await prisma.tenantMenu.findUnique({ where: { id } });

    if (!menu || menu.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    // 👇 Protect the 3 default menus
    const PROTECTED_HANDLES = ['main-menu', 'footer', 'customer-account'];
    if (PROTECTED_HANDLES.includes(menu.handle)) {
      return NextResponse.json(
        { error: 'This is a default menu and cannot be deleted.' },
        { status: 403 }
      );
    }

    await prisma.tenantMenu.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Menu DELETE]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}