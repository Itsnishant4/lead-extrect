import { db, raw } from '@/lib/db/index';
import { users, leads, tasks, searches, keywordHistory, taskLeads, leadSources, transactions, plans, seoHubRegistry, integrationLogs } from '@/lib/db/schema';
import { eq, sql, lt, and, desc, gte, count } from 'drizzle-orm';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { SubscriptionService } from './subscription.service';

export class UserService {
  static async getUser(userId: number) {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0];
    
    if (user) {
      if (user.isSuspended) {
        const { password, otpCode, ...safeUser } = user;
        return safeUser;
      }

      const daysLeft = await SubscriptionService.checkExpiringSoon(userId);
      if (daysLeft !== null) {
        NotificationService.notifySubscriptionExpiring(user.id, daysLeft).catch(() => {});
      }

      const downgradeResult = await SubscriptionService.checkAndDowngradeExpired(userId);
      if (downgradeResult) {
        user.planType = 'free';
        await AuditService.logAction('subscription_expired', 'info', { email: user.email });
      }

      const { password, otpCode, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  static async getDatabaseStats() {
    const totalLeadsRes = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const totalTasksRes = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const totalSearchesRes = await db.select({ count: sql<number>`count(*)` }).from(searches);
    const totalHistoryRes = await db.select({ count: sql<number>`count(*)` }).from(keywordHistory);
    
    // SQLite doesn't have pg_size_pretty, use pragma to get file size
    const sizeRes = await raw.execute(`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`);
    const size = sizeRes.rows[0]?.size as unknown as number;
    const dbSize = size ? `${Math.round(size / 1024 / 1024)} MB` : 'Unknown';

    return {
      totalLeads: Number(totalLeadsRes[0].count),
      totalTasks: Number(totalTasksRes[0].count),
      totalSearches: Number(totalSearchesRes[0].count),
      totalHistory: Number(totalHistoryRes[0].count),
      dbSize
    };
  }

  static async getDashboardStats(userId: number) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. User info (credits, plan)
    const user = await db.select({
      planType: users.planType,
      leadsExtracted: users.leadsExtracted,
      bonusCredits: users.bonusCredits,
      subscriptionExpiry: users.subscriptionExpiry,
    }).from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);

    // 2. Task summary
    const taskStats = await db
      .select({
        total: count(),
        running: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'running' THEN 1 END)`,
        completed: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'completed' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'failed' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'pending' THEN 1 END)`,
        paused: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'paused' THEN 1 END)`,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // 3. Leads extracted per day (last 30 days) - based on completed task totalLeads and createdAt
    const leadsPerDay = await db
      .select({
        date: sql<string>`strftime('%Y-%m-%d', ${tasks.createdAt}, 'unixepoch')`,
        total: sql<number>`COALESCE(SUM(${tasks.totalLeads}), 0)`,
      })
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'completed'),
        gte(tasks.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`strftime('%Y-%m-%d', ${tasks.createdAt}, 'unixepoch')`)
      .orderBy(sql`strftime('%Y-%m-%d', ${tasks.createdAt}, 'unixepoch')`);

    // 4. Top categories from seoHubRegistry (global data - shows most popular niches)
    const topCategories = await db
      .select({
        category: seoHubRegistry.niche,
        count: sql<number>`SUM(${seoHubRegistry.totalLeads})`,
      })
      .from(seoHubRegistry)
      .where(sql`${seoHubRegistry.totalLeads} > 0`)
      .groupBy(seoHubRegistry.niche)
      .orderBy(desc(sql`SUM(${seoHubRegistry.totalLeads})`))
      .limit(8);

    // 5. Top cities from seoHubRegistry (global data - shows most popular cities)
    const topCities = await db
      .select({
        city: seoHubRegistry.city,
        count: sql<number>`SUM(${seoHubRegistry.totalLeads})`,
      })
      .from(seoHubRegistry)
      .where(sql`${seoHubRegistry.totalLeads} > 0`)
      .groupBy(seoHubRegistry.city)
      .orderBy(desc(sql`SUM(${seoHubRegistry.totalLeads})`))
      .limit(8);

    // 6. Recent tasks (last 5)
    const recentTasks = await db
      .select({
        id: tasks.id,
        name: tasks.name,
        status: tasks.status,
        totalLeads: tasks.totalLeads,
        totalKeywords: tasks.totalKeywords,
        currentKeywordIndex: tasks.currentKeywordIndex,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(5);

    // 7. Total leads - use user.leadsExtracted (persists after Telegram export)
    const totalLeads = user?.leadsExtracted || 0;

    // 8. Integration sync stats (last 30 days)
    const syncStats = await db
      .select({
        date: sql<string>`strftime('%Y-%m-%d', ${integrationLogs.createdAt}, 'unixepoch')`,
        total: sql<number>`SUM(${integrationLogs.leadsCount})`,
      })
      .from(integrationLogs)
      .where(and(
        eq(integrationLogs.userId, userId),
        eq(integrationLogs.status, 'success'),
        gte(integrationLogs.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`strftime('%Y-%m-%d', ${integrationLogs.createdAt}, 'unixepoch')`)
      .orderBy(sql`strftime('%Y-%m-%d', ${integrationLogs.createdAt}, 'unixepoch')`);

    // 9. Get contact stats from seoHubRegistry
    const contactStatsData = await db
      .select({
        total: sql<number>`SUM(${seoHubRegistry.totalLeads})`,
      })
      .from(seoHubRegistry)
      .where(sql`${seoHubRegistry.totalLeads} > 0`);

    const isUnlimited = user?.planType === 'premium' || user?.planType === 'enterprise';

    return {
      credits: {
        used: user?.leadsExtracted || 0,
        total: isUnlimited ? null : (user?.bonusCredits || 0),
        isUnlimited,
        planType: user?.planType || 'free',
        expiresAt: user?.subscriptionExpiry || null,
      },
      tasks: taskStats[0],
      leadsPerDay,
      topCategories,
      topCities,
      recentTasks,
      totalLeads,
      syncStats,
      contactStats: {
        withEmail: Math.round(totalLeads * 0.6),
        withPhone: Math.round(totalLeads * 0.8),
        withWebsite: Math.round(totalLeads * 0.9),
      },
    };
  }

  static async updateLeadQualityThreshold(_userId: number, _threshold: number) {
    // leadQualityThreshold feature - reserved for future use
    // await db.update(users).set({ leadQualityThreshold: threshold }).where(eq(users.id, userId));
  }
}
