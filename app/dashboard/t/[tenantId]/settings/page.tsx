import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { SettingsForm } from './settings-form';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/t/${tenantId}/settings`);

  const auth = await requireTenantAccessApi(tenantId, 'ADMIN');
  if (!auth.ok) redirect(`/dashboard/t/${tenantId}`);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      themeTokens: true,
      welcomeBarType: true,
      welcomeBarData: true,
    },
  });
  if (!tenant) redirect('/dashboard');

  const theme = (tenant.themeTokens as any) || {};
  const barData = (tenant.welcomeBarData as any) || null;

  return (
    <SettingsForm
      tenantId={tenant.id}
      initialName={tenant.name}
      initialPrimary={theme.primaryColor ?? '#000000'}
      initialAccent={theme.accentColor ?? '#000000'}
      initialFont={theme.fontFamily ?? 'Inter'}
      initialWelcomeBarType={tenant.welcomeBarType ?? 'none'}
      initialWelcomeBarData={barData}
    />
  );
}