import { LeadService } from './lead.service';
import { TaskService } from './task.service';

export class InternalService {
  /**
   * Internal search leads logic. Not a server action.
   * Session must be verified by the caller (API route).
   */
  static async searchLeadsInternal(query: string, taskId?: number, forceStore?: boolean, options?: { userAgent?: string; acceptLanguage?: string; manualUserId?: number }) {
    return await LeadService.searchLeads(query, taskId, forceStore, options);
  }

  /**
   * Internal task step processing. Not a server action.
   * Verified by internal JWT token.
   */
  static async processTaskStepInternal(taskId: number, userId: number) {
    return await TaskService.processTaskStep(taskId, userId);
  }
}
