import { db } from '@/lib/db/index';
import { auditLogs } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { sql, eq } from 'drizzle-orm';

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
    // Server logs disabled - only audit logs are used
    console.log(`[LOG][${level}][Task:${taskId}] ${message}`);
    return { success: true };
  }

  static async cleanupServerLogs(tx: any = db) {
    // Server logs disabled - no cleanup needed
    return { success: true };
  }
}
