import Medusa from '@medusajs/js-sdk';
import { prisma } from '@/lib/db';
import { decryptSecret } from '@/lib/crypto';

// lib/medusa/client.ts (top of file)
if (typeof window !== "undefined") {
  throw new Error(
    "lib/medusa/client.ts is server-only. Import it only from server components, API routes, or server actions.",
  );
}

export class TenantNotReadyError extends Error {
  constructor(public tenantId: string, public state: string) {
    super(`Tenant ${tenantId} not ready (state: ${state})`);
    this.name = 'TenantNotReadyError';
  }
}

export class SatelliteUnavailableError extends Error {
  constructor(public satellite: 'medusa' | 'payload', public cause?: unknown) {
    super(`${satellite} unavailable`);
    this.name = 'SatelliteUnavailableError';
  }
}

export type MedusaContext = {
  tenantId: string;
  backendUrl: string;
  publishableKey: string;
  salesChannelId: string;
  regionId: string;
  locationId: string | null;
};

export async function getMedusaContext(tenantId: string): Promise<MedusaContext> {
  const binding = await prisma.medusaBinding.findUnique({ 
    where: { tenantId },
    // Force Prisma to explicitly grab locationId
    select: {
      tenantId: true,
      backendUrl: true,
      publishableKey: true,
      salesChannelId: true,
      regionId: true,
      locationId: true,
      provisioningState: true,
    }
  });
  
  if (!binding) throw new TenantNotReadyError(tenantId, 'no-binding');
  if (binding.provisioningState !== 'READY') {
    throw new TenantNotReadyError(tenantId, binding.provisioningState);
  }
  if (!binding.backendUrl || !binding.publishableKey || !binding.salesChannelId || !binding.regionId) {
    throw new TenantNotReadyError(tenantId, 'incomplete-binding');
  }
  return {
    tenantId,
    backendUrl: binding.backendUrl,
    publishableKey: binding.publishableKey,
    salesChannelId: binding.salesChannelId,
    regionId: binding.regionId,
    locationId: binding.locationId ?? null,
  };
}

export async function getMedusaStoreClient(tenantId: string) {
  const ctx = await getMedusaContext(tenantId);
  const sdk = new Medusa({ baseUrl: ctx.backendUrl, publishableKey: ctx.publishableKey });
  return { sdk, ctx };
}

export async function getMedusaAdminClient(tenantId: string) {
  const binding = await prisma.medusaBinding.findUnique({ 
    where: { tenantId },
    // Force Prisma to explicitly grab locationId and adminApiKey
    select: {
      tenantId: true,
      backendUrl: true,
      adminApiKey: true,
      salesChannelId: true,
      regionId: true,
      locationId: true,
      provisioningState: true,
    }
  });
  
  if (!binding?.adminApiKey || !binding.backendUrl) {
    throw new TenantNotReadyError(tenantId, binding?.provisioningState ?? 'no-binding');
  }
  const sdk = new Medusa({ baseUrl: binding.backendUrl, apiKey: decryptSecret(binding.adminApiKey) });
  
  // The SDK expects the binding to be returned, so we pass it along
  return { sdk, binding };
}

export async function medusaCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (typeof e?.status === 'number') throw e;
    throw new SatelliteUnavailableError('medusa', e);
  }
}