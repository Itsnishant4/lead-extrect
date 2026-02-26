import { db } from '@/lib/db/index';
import { settings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export class SettingsService {
  static async getSettings(userId: number) {
    const results = await db.select().from(settings).where(eq(settings.userId, userId));
    const data: Record<string, any> = {};
    results.forEach(row => {
      try {
        data[row.key] = JSON.parse(row.value);
      } catch (e) {
        data[row.key] = row.value;
      }
    });
    return data;
  }

  static async updateSetting(userId: number, key: string, value: any) {
    const serializedValue = JSON.stringify(value);
    await db.insert(settings).values({
      userId,
      key,
      value: serializedValue,
    }).onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: serializedValue },
    });
  }
}
