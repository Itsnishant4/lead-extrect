import { db } from '@/lib/db/index';
import { proxies } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class ProxyService {
  static async getProxies(userId: number) {
    return await db.select().from(proxies).where(eq(proxies.userId, userId)).orderBy(desc(proxies.createdAt));
  }

  static async addProxy(userId: number, proxyData: any) {
    await db.insert(proxies).values({
      userId,
      host: proxyData.host,
      port: proxyData.port,
      username: proxyData.username || null,
      password: proxyData.password || null,
      protocol: proxyData.protocol || 'http',
      isActive: proxyData.is_active !== undefined ? Boolean(proxyData.is_active) : true,
    });
  }

  static async deleteProxy(userId: number, id: number) {
    await db.delete(proxies).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
  }

  static async toggleProxy(userId: number, id: number, isActive: boolean) {
    await db.update(proxies).set({ isActive }).where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
  }
}
