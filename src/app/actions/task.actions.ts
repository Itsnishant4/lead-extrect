'use server';

import { getSession } from '@/lib/auth';
import { TaskService } from '@/services/task.service';
import { LeadService } from '@/services/lead.service';
import { UserService } from '@/services/user.service';
import { PlanService } from '@/services/plan.service';
import { AuditService } from '@/services/audit.service';
import { createTaskSchema } from '@/lib/validations';
import { getClientInfo, handleActionError } from './helpers';
import { withCache, clearCacheByPrefix } from '@/lib/cache';

function clearTaskCaches(userId: number) {
  clearCacheByPrefix(`tasks:${userId}`);
  clearCacheByPrefix('tasks-progress:');
}

export async function createTaskAction(name: string, keywords: string[]) {
  try {
    createTaskSchema.parse({ name, keywords });
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { userAgent, acceptLanguage } = await getClientInfo();
    const taskId = await TaskService.createTask(session.id, name, keywords, {
      userAgent: userAgent || null,
      acceptLanguage: acceptLanguage || null
    });
    clearTaskCaches(session.id);
    return { success: true, taskId };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createTaskShellAction(name: string, totalKeywords: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { userAgent, acceptLanguage } = await getClientInfo();
    const taskId = await TaskService.createTaskShell(session.id, name, totalKeywords, {
      userAgent: userAgent || null,
      acceptLanguage: acceptLanguage || null
    });
    clearTaskCaches(session.id);
    return { success: true, taskId };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function appendTaskKeywordsAction(taskId: number, keywords: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.appendKeywords(session.id, taskId, keywords);
    clearTaskCaches(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateTaskStatusAction(taskId: number, status: string, currentIndex?: number, statusReason?: string | null) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.updateStatus(session.id, taskId, status, currentIndex, statusReason);
    clearTaskCaches(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    // Pure read — stall recovery moved to Render worker (5m heartbeat reclaim).
    // Previous version performed a write on every poll, amplifying Turso load.
    // 3s per-user cache absorbs multi-tab fan-out; mutations clear it explicitly.
    const data = await withCache(`tasks:${session.id}`, () => TaskService.getTasks(session.id), 3_000);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

/**
 * Lightweight 2s progress poll — 7 columns, optional delta via sinceMs.
 * Client merges `rows` into ['tasks'] cache; skips render on `unchanged`.
 */
export async function getTasksProgressAction(sinceMs?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await TaskService.getTasksProgress(session.id, sinceMs);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await TaskService.getTask(session.id, taskId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.deleteTask(session.id, taskId);
    clearTaskCaches(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTaskLeadsAction(taskId: number, limit?: number, offset?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await LeadService.getLeadsByTaskId(session.id, taskId, limit, offset);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveServerLogAction(taskId: number | null, level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string) {
  const session = await getSession();
  return await AuditService.saveServerLog(taskId, level, message, session?.id || null);
}

export async function triggerTaskAutomationAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  console.log(`[ACTIONS] triggerTaskAutomationAction for task ${taskId}`);
  try {
    const task = await TaskService.getTask(session.id, taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // Concurrent limit check based on user's plan
    const user = await UserService.getUser(session.id);
    const planType = user?.planType || 'free';
    const plan = await PlanService.getPlanByName(planType);
    const maxConcurrent = plan?.maxConcurrentTasks || 1;

    const activeCount = await TaskService.countActiveTasks(session.id);
    // 'uploading' is also the current task itself (large keyword upload in
    // progress), so it must count as "self" — otherwise the concurrent-limit
    // check blocks a task from starting because of its own upload status.
    const isCurrentTaskActive =
      task.status === 'pending' || task.status === 'running' || task.status === 'uploading';
    const otherActive = isCurrentTaskActive ? Math.max(activeCount - 1, 0) : activeCount;
    if (otherActive >= maxConcurrent) {
      return {
        success: false,
        error: `Your current plan (${planType}) allows only ${maxConcurrent} concurrent task${maxConcurrent === 1 ? '' : 's'}. Please wait for a running task to finish or upgrade.`,
        limitType: 'concurrent'
      };
    }

    // The worker picks up tasks that are marked as 'pending'
    await TaskService.updateStatus(session.id, taskId, 'pending', undefined, 'Queued — waiting for worker');
    clearTaskCaches(session.id);

    return { success: true };
  } catch (error: any) {
    console.error('[ACTIONS] triggerTaskAutomationAction error:', error);
    return handleActionError(error);
  }
}

export async function updateTaskLeadCountAction(taskId: number, count: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.updateStatus(session.id, taskId, 'running');
    await TaskService.updateLeadCount(session.id, taskId, count);
    clearTaskCaches(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function uploadTaskExportChunkAction(taskId: number, name: string, csv: string, index: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    // TODO: Implement Telegram export chunking when TelegramService is added.
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
