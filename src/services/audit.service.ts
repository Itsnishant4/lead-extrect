import { db } from '@/lib/db/index';
import { auditLogs, serverLogs } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { sql, lt, eq } from 'drizzle-orm';

export class AuditService {
  static async logAction(action: string, status: 'success' | 'error' | 'info', metadata: any = {}, tx: any = db) {
    try {
      const session = await getSession();
      await tx.insert(auditLogs).values({
        userId: session?.id || null,
        action,
        status,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
    } catch (e) {
      console.error('Failed to log action:', e);
    }
  }

  static async saveServerLog(taskId: number | null, level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string, userId?: number | null, tx: any = db) {
    try {
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        const session = await getSession();
        effectiveUserId = session?.id || null;
      }

      await tx.insert(serverLogs).values({
        userId: effectiveUserId,
        taskId,
        level,
        message,
      });
      console.log(`[LOG][${level}][Task:${taskId}] ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to save server log:', error);
      return { success: false };
    }
  }

  static async cleanupServerLogs(tx: any = db) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await tx.delete(serverLogs).where(lt(serverLogs.createdAt, sevenDaysAgo));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
