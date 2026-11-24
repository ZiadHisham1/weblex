// app/api/t/[tenantId]/markets/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> },
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);

    // 1. Delete the region from Medusa
    await sdk.admin.region.delete(id);

    // 2. If this was the tenant's active region, unlink it from Prisma
    const binding = await prisma.medusaBinding.findUnique({
      where: { tenantId },
    });

    if (binding?.regionId === id) {
      await prisma.medusaBinding.update({
        where: { tenantId },
        data: { regionId: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Markets DELETE]', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to delete region' },
      { status: 500 },
    );
  }
}