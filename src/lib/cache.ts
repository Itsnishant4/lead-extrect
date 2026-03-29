/**
 * Simple in-memory cache for server-side use.
 * Reduces redundant DB queries by caching results for a short TTL.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires < now) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get a cached value by key. Returns null if not found or expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Set a cached value with a TTL in milliseconds.
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
  });
}

/**
 * Clear a specific cache entry.
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries.
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Wrapper function that caches the result of an async function.
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 30000
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) {
    return cached;
  }
  const result = await fn();
  setCache(key, result, ttlMs);
  return result;
}
