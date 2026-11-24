// app/dashboard/t/[tenantId]/settings/payments/page.tsx
import { prisma } from "@/lib/db";
import PaymentsClient from "./client";

export default async function PaymentsPage({ 
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

  return <PaymentsClient org={tenant.organization} />;
}