import { db } from '@/lib/db/index';
import { tasks, taskLeads } from '@/lib/db/schema';
import { eq, and, or, sql, desc, count } from 'drizzle-orm';
import { AuditService } from './audit.service';
import { LeadRepository } from '@/repositories/lead.repository';
import { TaskRepository } from '@/repositories/task.repository';

export class TaskService {
  static async createTask(userId: number, name: string, keywords: string[], options: { userAgent: string | null, acceptLanguage: string | null }) {
    await db.insert(tasks).values({
      userId,
      name,
      keywords,
      totalKeywords: keywords.length,
      status: 'pending',
      statusReason: 'Queued — waiting for worker',
      userAgent: options.userAgent,
      acceptLanguage: options.acceptLanguage,
    });

    const newTask = await db.select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.name, name)))
      .orderBy(desc(tasks.id))
      .limit(1);

    return newTask[0].id;
  }

  static async createTaskShell(userId: number, name: string, totalKeywords: number, options: { userAgent: string | null, acceptLanguage: string | null }) {
    await db.insert(tasks).values({
      userId,
      name,
      keywords: [],
      totalKeywords,
      status: 'pending',
      statusReason: 'Uploading keywords...',
      userAgent: options.userAgent,
      acceptLanguage: options.acceptLanguage,
    });

    const newTask = await db.select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.name, name)))
      .orderBy(desc(tasks.id))
      .limit(1);

    return newTask[0].id;
  }

  static async appendKeywords(userId: number, taskId: number, keywords: string[]) {
    const currentTask = await db.select({ keywords: tasks.keywords }).from(tasks).where(eq(tasks.id, taskId)).limit(1);
    const currentKeywords = (currentTask[0]?.keywords as string[]) || [];
    const newKeywords = [...currentKeywords, ...keywords];

    await db.update(tasks)
      .set({ keywords: newKeywords, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }

  static async updateStatus(userId: number, taskId: number, status: string, currentIndex?: number, statusReason?: string | null) {
    await TaskRepository.update(taskId, userId, {
      status,
      currentKeywordIndex: currentIndex,
      statusReason: statusReason !== undefined ? statusReason : null,
    });
  }

  static async updateLeadCount(userId: number, taskId: number, count: number) {
    await TaskRepository.update(taskId, userId, { totalLeads: count });
  }

  static async getTasks(userId: number) {
    return await TaskRepository.findAllByUserId(userId);
  }

  static async getTask(userId: number, taskId: number) {
    return await TaskRepository.findById(taskId, userId);
  }

  static async deleteTask(userId: number, taskId: number) {
    const taskLeadIdsRes = await db.select({ id: taskLeads.leadId }).from(taskLeads).where(eq(taskLeads.taskId, taskId));
    const leadIds = taskLeadIdsRes.map((r: any) => r.id).filter((id: any): id is number => id !== null);

    await TaskRepository.delete(taskId, userId);

    if (leadIds.length > 0) {
      await LeadRepository.cleanupTargetedOrphans(db, leadIds);
    }

    await AuditService.logAction('delete_task', 'success', { taskId }, db);
  }

  static async runTask(taskId: number, userId: number, statusReason?: string) {
    await TaskRepository.update(taskId, userId, {
      status: 'pending',
      statusReason: statusReason || 'Queued — waiting for worker'
    });
    return { success: true };
  }

  static async countActiveTasks(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), or(eq(tasks.status, 'running'), eq(tasks.status, 'pending'))));
    return Number(result[0]?.count || 0);
  }

  static async getTaskLeadCount(taskId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(taskLeads)
      .where(eq(taskLeads.taskId, taskId));
    return result?.count || 0;
  }
}
