// app/dashboard/t/[tenantId]/settings/organization-details/page.tsx
import { prisma } from "@/lib/db";
import OrganizationClient from "./client";

export default async function OrganizationPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string }> 
}) {
  const resolvedParams = await params; 
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedParams.tenantId },
    include: { 
      organization: {
        include: {
          // 👈 Make sure we explicitly fetch the tenants for this organization
          tenants: true 
        }
      } 
    } 
  });

  if (!tenant || !tenant.organization) {
    return <div className="p-10 text-center text-gray-500">Organization not found</div>;
  }

  // 👈 Pass ONLY the organization object (which now includes the tenants array)
  return (
    <OrganizationClient org={tenant.organization} />
  );
}