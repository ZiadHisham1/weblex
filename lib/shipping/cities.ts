// Static ISO-3166-1-alpha-2 → city list.
// Start with the markets you already expose in app/api/t/[tenantId]/markets/countries/route.ts.
// Extend as you launch more countries. Keys must be lowercase ISO-2.
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  eg: ['Cairo', 'Alexandria', 'Giza', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Hurghada', 'Sharm El Sheikh'],
  sa: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Taif', 'Tabuk'],
  ae: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  us: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  gb: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh'],
  de: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf'],
  fr: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
};

export function citiesFor(countryCode: string | null | undefined): string[] {
  if (!countryCode) return [];
  return CITIES_BY_COUNTRY[countryCode.toLowerCase()] ?? [];
}