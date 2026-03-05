import { db } from '@/lib/db/index';
import { tasks, leadSources, taskLeads, searches, leads, serverLogs } from '@/lib/db/schema';
import { eq, and, sql, desc, inArray, count } from 'drizzle-orm';
import { signToken } from '@/lib/auth';
import { AuditService } from './audit.service';
import { LeadService } from './lead.service';
import { NotificationService } from './notification.service';
import { LeadRepository } from '@/repositories/lead.repository';
import { TaskRepository } from '@/repositories/task.repository';

export class TaskService {
  static async createTask(userId: number, name: string, keywords: string[], options: { userAgent: string | null, acceptLanguage: string | null }) {
    const result = await db.insert(tasks).values({
      userId,
      name,
      keywords,
      totalKeywords: keywords.length,
      status: 'pending',
      statusReason: 'Queued — waiting for worker',
      userAgent: options.userAgent,
      acceptLanguage: options.acceptLanguage,
    }).returning({ id: tasks.id });
    return result[0].id;
  }

  static async createTaskShell(userId: number, name: string, totalKeywords: number, options: { userAgent: string | null, acceptLanguage: string | null }) {
    const result = await db.insert(tasks).values({
      userId,
      name,
      keywords: [],
      totalKeywords,
      status: 'pending',
      statusReason: 'Uploading keywords...',
      userAgent: options.userAgent,
      acceptLanguage: options.acceptLanguage,
    }).returning({ id: tasks.id });
    return result[0].id;
  }

  static async appendKeywords(userId: number, taskId: number, keywords: string[]) {
    await db.execute(sql`
      UPDATE tasks 
      SET keywords = (COALESCE(keywords, '[]'::jsonb) || ${JSON.stringify(keywords)}::jsonb),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId} AND user_id = ${userId}
    `);
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
    await db.transaction(async (tx) => {
      const taskLeadIdsRes = await tx.select({ id: taskLeads.leadId }).from(taskLeads).where(eq(taskLeads.taskId, taskId));
      const leadIds = taskLeadIdsRes.map((r: any) => r.id).filter((id: any): id is number => id !== null);
      await TaskRepository.delete(taskId, userId, tx);
      if (leadIds.length > 0) {
        await LeadRepository.cleanupTargetedOrphans(tx, leadIds);
      }
      await AuditService.logAction('delete_task', 'success', { taskId }, tx);
    });
  }

  static async processTaskStep(taskId: number, userId: number) {
    const tId = Number(taskId);
    const uId = Number(userId);
    console.log(`[TASK SERVICE] processTaskStep started for task ${tId}, user ${uId}`);

    try {
      // CRITICAL: Atomically claim the next keyword index using row-level locking.
      // This prevents multiple workers from processing the same keyword concurrently.
      const claimed = await db.transaction(async (tx) => {
        const taskRows = await tx.select().from(tasks)
          .where(and(eq(tasks.id, tId), eq(tasks.userId, uId)))
          .for('update')
          .limit(1);
        const task = taskRows[0];

        if (!task) return { claimed: false, reason: 'Task not found' } as const;
        if (task.status !== 'running') return { claimed: false, reason: `Task not running (${task.status})` } as const;

        const keywords = task.keywords as string[];
        const index = task.currentKeywordIndex || 0;

        if (index >= keywords.length) {
          await tx.update(tasks).set({ status: 'completed', statusReason: 'All keywords processed', updatedAt: new Date() })
            .where(and(eq(tasks.id, tId), eq(tasks.userId, uId)));
          return { claimed: false, reason: 'completed' } as const;
        }

        // Atomically advance the index so no other worker can claim this keyword
        await tx.update(tasks).set({
          currentKeywordIndex: index + 1,
          lastHeartbeat: new Date(),
          statusReason: null,
          updatedAt: new Date()
        }).where(and(eq(tasks.id, tId), eq(tasks.userId, uId)));

        return {
          claimed: true,
          keyword: keywords[index],
          index,
          totalKeywords: keywords.length,
          userAgent: task.userAgent,
          acceptLanguage: task.acceptLanguage,
        } as const;
      });

      if (!claimed.claimed) {
        if (claimed.reason === 'completed') {
          await AuditService.saveServerLog(tId, 'SUCCESS', 'Task completed', uId);
          await this.sendLogsToTelegram(tId, uId);
          // Notify user
          const taskInfo = await TaskRepository.findById(tId, uId);
          const leadCount = taskInfo ? await this.getTaskLeadCount(tId) : 0;
          void NotificationService.notifyTaskCompleted(uId, taskInfo?.name || `Task #${tId}`, leadCount, tId);
          return { success: true, completed: true };
        }
        console.log(`[TASK SERVICE] Task ${tId}: ${claimed.reason}. Aborting step.`);
        return { success: false, error: claimed.reason };
      }

      const { keyword, index, totalKeywords, userAgent, acceptLanguage } = claimed;
      const options = { userAgent: userAgent || undefined, acceptLanguage: acceptLanguage || undefined, manualUserId: uId };

      await AuditService.saveServerLog(tId, 'INFO', `Processing keyword ${index + 1}/${totalKeywords}: "${keyword}"`, uId);

      const res = await LeadService.searchLeads(keyword, tId, true, options);

      // RE-CHECK STATUS: Did the user pause the task while we were fetching?
      const freshTask = await TaskRepository.findById(tId, uId);
      if (!freshTask || freshTask.status !== 'running') {
        console.log(`[TASK SERVICE] Task ${tId} status changed to ${freshTask?.status} during fetch. Stopping.`);
        return { success: true };
      }

      if (!res.success) {
        if (res.limitReached) {
          await TaskRepository.update(tId, uId, { status: 'paused', statusReason: 'Credit limit reached — upgrade your plan to continue' });
          await AuditService.saveServerLog(tId, 'WARN', `Task paused: Credit limit reached.`, uId);
          // Notify about low credits
          void NotificationService.checkAndNotifyCreditsLow(uId);
          return { success: false, limitReached: true };
        }
        await TaskRepository.update(tId, uId, { status: 'failed', statusReason: `Error: ${res.error || 'Unknown error during extraction'}` });
        await AuditService.saveServerLog(tId, 'ERROR', `Task failed on keyword "${keyword}": ${res.error}`, uId);
        await this.sendLogsToTelegram(tId, uId);
        // Notify user of task failure
        const failedTaskInfo = await TaskRepository.findById(tId, uId);
        void NotificationService.notifyTaskFailed(uId, failedTaskInfo?.name || `Task #${tId}`, res.error || 'Unknown error', tId);
        return { success: false, error: res.error };
      }

      await AuditService.saveServerLog(tId, 'SUCCESS', `Found ${'count' in res ? res.count : 0} leads for "${keyword}"`, uId);

      // Periodic logs to Telegram (every hour)
      const lastSent = freshTask.lastLogsSentAt ? new Date(freshTask.lastLogsSentAt) : new Date(0);
      if (Date.now() - lastSent.getTime() > 60 * 60 * 1000) {
        await this.sendLogsToTelegram(tId, uId);
        await TaskRepository.update(tId, uId, { lastLogsSentAt: new Date() });
      }

      // Check if all keywords are now done
      const nextIndex = index + 1;
      if (nextIndex >= totalKeywords) {
        await TaskRepository.update(tId, uId, { status: 'completed', statusReason: 'All keywords processed' });
        await AuditService.saveServerLog(tId, 'SUCCESS', 'Task completed', uId);
        await this.sendLogsToTelegram(tId, uId);
        // Notify user
        const completedTask = await TaskRepository.findById(tId, uId);
        const finalLeadCount = await this.getTaskLeadCount(tId);
        void NotificationService.notifyTaskCompleted(uId, completedTask?.name || `Task #${tId}`, finalLeadCount, tId);
      } else {
        await this.triggerNextStep(tId, uId);
      }

      return { success: true };
    } catch (error) {
      console.error(`[TASK SERVICE] Critical error processing task ${tId}:`, error);
      try {
        await TaskRepository.update(tId, uId, { status: 'failed', statusReason: `Crashed: ${(error as Error).message}` });
        await AuditService.saveServerLog(tId, 'ERROR', `Task crashed: ${(error as Error).message}`, uId);
        await this.sendLogsToTelegram(tId, uId);
        // Notify user of crash
        const crashedTask = await TaskRepository.findById(tId, uId);
        void NotificationService.notifyTaskFailed(uId, crashedTask?.name || `Task #${tId}`, (error as Error).message, tId);
      } catch (logErr) {
        console.error('[TASK SERVICE] Failed to log task crash:', logErr);
      }
      return { success: false, error: (error as Error).message };
    }
  }

  private static getBaseUrl() {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
    }

    if (process.env.NODE_ENV === 'production') {
      // Prefer the production domain if available
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
      }
      // Fallback to deployment URL
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }
      return 'https://leadspotter.in';
    }

    return 'http://127.0.0.1:3000';
  }

  static async runTask(taskId: number, userId: number, statusReason?: string) {
    console.log(`[TASK SERVICE] runTask called for task ${taskId}. Updating status to pending for worker to pick up.`);
    await TaskRepository.update(taskId, userId, {
      status: 'pending',
      statusReason: statusReason || 'Queued — waiting for worker'
    });
    return { success: true };
  }

  /**
   * Count active (running + pending) tasks for a user.
   */
  static async countActiveTasks(userId: number): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM tasks 
      WHERE user_id = ${userId} 
      AND status IN ('running', 'pending')
    `);
    return Number(result[0]?.count || 0);
  }

  private static async triggerNextStep(taskId: number, userId: number) {
    // The worker now handles sequential processing inherently, so this doesn't need to do anything
    // However, if the processTaskStep is called manually via UI, we might still want it to continue.
    // The worker is designed to poll, so returning success is fine.
    return { success: true };
  }

  /**
   * Get total lead count for a task
   */
  private static async getTaskLeadCount(taskId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(taskLeads)
      .where(eq(taskLeads.taskId, taskId));
    return result?.count || 0;
  }

  static async sendLogsToTelegram(taskId: number, userId?: number) {
    const logs = await db.select().from(serverLogs).where(eq(serverLogs.taskId, taskId)).orderBy(serverLogs.createdAt);
    if (logs.length === 0) return;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const taskRows = await db.select({ name: tasks.name, userId: tasks.userId }).from(tasks).where(eq(tasks.id, taskId)).limit(1);
    const task = taskRows[0];
    if (!task) return;

    if (userId !== undefined && task.userId !== userId) {
      throw new Error('Unauthorized task access');
    }

    const logContent = logs.map(l => `[${l.createdAt?.toISOString()}] [${l.level}] ${l.message}`).join('\n');

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('document', new Blob([logContent], { type: 'text/plain' }), `${(task?.name || `Task_${taskId}`).replace(/\s+/g, '_')}_logs.txt`);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: form });
    const data: any = await res.json();
    if (data.ok) {
      // Cleanup of server logs is usually handled by a maintenance cron to avoid race conditions
    }
  }
}
