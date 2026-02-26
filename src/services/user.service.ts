import { db } from '@/lib/db/index';
import { users, leads, tasks, searches, keywordHistory } from '@/lib/db/schema';
import { eq, sql, lt, and } from 'drizzle-orm';
import { AuditService } from './audit.service';

export class UserService {
  static async getUser(userId: number) {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0];
    
    if (user) {
      if (user.isSuspended) return user;

      // Check for subscription expiry
      if (user.planType === 'pro' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
        await db.update(users).set({ planType: 'free' }).where(eq(users.id, user.id));
        user.planType = 'free';
        await AuditService.logAction('subscription_expired', 'info', { email: user.email });
      }
      return user;
    }
    return null;
  }

  static async getDatabaseStats() {
    const totalLeadsRes = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const totalTasksRes = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const totalSearchesRes = await db.select({ count: sql<number>`count(*)` }).from(searches);
    const totalHistoryRes = await db.select({ count: sql<number>`count(*)` }).from(keywordHistory);
    
    // For pg_size_pretty, we still need a raw query or sql template
    const sizeRes = await db.execute(sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
    const size = (sizeRes[0] as any).size;

    return {
      totalLeads: Number(totalLeadsRes[0].count),
      totalTasks: Number(totalTasksRes[0].count),
      totalSearches: Number(totalSearchesRes[0].count),
      totalHistory: Number(totalHistoryRes[0].count),
      dbSize: size
    };
  }
}
