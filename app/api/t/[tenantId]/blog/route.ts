import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        tenantId,
        title: body.title,
        content: body.content || '',
        excerpt: body.excerpt || '',
        imageUrl: body.imageUrl || null,
        visibility: body.visibility || 'VISIBLE',
        author: body.author || 'Admin',
        blogName: body.blogName || 'News',
        tags: body.tags || [],
        template: body.template || 'Default blog post',
      },
    });

    return NextResponse.json({ post });
  } catch (e: any) {
    console.error('[Blog POST]', e);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}