import { db } from '@/lib/db';
import { siteConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class SiteConfigService {
  static async get(key: string): Promise<string | null> {
    const row = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
    return row[0]?.value ?? null;
  }

  static async getJSON<T = any>(key: string): Promise<T | null> {
    const val = await this.get(key);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  }

  static async set(key: string, value: string) {
    await db.insert(siteConfig).values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [siteConfig.key],
        set: { value, updatedAt: new Date() },
      });
  }

  static async setJSON(key: string, value: any) {
    await this.set(key, JSON.stringify(value));
  }

  static async getBanner() {
    const data = await this.getJSON<{
      enabled: boolean;
      text: string;
      buttonText: string;
      buttonUrl: string;
      bgColor: string;
    }>('landing_banner');
    return data || {
      enabled: false,
      text: '',
      buttonText: '',
      buttonUrl: '',
      bgColor: '#6366F1',
    };
  }

  static async setBanner(data: {
    enabled: boolean;
    text: string;
    buttonText: string;
    buttonUrl: string;
    bgColor: string;
  }) {
    await this.setJSON('landing_banner', data);
  }
}
