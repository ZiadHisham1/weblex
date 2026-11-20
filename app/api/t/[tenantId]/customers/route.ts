import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.customer.list({
      limit: 100,
      fields: '*addresses',
    } as any);
    return NextResponse.json({ customers: result.customers, count: result.count });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    const result = await sdk.admin.customer.create({
      email: body.email,
      first_name: body.firstName || '',
      last_name: body.lastName || '',
      phone: body.phone || undefined, // 👈 Added phone
    });
    return NextResponse.json({ customer: result.customer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to create customer' }, { status: 500 });
  }
}