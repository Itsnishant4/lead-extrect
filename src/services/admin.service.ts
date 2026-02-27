import { db } from '@/lib/db/index';
import { users, leads, tasks, searches, auditLogs, serverLogs, transactions, plans } from '@/lib/db/schema';
import { eq, sql, desc, and, gt } from 'drizzle-orm';

export class AdminService {
  static async checkAdmin(userId: number) {
    const userCheck = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, userId)).limit(1);
    if (!userCheck[0]?.isAdmin) throw new Error('Forbidden');
  }

  static async getDashboardStats() {
    const totalUsersRes = await db.select({ count: sql<number>`count(*)` }).from(users);
    const suspendedCountRes = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isSuspended, true));
    const runningTasksRes = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'running'));
    const leadsSumRes = await db.select({ sum: sql<number>`sum(leads_extracted)` }).from(users);
    const tasksCountRes = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const searchesCountRes = await db.select({ count: sql<number>`count(*)` }).from(searches);

    const stats = {
      users: totalUsersRes[0].count,
      suspended: suspendedCountRes[0].count,
      leads: leadsSumRes[0].sum || 0,
      tasks: tasksCountRes[0].count,
      runningTasks: runningTasksRes[0].count,
      searches: searchesCountRes[0].count,
    };

    const recentLogs = await db.select({
      id: auditLogs.id,
      action: auditLogs.action,
      status: auditLogs.status,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

    const workerLogs = await db.select({
      id: serverLogs.id,
      level: serverLogs.level,
      message: serverLogs.message,
      taskId: serverLogs.taskId,
      createdAt: serverLogs.createdAt,
    })
    .from(serverLogs)
    .orderBy(desc(serverLogs.createdAt))
    .limit(100);

    return { stats, recentLogs, workerLogs };
  }

  static async getChartData() {
    const leadsGrowth = await db.select({
      date: sql`DATE(created_at)`,
      count: sql<number>`count(*)`
    })
    .from(searches)
    .where(sql`created_at > NOW() - INTERVAL '7 days'`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at) ASC`);

    const activityStats = await db.select({
      date: sql`DATE(created_at)`,
      count: sql<number>`count(*)`
    })
    .from(auditLogs)
    .where(sql`created_at > NOW() - INTERVAL '7 days'`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at) ASC`);

    return { leadsGrowth, activityStats };
  }

  static async getInsights() {
    const planBreakdown = await db.select({
      planType: users.planType,
      count: sql<number>`count(*)`
    }).from(users).groupBy(users.planType);

    const taskStatusBreakdown = await db.select({
      status: tasks.status,
      count: sql<number>`count(*)`
    }).from(tasks).groupBy(tasks.status);

    const topUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      planType: users.planType,
      leadsExtracted: users.leadsExtracted,
      bonusCredits: users.bonusCredits
    })
    .from(users)
    .orderBy(desc(users.leadsExtracted))
    .limit(5);

    const recentSignups = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      planType: users.planType,
      created_at: users.createdAt
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);

    return { planBreakdown, taskStatusBreakdown, topUsers, recentSignups };
  }

  static async getAdminTasks() {
    return await db.select({
      id: tasks.id,
      name: tasks.name,
      status: tasks.status,
      totalKeywords: tasks.totalKeywords,
      currentKeywordIndex: tasks.currentKeywordIndex,
      totalLeads: tasks.totalLeads,
      updatedAt: tasks.updatedAt,
      user_name: users.name,
      user_email: users.email
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.userId, users.id))
    .orderBy(desc(tasks.updatedAt))
    .limit(200);
  }

  static async updateTaskStatus(taskId: number, status: string) {
    await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, taskId));
  }

  static async bulkUpdateTasks(mode: string) {
    if (mode === 'pause_running') {
      await db.update(tasks).set({ status: 'paused', updatedAt: new Date() }).where(eq(tasks.status, 'running'));
    } else if (mode === 'resume_paused') {
      await db.update(tasks).set({ status: 'running', updatedAt: new Date() }).where(eq(tasks.status, 'paused'));
    }
  }

  static async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  static async updateUser(userId: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.planType) updateData.planType = data.planType;
    if (data.is_admin !== undefined) updateData.isAdmin = data.is_admin;
    if (data.is_suspended !== undefined) updateData.isSuspended = data.is_suspended;
    if (data.bonusCredits !== undefined) updateData.bonusCredits = data.bonusCredits;
    if (data.subscription_expiry) updateData.subscriptionExpiry = new Date(data.subscription_expiry);

    await db.update(users).set(updateData).where(eq(users.id, userId));
  }

  static async startAllPendingTasks(userId: number) {
    await db.update(tasks).set({ status: 'running', updatedAt: new Date() })
      .where(and(eq(tasks.status, 'pending'), eq(tasks.userId, userId)));
  }

  static async updateUserCredits(userId: number, amount: number) {
    await db.update(users).set({ 
      bonusCredits: sql`bonus_credits + ${amount}` 
    }).where(eq(users.id, userId));
  }

  static async getUserHistory(userId: number) {
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      planType: users.planType,
      leadsExtracted: users.leadsExtracted,
      bonusCredits: users.bonusCredits,
      subscriptionExpiry: users.subscriptionExpiry,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) throw new Error('User not found');

    const userTransactions = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      gatewayOrderId: transactions.gatewayOrderId,
      utr: transactions.utr,
      createdAt: transactions.createdAt,
      planName: plans.name,
      planPrice: plans.price,
      planPeriod: plans.period,
      planCredits: plans.leadsCredits,
    })
    .from(transactions)
    .leftJoin(plans, eq(transactions.planId, plans.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(50);

    const userAuditLogs = await db.select({
      id: auditLogs.id,
      action: auditLogs.action,
      status: auditLogs.status,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

    return {
      user: user[0],
      transactions: userTransactions,
      auditLogs: userAuditLogs,
    };
  }
}
