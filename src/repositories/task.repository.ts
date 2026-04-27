import { db } from '@/lib/db/index';
import { tasks, searches, leadSources, taskLeads } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class TaskRepository {
  static async findById(id: number, userId: number, tx: any = db) {
    const result = await tx.select({
      id: tasks.id,
      userId: tasks.userId,
      name: tasks.name,
      status: tasks.status,
      statusReason: tasks.statusReason,
      totalKeywords: tasks.totalKeywords,
      currentKeywordIndex: tasks.currentKeywordIndex,
      totalLeads: tasks.totalLeads,
      userAgent: tasks.userAgent,
      acceptLanguage: tasks.acceptLanguage,
      lastLogsSentAt: tasks.lastLogsSentAt,
      lastHeartbeat: tasks.lastHeartbeat,
      exportFileIds: tasks.exportFileIds,
      exportStatus: tasks.exportStatus,
      exportCreatedAt: tasks.exportCreatedAt,
      exportedLeadsCount: tasks.exportedLeadsCount,
      retryCount: tasks.retryCount,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    }).from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).limit(1);
    return result[0];
  }

  static async findAllByUserId(userId: number, tx: any = db) {
    return await tx.select({
      id: tasks.id,
      userId: tasks.userId,
      name: tasks.name,
      status: tasks.status,
      statusReason: tasks.statusReason,
      totalKeywords: tasks.totalKeywords,
      currentKeywordIndex: tasks.currentKeywordIndex,
      totalLeads: tasks.totalLeads,
      userAgent: tasks.userAgent,
      acceptLanguage: tasks.acceptLanguage,
      lastLogsSentAt: tasks.lastLogsSentAt,
      lastHeartbeat: tasks.lastHeartbeat,
      exportFileIds: tasks.exportFileIds,
      exportStatus: tasks.exportStatus,
      exportCreatedAt: tasks.exportCreatedAt,
      exportedLeadsCount: tasks.exportedLeadsCount,
      retryCount: tasks.retryCount,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    }).from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  static async update(id: number, userId: number, data: Partial<typeof tasks.$inferInsert> | any, tx: any = db) {
    await tx.update(tasks).set({ ...data, updatedAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  static async delete(id: number, userId: number, tx: any = db) {
    await tx.delete(taskLeads).where(eq(taskLeads.taskId, id));
    await tx.delete(leadSources).where(eq(leadSources.taskId, id));
    await tx.update(searches).set({ taskId: null }).where(eq(searches.taskId, id));
    await tx.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }
}
