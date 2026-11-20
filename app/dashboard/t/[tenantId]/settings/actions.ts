// app/dashboard/t/[tenantId]/settings/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function updateTenantSettings(
  tenantId: string,
  data: { 
    name: string; 
    primaryColor: string; 
    accentColor: string; 
    fontFamily: string;
    // 👇 Add Welcome Bar fields
    welcomeBarType: string;
    welcomeBarData: any; 
  }
) {
  await requireTenantAccess(tenantId, 'ADMIN');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const existingTokens = (tenant?.themeTokens as Record<string, any>) ?? {};
  
  const newTokens = {
    ...existingTokens,
    colors: {
      ...(existingTokens.colors || {}),
      primary: data.primaryColor,
      accent: data.accentColor,
    },
  };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      fontFamily: data.fontFamily,
      themeTokens: newTokens as Prisma.InputJsonValue,  
      // 👇 Save Welcome Bar data
      welcomeBarType: data.welcomeBarType,
      welcomeBarData: data.welcomeBarData,
    },
  });

  revalidatePath(`/dashboard/t/${tenantId}`);
  revalidatePath(`/dashboard/t/${tenantId}/settings`);
  // Also revalidate the storefront layout so changes appear immediately
  revalidatePath(`/sites/${tenant.subdomain}`, 'layout');
}