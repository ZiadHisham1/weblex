// app/api/t/[tenantId]/service-zones/route.ts
import { NextResponse } from 'next/server';
import { requireTenantAccessApi } from '@/lib/auth/tenant-guard';
import { getMedusaAdminClient } from '@/lib/medusa/client';

// ---------------------------------------------------------------------------
// GET — List all service zones for this tenant's stock location
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'VIEWER');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sdk, binding } = await getMedusaAdminClient(tenantId);
    
    if (!binding.locationId) {
      return NextResponse.json({ error: 'No Stock Location configured' }, { status: 400 });
    }

    // 👇 THE OPTIMAL FETCH: One API call for the location and its nested zones
    const locationRes = await sdk.admin.stockLocation.retrieve(binding.locationId, {
      fields: 'id,name,*fulfillment_sets,*fulfillment_sets.service_zones,*fulfillment_sets.service_zones.geo_zones',
    });

    const stockLocation = locationRes.stock_location;
    const sets = stockLocation?.fulfillment_sets || [];

    const zones = sets.flatMap((set: any) =>
      (set.service_zones || []).map((zone: any) => ({
        ...zone,
        fulfillment_set: { id: set.id, name: set.name, type: set.type },
        locations: [{ id: stockLocation.id, name: stockLocation.name }],
      }))
    );

    return NextResponse.json({ service_zones: zones });
  } catch (e: any) {
    console.error('[Service Zones GET] Failed:', e.response?.data || e);
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch zones' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Create a new service zone
// ---------------------------------------------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const auth = await requireTenantAccessApi(tenantId, 'EDITOR');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.fulfillment_set_id) {
    return NextResponse.json({ error: 'name and fulfillment_set_id are required' }, { status: 400 });
  }
  if (!Array.isArray(body?.countries) || body.countries.length === 0) {
    return NextResponse.json({ error: 'At least one country is required' }, { status: 400 });
  }

  try {
    const { sdk } = await getMedusaAdminClient(tenantId);
    
    // 1. Format the country codes into the exact geo_zones structure Medusa expects
    const geoZones = body.countries.map((countryCode: string) => ({
      type: 'country',
      country_code: countryCode.toLowerCase(),
    }));

    // 2. Call the correct SDK method from the documentation
    const result = await sdk.admin.fulfillmentSet.createServiceZone(
      body.fulfillment_set_id,
      {
        name: body.name.trim(),
        geo_zones: geoZones,
      }
    );

    // The SDK returns { fulfillment_set }, so we return the whole set
    return NextResponse.json({ fulfillment_set: result.fulfillment_set });
  } catch (e: any) {
    console.error('[Service Zones POST] Failed:', e.response?.data || e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to create zone', detail: e.response?.data },
      { status: 500 }
    );
  }
}