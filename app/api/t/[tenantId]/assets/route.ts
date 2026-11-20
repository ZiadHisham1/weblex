import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

export async function GET(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const assets = await prisma.tenantAsset.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ assets });
}

export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 👇 Secure MIME type detection (don't trust file.type from browser)
    const fileType = await fileTypeFromBuffer(buffer);
    const mimeType = fileType?.mime || 'application/octet-stream';

    const uniqueId = crypto.randomUUID();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const fileName = `${tenantId}-${Date.now()}-${uniqueId}-${cleanFileName}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads', tenantId);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);

    const publicUrl = `/uploads/${tenantId}/${fileName}`;

    // Inside POST:
    const folderId = formData.get('folderId') as string | null;

    const asset = await prisma.tenantAsset.create({
    data: {
        tenantId,
        name: file.name,
        url: publicUrl,
        type: mimeType,
        size: file.size,
        altText: formData.get('altText') as string || '',
        folderId: folderId || null, // 👈 Assign the folder
    },
    });

    return NextResponse.json({ asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — Update Alt Text
export async function PATCH(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  if (!body.id || body.altText === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const asset = await prisma.tenantAsset.update({
    where: { id: body.id, tenantId },
    data: { altText: body.altText },
  });

  return NextResponse.json({ asset });
}

// DELETE — Bulk Delete
export async function DELETE(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const ids = url.searchParams.get('ids')?.split(',') || [];
  if (ids.length === 0) return NextResponse.json({ error: 'No ids provided' }, { status: 400 });

  // Verify ownership
  const assets = await prisma.tenantAsset.findMany({ where: { id: { in: ids }, tenantId } });
  
  // Delete from disk
  for (const asset of assets) {
    try { await unlink(join(process.cwd(), 'public', asset.url)); } catch (e) {}
  }

  // Delete from DB
  await prisma.tenantAsset.deleteMany({ where: { id: { in: ids }, tenantId } });

  return NextResponse.json({ success: true });
}