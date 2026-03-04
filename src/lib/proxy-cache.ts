import { db } from '@/lib/db/index';
import { proxies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

let cachedProxies: any[] | null = null;
let lastProxyFetch = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

export async function getActiveProxies(): Promise<any[]> {
  const now = Date.now();
  if (cachedProxies && now - lastProxyFetch < CACHE_TTL_MS) {
    return cachedProxies;
  }
  const proxyRows = await db.select().from(proxies).where(eq(proxies.isActive, 1));
  cachedProxies = Array.from(proxyRows);
  lastProxyFetch = now;
  return cachedProxies;
}

/**
 * Invalidate the proxy cache (e.g. after adding/removing proxies).
 */
export function invalidateProxyCache() {
  cachedProxies = null;
  lastProxyFetch = 0;
}
