import { db } from '@/lib/db/index';
import { users, cityAreas, keywordHistory } from '@/lib/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';

export class KeywordService {
  static async getCityAreas(country: string, state: string, city: string) {
    const result = await db.select().from(cityAreas).where(and(
      eq(cityAreas.country, country),
      eq(cityAreas.state, state),
      eq(cityAreas.city, city)
    )).limit(1);
    
    if (result[0]) {
      return JSON.parse(result[0].areas) as string[];
    }
    return null;
  }

  static async saveCityAreas(country: string, state: string, city: string, areas: string[]) {
    await db.insert(cityAreas).values({
      country,
      state,
      city,
      areas: JSON.stringify(areas),
      lastUpdated: new Date()
    }).onConflictDoUpdate({
      target: [cityAreas.country, cityAreas.state, cityAreas.city],
      set: { areas: JSON.stringify(areas), lastUpdated: new Date() }
    });
  }

  static async getBulkCityAreas(country: string, state: string, cities: string[]) {
    if (cities.length === 0) return {};
    const results = await db.select().from(cityAreas).where(and(
      eq(cityAreas.country, country),
      eq(cityAreas.state, state),
      inArray(cityAreas.city, cities)
    ));

    const data: Record<string, string[]> = {};
    results.forEach(row => {
      data[row.city] = JSON.parse(row.areas);
    });

    return data;
  }

  static async saveBulkCityAreas(country: string, state: string, cityAreasList: { city: string, areas: string[] }[]) {
    if (cityAreasList.length === 0) return;

    const rows = cityAreasList.map(item => ({
      country,
      state,
      city: item.city,
      areas: JSON.stringify(item.areas),
      lastUpdated: new Date()
    }));

    // Drizzle doesn't support bulk onConflictDoUpdate easily for multiple rows with different values
    // for now we'll just loop or use a more complex raw query
    for (const row of rows) {
      await db.insert(cityAreas).values(row).onConflictDoUpdate({
        target: [cityAreas.country, cityAreas.state, cityAreas.city],
        set: { areas: row.areas, lastUpdated: new Date() }
      });
    }
  }

  static async saveKeywordHistory(userId: number, data: any) {
    await db.insert(keywordHistory).values({
      userId,
      name: data.name,
      niche: data.niche,
      location: data.location,
      keywords: JSON.stringify(data.keywords),
      totalKeywords: data.totalKeywords || data.keywords.length,
      keywordsTruncated: data.truncated || false,
    });
  }

  static async getKeywordHistory(userId: number) {
    return await db.select().from(keywordHistory).where(eq(keywordHistory.userId, userId)).orderBy(sql`created_at DESC`).limit(50);
  }

  static async deleteKeywordHistory(userId: number, id: number) {
    await db.delete(keywordHistory).where(and(eq(keywordHistory.id, id), eq(keywordHistory.userId, userId)));
  }
}
