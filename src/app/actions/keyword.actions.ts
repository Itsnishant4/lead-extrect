'use server';

import { getSession } from '@/lib/auth';
import { KeywordService } from '@/services/keyword.service';
import { saveKeywordHistorySchema, generateKeywordsSchema } from '@/lib/validations';
import { handleActionError } from './helpers';

export async function getCityAreasAction(country: string, state: string, city: string) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getCityAreas(country, state, city);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveCityAreasAction(country: string, state: string, city: string, areas: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.saveCityAreas(country, state, city, areas);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getBulkCityAreasAction(country: string, state: string, cities: string[]) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getBulkCityAreas(country, state, cities);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveBulkCityAreasAction(country: string, state: string, cityAreas: { city: string, areas: string[] }[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.saveBulkCityAreas(country, state, cityAreas);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveKeywordHistoryAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const validated = saveKeywordHistorySchema.parse(data);
    await KeywordService.saveKeywordHistory(session.id, validated);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getKeywordHistoryAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getKeywordHistory(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteKeywordHistoryAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.deleteKeywordHistory(session.id, id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function generateKeywordsAction(niche: string, country: string, state: string, city: string | null, selectAllCities: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    generateKeywordsSchema.parse({ niche, country, state, city, selectAllCities });
    const { Country, State, City } = await import('country-state-city');
    
    let targetCities: { name: string, stateCode: string, countryCode: string }[] = [];
    const countryObj = Country.getAllCountries().find(c => c.name === country);
    const countryCode = countryObj?.isoCode || 'IN';

    if (selectAllCities && state) {
      const stateObj = State.getStatesOfCountry(countryCode).find(s => s.name === state);
      const cities = City.getCitiesOfState(countryCode, stateObj?.isoCode || '');
      targetCities = cities.map(c => ({ name: c.name, stateCode: stateObj?.isoCode || '', countryCode }));
    } else if (city) {
      const stateObj = State.getStatesOfCountry(countryCode).find(s => s.name === state);
      targetCities = [{ name: city, stateCode: stateObj?.isoCode || '', countryCode }];
    }

    if (targetCities.length === 0) {
      return { success: true, data: [`${niche} in ${city || state || country}, ${state || country}, ${country}`] };
    }

    const allKeywords: string[] = [];

    for (const targetCity of targetCities) {
      const baseString = `${targetCity.name}, ${state}, ${country}`;
      // Add the city-level keyword immediately as the first result
      allKeywords.push(`${niche} in ${baseString}`);

      try {
        console.log(`[ACTIONS] Fetching areas for ${targetCity.name}...`);
        // Fetch areas/post offices for this city from the Indian Post API
        const response = await fetch(`https://api.postalpincode.in/postoffice/${targetCity.name}`);
        
        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            const seenAreas = new Set<string>();

            postOffices.forEach((po: any) => {
              const areaName = po.Name;
              if (areaName && !seenAreas.has(areaName)) {
                seenAreas.add(areaName);
                allKeywords.push(`${niche} in ${areaName}, ${baseString}`);
              }
            });
            console.log(`[ACTIONS] Found ${postOffices.length} post offices for ${targetCity.name}`);
          } else {
            console.log(`[ACTIONS] No areas found for ${targetCity.name} via API`);
          }
        } else {
          console.error(`[ACTIONS] Area API returned error: ${response.status}`);
        }
      } catch (err) {
        console.error(`Failed to fetch areas for ${targetCity.name}:`, err);
      }
    }

    console.log(`[ACTIONS] Generated ${allKeywords.length} keywords`);
    return { success: true, data: allKeywords };
  } catch (error: any) {
    console.error('[ACTIONS] generateKeywordsAction error:', error);
    const fallback = city ? [`${niche} in ${city}, ${state}, ${country}`] : [`${niche} in ${state}, ${country}`];
    return { success: true, data: fallback };
  }
}
