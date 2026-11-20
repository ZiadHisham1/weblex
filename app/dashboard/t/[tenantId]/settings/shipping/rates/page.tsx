import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { resolveTenantShippingContext } from '@/lib/shipping/tenant-shipping';
import { citiesFor } from '@/lib/shipping/cities';
import { ShippingRatesClient } from './client';

export default async function ShippingRatesPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireTenantAccess(tenantId, 'VIEWER');

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { medusa: true },
  });
  if (!tenant) notFound();

  let rates: any[] = [];
  let error: string | null = null;
  let provisioning = false;
  let countryCode: string | null = null;
  let currencyCode: string | null = null;
  let cities: string[] = [];

  if (
    tenant.medusa?.provisioningState === 'PENDING' ||
    tenant.medusa?.provisioningState === 'PROVISIONING'
  ) {
    provisioning = true;
  } else if (tenant.medusa?.provisioningState !== 'READY') {
    error =
      'Store not ready. Provisioning state: ' +
      (tenant.medusa?.provisioningState ?? 'not configured');
  } else {
    try {
      const ctx = await resolveTenantShippingContext(tenantId);
      countryCode = ctx.countryCode;
      currencyCode = ctx.currencyCode;
      cities = citiesFor(ctx.countryCode);

      if (ctx.binding.shippingProfileId) {
        const { shipping_options } = await (ctx.sdk.admin.shippingOption as any).list({
          limit: 500,
          fields: '*prices,*rules',
        });
        rates = (shipping_options ?? [])
          .filter(
            (o: any) =>
              o.shipping_profile_id === ctx.binding.shippingProfileId &&
              o.metadata?.tenantId === tenantId &&
              o.metadata?.kind === 'city_rate',
          )
          .map((o: any) => {
            const price = (o.prices ?? []).find(
                (p: any) => p.currency_code === currencyCode,
            ) ?? (o.prices ?? [])[0];
            return {
                id: o.id,
                city: o.metadata?.city ?? '',
                name: o.name,
                amount: price?.amount ?? 0,
                active: o.is_enabled !== false,
            };
            })
      }
    } catch (e: any) {
      console.error('[ShippingRatesPage]', e.response?.data || e);
      error = e?.message ?? 'Failed to load shipping rates';
    }
  }

  return (
    <ShippingRatesClient
      tenantId={tenantId}
      initialRates={rates}
      countryCode={countryCode}
      currencyCode={currencyCode}
      suggestedCities={cities}
      error={error}
      provisioning={provisioning}
    />
  );
}