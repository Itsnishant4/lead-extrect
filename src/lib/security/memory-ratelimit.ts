/**
 * In-memory rate limiter — zero database calls.
 * Uses a simple Map with auto-cleanup of expired entries.
 * Drop-in replacement for the DB-based checkRateLimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // unix ms
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof globalThis !== 'undefined') {
  // Only run cleanup in Node.js, not in edge/browser
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  };

  // Use setInterval if available (server-side)
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, CLEANUP_INTERVAL_MS);
  }
}

/**
 * In-memory rate limit check.
 * @param key - Unique identifier (e.g. "login:ip:1.2.3.4")
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @param strict - If true, fail-closed (return false) on error. Default true.
 * @returns true if allowed, false if rate limited
 */
export function memoryCheckRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  strict: boolean = true
): boolean {
  try {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      // New entry or expired — allow and set
      store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= limit) {
      return false; // Rate limited
    }

    // Increment counter
    entry.count++;
    return true;
  } catch {
    return !strict;
  }
}

/**
 * Get remaining requests and reset time for a key (useful for response headers).
 */
export function getRateLimitInfo(key: string, limit: number): {
  remaining: number;
  resetAt: number;
} {
  const entry = store.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    return { remaining: limit, resetAt: 0 };
  }
  return {
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}
