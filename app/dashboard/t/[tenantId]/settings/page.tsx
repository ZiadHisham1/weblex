// app/dashboard/t/[tenantId]/settings/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { SettingsForm } from './settings-form';
import { resolveTheme } from '@/lib/theme';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  if (!tenant) notFound();

  const theme = resolveTheme(tenant.themeTokens);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your storefront branding and details.
        </p>
      </header>

     <SettingsForm
        tenantId={tenant.id}
        initialName={tenant.name}
        initialPrimary={theme.colors.primary}
        initialAccent={theme.colors.accent}
        initialFont={tenant.fontFamily}
        // 👇 Pass the new data
        initialWelcomeBarType={tenant.welcomeBarType || 'none'}
        initialWelcomeBarData={tenant.welcomeBarData}
      />
    </div>
  );
}