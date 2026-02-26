import { db } from '@/lib/db/index';
import { tasks } from '@/lib/db/schema';
import { eq, and, sql, lt } from 'drizzle-orm';
import { TaskService } from './task.service';

export class TaskRunnerService {
  /**
   * Resumes tasks that are marked as 'running' but haven't had a heartbeat
   * in the last 10 minutes. This prevents tasks from getting stuck.
   */
  static async resumeStalledTasks() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const stalledTasks = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.status, 'running'),
        lt(tasks.lastHeartbeat, tenMinutesAgo)
      ));

    console.log(`[TASK RUNNER] Found ${stalledTasks.length} stalled tasks.`);

    for (const task of stalledTasks) {
      console.log(`[TASK RUNNER] Resuming task ${task.id} for user ${task.userId}`);
      if (task.userId) {
        await TaskService.runTask(task.id, task.userId);
      }
    }
  }

  /**
   * Main entry point for processing a task. 
   * Instead of simple recursion, this could be triggered by a cron or a real queue.
   */
  static async processTask(taskId: number, userId: number) {
    return await TaskService.processTaskStep(taskId, userId);
  }
}
