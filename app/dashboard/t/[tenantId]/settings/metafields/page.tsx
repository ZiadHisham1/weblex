// app/dashboard/t/[tenantId]/settings/metafields/page.tsx
import { prisma } from "@/lib/db";
import MetafieldsClient from "./client";

export default async function MetafieldsPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string }> 
}) {
  const resolvedParams = await params; 
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedParams.tenantId },
    include: { organization: true } 
  });

  if (!tenant || !tenant.organization) {
    return <div className="p-10 text-center text-gray-500">Organization not found</div>;
  }

  return <MetafieldsClient org={tenant.organization} />;
}