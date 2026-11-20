// app/dashboard/t/[tenantId]/markets/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { requireTenantAccess } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';
import { MarketsClient } from './client';

// Static country/currency catalogs (mirrors API route)
const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ma', name: 'Morocco', flag: '🇲🇦' },
  { code: 'dz', name: 'Algeria', flag: '🇩🇿' },
  { code: 'tn', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'jo', name: 'Jordan', flag: '🇯🇴' },
  { code: 'kw', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'qa', name: 'Qatar', flag: '🇶🇦' },
  { code: 'bh', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'om', name: 'Oman', flag: '🇴🇲' },
];

const CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'US Dollar' },
  { code: 'eur', symbol: '€', name: 'Euro' },
  { code: 'gbp', symbol: '£', name: 'British Pound' },
  { code: 'egp', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'sar', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'aed', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'mxn', symbol: '$', name: 'Mexican Peso' },
  { code: 'brl', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
  { code: 'krw', symbol: '₩', name: 'South Korean Won' },
  { code: 'cny', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'inr', symbol: '₹', name: 'Indian Rupee' },
  { code: 'aud', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'cad', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'chf', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'try', symbol: '₺', name: 'Turkish Lira' },
  { code: 'zar', symbol: 'R', name: 'South African Rand' },
  { code: 'ngn', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'sek', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'pln', symbol: 'zł', name: 'Polish Zloty' },
];

export default async function MarketsPage({
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

  let regions: any[] = [];
  let error: string | null = null;
  let provisioning = false;

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
      const { sdk } = await getMedusaAdminClient(tenantId);
      const result = await sdk.admin.region.list({
        limit: 100,
        fields: '*countries,*payment_providers',
      } as any);
      regions = result.regions ?? [];
    } catch (e: any) {
      console.error('[Markets Page]', e.response?.data || e);
      error = e?.message ?? 'Failed to load markets';
    }
  }

  return (
    <MarketsClient
      tenantId={tenantId}
      initialRegions={regions}
      countries={COUNTRIES}
      currencies={CURRENCIES}
      error={error}
      provisioning={provisioning}
    />
  );
}