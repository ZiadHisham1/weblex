// app/api/t/[tenantId]/customers/import/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const customers = body.customers; 
    if (!Array.isArray(customers)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const { sdk } = await getMedusaAdminClient(tenantId);
    let successCount = 0;

    for (const c of customers) {
      if (!c.email) continue;
      try {
        await sdk.admin.customer.create({
          email: c.email,
          first_name: c.firstName || '',
          last_name: c.lastName || '',
          phone: c.phone || undefined, // 👈 Added phone
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to import ${c.email}`, err);
      }
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Import failed' }, { status: 500 });
  }
}