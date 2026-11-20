import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';

// PATCH — Update a post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
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

    return NextResponse.json({ post: updatedPost });
  } catch (e: any) {
    console.error('[Blog PATCH]', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// 👇 ENSURE THIS DELETE FUNCTION EXISTS
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Blog DELETE]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}