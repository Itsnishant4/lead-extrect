import { db } from '@/lib/db/index';
import { rateLimits } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Checks rate limit for a given key.
 * @param strict If true, will fail-closed (return false) on database errors.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number, strict: boolean = true): Promise<boolean> {
  try {
    const resetTime = new Date(Date.now() + windowMs);

    const result = await db.insert(rateLimits).values({
      key,
      count: 1,
      resetAt: resetTime,
    }).onConflictDoUpdate({
      target: [rateLimits.key],
      set: {
        count: sql`CASE WHEN rate_limits.reset_at < CURRENT_TIMESTAMP THEN 1 ELSE rate_limits.count + 1 END`,
        resetAt: sql`CASE WHEN rate_limits.reset_at < CURRENT_TIMESTAMP THEN ${resetTime.toISOString()}::timestamp ELSE rate_limits.reset_at END`,


      },
    }).returning({ count: rateLimits.count });

    const record = result[0];

    if (record && record.count && record.count > limit) {
      return false; // Rate limit exceeded
    }

    return true; // Request allowed
  } catch (error) {
    console.error('Rate limit error:', error);
    return !strict; // If strict, return false (fail-closed); otherwise true (fail-open)
  }
}
