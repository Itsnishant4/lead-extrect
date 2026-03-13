import { db } from '@/lib/db/index';
import { proxies } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class ProxyService {
  static async getProxies(userId: number) {
    return await db.select().from(proxies).where(eq(proxies.userId, userId)).orderBy(desc(proxies.createdAt));
  }

  static async getAllProxies() {
    return await db.select().from(proxies).orderBy(desc(proxies.createdAt));
  }

  static async getActiveProxiesGlobal() {
    return await db.select().from(proxies).where(eq(proxies.isActive, true));
  }

  static async addProxy(userId: number | null, proxyData: any) {
    await db.insert(proxies).values({
      userId: userId,
      host: proxyData.host,
      port: proxyData.port,
      username: proxyData.username || null,
      password: proxyData.password || null,
      protocol: proxyData.protocol || 'http',
      isActive: proxyData.is_active !== undefined ? Boolean(proxyData.is_active) : true,
    });
  }

  static async deleteProxy(userId: number | null, id: number) {
    if (userId) {
      await db.delete(proxies).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
    } else {
      await db.delete(proxies).where(eq(proxies.id, id));
    }
  }

  static async toggleProxy(userId: number | null, id: number, isActive: boolean) {
    if (userId) {
      await db.update(proxies).set({ isActive }).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
    } else {
      await db.update(proxies).set({ isActive }).where(eq(proxies.id, id));
    }
  }
}
