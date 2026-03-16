import { db, raw } from '@/lib/db/index';
import { rateLimits } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Checks rate limit for a given key.
 * @param strict If true, will fail-closed (return false) on database errors.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number, strict: boolean = true): Promise<boolean> {
  try {
    const resetTime = Math.floor((Date.now() + windowMs) / 1000); // Unix timestamp in seconds

    // Use raw SQL for better SQLite compatibility
    const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
    
    if (existing.length === 0) {
      // Insert new record
      await db.insert(rateLimits).values({
        key,
        count: 1,
        resetAt: new Date(resetTime * 1000),
      });
      return true;
    }

    const record = existing[0];
    const currentReset = record.resetAt ? new Date(record.resetAt).getTime() / 1000 : 0;
    const now = Math.floor(Date.now() / 1000);

    if (currentReset < now) {
      // Reset the counter
      await db.update(rateLimits)
        .set({ count: 1, resetAt: new Date(resetTime * 1000) })
        .where(eq(rateLimits.key, key));
      return true;
    }

    if ((record.count ?? 0) >= limit) {
      return false; // Rate limit exceeded
    }

    // Increment counter
    await db.update(rateLimits)
      .set({ count: (record.count ?? 0) + 1 })
      .where(eq(rateLimits.key, key));
    
    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return !strict; // If strict, return false (fail-closed); otherwise true (fail-open)
  }
}
