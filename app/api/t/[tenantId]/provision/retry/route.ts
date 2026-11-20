// app/api/t/[tenantId]/provision/retry/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { provisionTenant } from '@/lib/provisioning/provision-tenant';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;

  const auth = await requireTenantAccessApi(tenantId, 'ADMIN');
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await provisionTenant(tenantId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ state: result.state });
}