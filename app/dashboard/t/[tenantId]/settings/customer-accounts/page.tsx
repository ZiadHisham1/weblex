// app/dashboard/t/[tenantId]/settings/customer-accounts/page.tsx
import { prisma } from "@/lib/db";
import CustomerAccountsClient from "./client";

export default async function CustomerAccountsPage({ 
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

  // You can pass the tenant subdomain to generate the URL dynamically
  return <CustomerAccountsClient org={tenant.organization} subdomain={tenant.subdomain} />;
}