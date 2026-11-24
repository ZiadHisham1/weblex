// app/dashboard/t/[tenantId]/settings/organization-account/page.tsx
import { prisma } from "@/lib/db";
import UsersClient from "./client";

export default async function UsersPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string }> 
}) {
  const resolvedParams = await params; 
  
  // Fetch the tenant to find the organization, then get the organization's members
  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedParams.tenantId },
    include: { 
      organization: {
        include: {
          members: {
            include: {
              user: true // Fetch the actual User details (name, email, image)
            }
          }
        }
      } 
    } 
  });

  if (!tenant || !tenant.organization) {
    return <div className="p-10 text-center text-gray-500">Organization not found</div>;
  }

  return (
    <UsersClient org={tenant.organization} />
  );
}