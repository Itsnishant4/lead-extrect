/**
 * Niche presets + synonym map.
 * Synonyms resolve free text ("realtor", "real estet") to preset labels
 * so keyword generation stays consistent with manual flow.
 */

export const PRESET_NICHES = [
  'Dentist',
  'Real Estate Agency',
  'Restaurant',
  'Plumber',
  'IT Company',
  'Lawyer',
  'Gym',
  'Beauty Salon',
  'HVAC Contractor',
  'Digital Marketing',
  'Accountant',
  'Interior Designer',
  'Car Dealer',
  'Pharmacy',
];

/** normalized alias -> preset label */
const SYNONYMS: Record<string, string> = {
  // real estate
  'real estate': 'Real Estate Agency',
  'realestate': 'Real Estate Agency',
  'real estet': 'Real Estate Agency',
  'realestet': 'Real Estate Agency',
  'realtor': 'Real Estate Agency',
  'realty': 'Real Estate Agency',
  'property dealer': 'Real Estate Agency',
  'property': 'Real Estate Agency',
  // dentist
  'dentists': 'Dentist',
  'dental': 'Dentist',
  'dental clinic': 'Dentist',
  // food
  'restaurants': 'Restaurant',
  'food': 'Restaurant',
  'cafe': 'Restaurant',
  // trades
  'plumbers': 'Plumber',
  'plumbing': 'Plumber',
  // tech
  'it companies': 'IT Company',
  'software': 'IT Company',
  'software company': 'IT Company',
  'saas': 'IT Company',
  // legal
  'lawyers': 'Lawyer',
  'advocate': 'Lawyer',
  'attorney': 'Lawyer',
  'law firm': 'Lawyer',
  // fitness
  'gyms': 'Gym',
  'fitness': 'Gym',
  // beauty
  'salon': 'Beauty Salon',
  'saloon': 'Beauty Salon',
  'parlour': 'Beauty Salon',
  'parlor': 'Beauty Salon',
  // hvac
  'hvac': 'HVAC Contractor',
  'ac repair': 'HVAC Contractor',
  // marketing
  'marketing': 'Digital Marketing',
  'seo': 'Digital Marketing',
  'agency': 'Digital Marketing',
  // finance
  'accountants': 'Accountant',
  'ca': 'Accountant',
  'chartered accountant': 'Accountant',
  // interiors
  'interior': 'Interior Designer',
  'interiors': 'Interior Designer',
  // auto
  'car dealers': 'Car Dealer',
  'auto dealer': 'Car Dealer',
  // pharma
  'pharmacies': 'Pharmacy',
  'medical store': 'Pharmacy',
  'chemist': 'Pharmacy',
};

export function resolveNicheSynonym(normalized: string): string | null {
  return SYNONYMS[normalized] ?? null;
}
