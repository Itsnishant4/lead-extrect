import { db } from '@/lib/db/index';
import { searches, taskLeads, leadSources, serverLogs, leads, savedLists, savedListItems, tasks, keywordHistory, proxies, exportTemplates, settings, auditLogs } from '@/lib/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { LeadRepository } from '@/repositories/lead.repository';

export class LeadService {
  static async getLeads(userId: number, searchId?: number) {
    if (searchId) {
      return await LeadRepository.findBySearchId(userId, searchId);
    } else {
      return await LeadRepository.findAllByUserId(userId);
    }
  }

  static async getLeadsByTaskId(userId: number, taskId: number, limit?: number, offset?: number) {
    return await LeadRepository.findByTaskId(userId, taskId, limit, offset);
  }

  static async wipeLeadsForUser(userId: number) {
    await db.transaction(async (tx) => {
      // 1. Collect all lead IDs that could become orphans (using union)
      const q1 = tx.select({ id: leadSources.leadId }).from(leadSources).where(inArray(leadSources.searchId, tx.select({ id: searches.id }).from(searches).where(eq(searches.userId, userId))));
      const q2 = tx.select({ id: taskLeads.leadId }).from(taskLeads).where(inArray(taskLeads.taskId, tx.select({ id: tasks.id }).from(tasks).where(eq(tasks.userId, userId))));
      const q3 = tx.select({ id: savedListItems.leadId }).from(savedListItems).where(inArray(savedListItems.listId, tx.select({ id: savedLists.id }).from(savedLists).where(eq(savedLists.userId, userId))));

      // Drizzle union results in a query that can be used to select distinct IDs
      const candidateIdsRes = await tx.selectDistinct({ id: sql<number>`id` }).from(sql`(${q1.union(q2).union(q3)}) as all_user_leads`);
      const candidateIds = candidateIdsRes.map(r => r.id).filter((id): id is number => id !== null);

      // 2. Comprehensive delete in correct order
      await tx.delete(serverLogs).where(eq(serverLogs.userId, userId));
      await tx.delete(taskLeads).where(inArray(taskLeads.taskId, tx.select({ id: tasks.id }).from(tasks).where(eq(tasks.userId, userId))));
      await tx.delete(leadSources).where(inArray(leadSources.searchId, tx.select({ id: searches.id }).from(searches).where(eq(searches.userId, userId))));
      await tx.delete(savedListItems).where(inArray(savedListItems.listId, tx.select({ id: savedLists.id }).from(savedLists).where(eq(savedLists.userId, userId))));
      
      await tx.delete(savedLists).where(eq(savedLists.userId, userId));
      await tx.delete(searches).where(eq(searches.userId, userId));
      await tx.delete(tasks).where(eq(tasks.userId, userId));
      await tx.delete(keywordHistory).where(eq(keywordHistory.userId, userId));
      await tx.delete(proxies).where(eq(proxies.userId, userId));
      await tx.delete(exportTemplates).where(eq(exportTemplates.userId, userId));
      await tx.delete(settings).where(eq(settings.userId, userId));
      await tx.delete(auditLogs).where(eq(auditLogs.userId, userId));

      // 3. Cleanup orphaned leads from candidates
      if (candidateIds.length > 0) {
        await LeadRepository.cleanupTargetedOrphans(tx, candidateIds);
      }

      // We'll log the action later or use AuditService if it's still available
      // For now, keeping it simple as per request to move logic to worker
    });
  }
}
