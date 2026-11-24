'use server';

import { prisma } from '@/lib/db';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { revalidatePath, revalidateTag } from 'next/cache';

type ThemeTokens = { primaryColor?: string; accentColor?: string };
type WelcomeBarData = {
  bgColor?: string;
  textColor?: string;
  text?: string;
  texts?: string[];
};

export async function updateTenantSettings(
  tenantId: string,
  updates: {
    name?: string;
    themeTokens?: ThemeTokens;
    fontFamily?: string;
    welcomeBarType?: string;
    welcomeBarData?: WelcomeBarData;
    [key: string]: any;
  },
) {
  const auth = await requireTenantAccessApi(tenantId, 'ADMIN');
  if (!auth.ok) throw new Error(auth.error);

  const {
    name,
    themeTokens,
    fontFamily,
    welcomeBarType,
    welcomeBarData,
    ...miscSettings
  } = updates;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant not found');

  // const { name, themeTokens, welcomeBarType, welcomeBarData, ...miscSettings } = updates;

  // 👇 ADD THIS LOG
  console.log("=== INCOMING UPDATES FROM FORM ===");
  console.log("themeTokens:", themeTokens);
  console.log("fontFamily:", updates.fontFamily)

  const currentSettings = (tenant.settings as Record<string, any>) || {};

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(name !== undefined && { name }),
      // 👇 colors land in themeTokens (read by resolveTheme in the layout)
      ...(themeTokens !== undefined && { themeTokens }),
      // 👇 font goes to the top-level column the layout actually reads
      ...(fontFamily !== undefined && { fontFamily }),
      ...(welcomeBarType !== undefined && { welcomeBarType }),
      ...(welcomeBarData !== undefined && { welcomeBarData }),
      settings: { ...currentSettings, ...miscSettings },
    },
  });

  // 👇 ADD THIS LOG AFTER UPDATE
  const updatedTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  console.log("=== SAVED IN DATABASE ===");
  console.log("themeTokens:", updatedTenant?.themeTokens);
  console.log("fontFamily:", updatedTenant?.fontFamily);

  // Revalidate the dashboard page…
  revalidatePath(`/dashboard/t/${tenantId}/settings`, 'layout');
  // …and the storefront. Use the literal route pattern with the dynamic
  // segment, not `/`. Also revalidate any catch-all page route under it.
  revalidatePath('/sites/[site]', 'layout');
  revalidatePath('/sites/[site]/[[...path]]', 'page');
  // Tag-based invalidation (see §4) so cached tenant fetches refresh too.
  revalidateTag(`tenant:${tenantId}`);

  return { success: true };
}