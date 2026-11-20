// app/dashboard/t/[tenantId]/page.tsx
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  History, 
  Plus, 
  Mic, 
  Globe, 
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

async function createPage(formData: FormData) {
  'use server';
  const tenantId = formData.get('tenantId') as string;
  let pathName = (formData.get('pathName') as string).trim();
  if (!pathName.startsWith('/')) pathName = `/${pathName}`;
  if (pathName === '/' || pathName.length > 200) return;

  await requireTenantAccess(tenantId, 'EDITOR');

  const target = `/dashboard/t/${tenantId}/editor?path=${encodeURIComponent(pathName)}`;

  await prisma.$transaction(async (tx) => {
    const instance = await tx.siteInstance.findUnique({ where: { tenantId } });
    const current = (instance?.data as Record<string, unknown>) ?? {};
    if (current[pathName]) return;
    current[pathName] = { content: [], root: { props: {} } };
    await tx.siteInstance.upsert({
      where: { tenantId },
      update: { data: current as Prisma.InputJsonValue, version: { increment: 1 } },
      create: { tenantId, data: current as Prisma.InputJsonValue },
    });
  });

  revalidatePath(`/dashboard/t/${tenantId}`);
  redirect(target);
}

export default async function TenantOverview({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { instance: true, medusa: true, cms: true },
  });
  if (!tenant) notFound();

  // Format the store URL for the preview
  const storeUrl = `http://${tenant.subdomain}.localhost:3000`;

  return (
    <div className="mx-auto max-w-4xl pb-20 pt-10 px-4 flex flex-col items-center">
      
      {/* 1. STORE PREVIEW CARD */}
      <div className="w-full max-w-sm flex flex-col items-center mb-12">
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4 relative group">
          {/* Mock Browser Header */}
          <div className="bg-gray-900 h-8 flex items-center px-3 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <div className="ml-2 bg-gray-800 rounded text-[9px] text-gray-400 px-2 py-0.5 flex items-center gap-1">
              <Lock className="w-2 h-2" /> {tenant.subdomain}.localhost:3000
            </div>
          </div>
          {/* Mock Preview Image */}
          <div className="aspect-[4/3] bg-gray-100 relative">
            <img 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" 
              alt="Store preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Floating element inside preview */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-xs font-bold text-gray-900 mb-1">Generated test data</h4>
              <p className="text-[10px] text-gray-500 mb-2">A few sample products have been added.</p>
              <button className="bg-black text-white text-[10px] px-3 py-1 rounded">View store</button>
            </div>
          </div>
        </div>

        <Link 
          href={storeUrl}
          target="_blank"
          className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Launch your online store
        </Link>
      </div>

      {/* 2. WELCOME TEXT */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
          <span className="underline decoration-gray-300 underline-offset-4 decoration-2">{tenant.name}</span> has a product to sell
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          What do you want to work on next?
        </h2>
      </div>

      {/* 3. SIDEKICK AI PROMPT (Static) */}
      <div className="w-full max-w-2xl mb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 shadow-sm">
          <div className="text-xs text-gray-500 px-4 py-2 text-center border-b border-gray-200/60 mb-2">
            Sidekick is currently not available. Please try again later.
          </div>
          <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Is my store live?" 
              className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400"
              disabled
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                  <History className="w-3.5 h-3.5" /> Recents
                </button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="hover:text-gray-900 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="hover:text-gray-900 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TASK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Card 1: Custom Domain */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-32 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
             {/* Decorative mock domain input */}
             <div className="bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2 flex items-center w-3/4">
               <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
               <div className="h-2 bg-gray-200 rounded w-24"></div>
               <span className="text-gray-500 text-sm font-medium ml-auto">.com</span>
             </div>
             <svg className="absolute bottom-2 right-4 w-12 h-12 text-gray-400 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
             </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Get a custom domain</h3>
          <p className="text-sm text-gray-500">Give your store a branded URL that's easy to find, trust, and remember.</p>
        </div>

        {/* Card 2: Optimize Store */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-32 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
             <div className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
               <div className="w-2 h-2 rounded-full border border-white"></div> 0 tasks completed
             </div>
             {/* Decorative Mock Papers/Gear */}
             <div className="relative mt-4">
                <div className="w-16 h-20 bg-white border border-gray-200 shadow-sm rounded-sm transform -rotate-12 absolute top-0 left-2"></div>
                <div className="w-16 h-20 bg-white border border-gray-200 shadow-sm rounded-sm transform rotate-6 absolute top-2 left-6 flex flex-col items-center justify-center gap-1">
                   <div className="w-8 h-1 bg-gray-200 rounded"></div>
                   <div className="w-10 h-1 bg-gray-200 rounded"></div>
                   <div className="w-6 h-1 bg-gray-200 rounded"></div>
                </div>
                <div className="w-6 h-6 bg-[#A3E635] rounded-full absolute -top-2 right-0 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                </div>
             </div>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Optimize your store in Egypt</h3>
          <p className="text-sm text-gray-500">Get set up to sell with Sidekick's step-by-step guidance, customized for your region.</p>
        </div>

      </div>

      {/* Hidden form to satisfy the server action requirement for adding pages */}
      <div className="hidden">
        <form action={createPage}>
          <input type="hidden" name="tenantId" value={tenant.id} />
          <input type="hidden" name="pathName" value="/new-page" />
        </form>
      </div>

    </div>
  );
}