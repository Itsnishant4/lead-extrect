import { db } from '@/lib/db/index';
import { tasks, leadSources, taskLeads, searches, leads, serverLogs } from '@/lib/db/schema';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { signToken } from '@/lib/auth';
import { AuditService } from './audit.service';
import { LeadService } from './lead.service';
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

  static async updateStatus(userId: number, taskId: number, status: string, currentIndex?: number) {
    await TaskRepository.update(taskId, userId, { 
      status, 
      currentKeywordIndex: currentIndex 
    });
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
      const task = await TaskRepository.findById(tId, uId);
      if (!task) {
        console.error(`[TASK SERVICE] Task ${tId} not found for user ${uId}`);
        return { success: false, error: 'Task not found' };
      }
      
      if (task.status !== 'running') {
        console.log(`[TASK SERVICE] Task ${tId} is not in running state (status: ${task.status}). Aborting step.`);
        return { success: false, error: 'Task not running' };
      }

      const keywords = task.keywords as string[];
      const index = task.currentKeywordIndex || 0;

      if (index >= keywords.length) {
        console.log(`[TASK SERVICE] Task ${tId} finished all keywords (${index}/${keywords.length})`);
        await TaskRepository.update(tId, uId, { status: 'completed' });
        await AuditService.saveServerLog(tId, 'SUCCESS', 'Task completed', uId);
        await this.sendLogsToTelegram(tId, uId);
        return { success: true, completed: true };
      }

      const keyword = keywords[index];
      const options = { userAgent: task.userAgent || undefined, acceptLanguage: task.acceptLanguage || undefined, manualUserId: uId };

      // Update heartbeat to signal activity
      await TaskRepository.update(tId, uId, { lastHeartbeat: new Date() });

      await AuditService.saveServerLog(tId, 'INFO', `Processing keyword ${index + 1}/${keywords.length}: "${keyword}"`, uId);
      
      const res = await LeadService.searchLeads(keyword, tId, true, options);
      
      // RE-CHECK STATUS: Did the user pause the task while we were fetching (which takes time)?
      const freshTask = await TaskRepository.findById(tId, uId);
      if (!freshTask || freshTask.status !== 'running') {
        console.log(`[TASK SERVICE] Task ${tId} status changed to ${freshTask?.status} during fetch. Stopping automation chain.`);
        return { success: true };
      }

      if (!res.success) {
        if (res.limitReached) {
          await TaskRepository.update(tId, uId, { status: 'paused' });
          await AuditService.saveServerLog(tId, 'WARN', `Task paused: Credit limit reached.`, uId);
          return { success: false, limitReached: true };
        }
        await TaskRepository.update(tId, uId, { status: 'failed' });
        await AuditService.saveServerLog(tId, 'ERROR', `Task failed on keyword "${keyword}": ${res.error}`, uId);
        await this.sendLogsToTelegram(tId, uId);
        return { success: false, error: res.error };
      }

      await AuditService.saveServerLog(tId, 'SUCCESS', `Found ${'count' in res ? res.count : 0} leads for "${keyword}"`, uId);

      const nextIndex = index + 1;
      await TaskRepository.update(tId, uId, { currentKeywordIndex: nextIndex });

      // Periodic logs to Telegram (every hour)
      const lastSent = freshTask.lastLogsSentAt ? new Date(freshTask.lastLogsSentAt) : new Date(0);
      if (Date.now() - lastSent.getTime() > 60 * 60 * 1000) {
        await this.sendLogsToTelegram(tId, uId);
        await TaskRepository.update(tId, uId, { lastLogsSentAt: new Date() });
      }

      if (nextIndex < keywords.length) {
        await this.triggerNextStep(tId, uId);
      } else {
        await TaskRepository.update(tId, uId, { status: 'completed' });
        await AuditService.saveServerLog(tId, 'SUCCESS', 'Task completed', uId);
        await this.sendLogsToTelegram(tId, uId);
      }

      return { success: true };
    } catch (error) {
      console.error(`[TASK SERVICE] Critical error processing task ${tId}:`, error);
      try {
        await TaskRepository.update(tId, uId, { status: 'failed' });
        await AuditService.saveServerLog(tId, 'ERROR', `Task crashed: ${(error as Error).message}`, uId);
        await this.sendLogsToTelegram(tId, uId);
      } catch (logErr) {
        console.error('[TASK SERVICE] Failed to log task crash:', logErr);
      }
      return { success: false, error: (error as Error).message };
    }
  }

  private static async triggerNextStep(taskId: number, userId: number) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000';
    const nextUrl = `${baseUrl}/api/automation/run`;
    console.log(`[TASK SERVICE] Triggering next step via: ${nextUrl}`);
    
    try {
      const serverToken = await signToken({ taskId, userId, internal: true });

      // Non-blocking trigger to allow current process to finish
      fetch(nextUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serverToken}` },
        body: JSON.stringify({ taskId, userId }),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[TASK SERVICE] Next step trigger returned status: ${res.status} - ${text}`);
          
          // CRITICAL FALLBACK: If API fetch fails, try to call processTaskStep directly
          // but with a slight delay to avoid stack overflow
          console.log('[TASK SERVICE] Falling back to direct processTaskStep call...');
          setTimeout(() => {
            this.processTaskStep(taskId, userId).catch(e => console.error('[TASK SERVICE] Direct fallback failed:', e));
          }, 1000);
        }
      }).catch(e => {
        console.error('[TASK SERVICE] Next step trigger fetch failed:', e);
        // CRITICAL FALLBACK
        console.log('[TASK SERVICE] Falling back to direct processTaskStep call due to fetch error...');
        setTimeout(() => {
          this.processTaskStep(taskId, userId).catch(err => console.error('[TASK SERVICE] Direct fallback error:', err));
        }, 1000);
      });
    } catch (tokenErr) {
      console.error('[TASK SERVICE] Failed to sign token for next step:', tokenErr);
    }
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
