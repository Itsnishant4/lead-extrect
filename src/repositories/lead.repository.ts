import { db } from '@/lib/db/index';
import { leads, leadSources, taskLeads, savedListItems, searches, tasks } from '@/lib/db/schema';
import { eq, and, inArray, sql, notExists, desc } from 'drizzle-orm';

export class LeadRepository {
  static async findById(id: number, tx: any = db) {
    const result = await tx.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  static async findBySearchId(userId: number, searchId: number, tx: any = db) {
    // Ownership check
    const searchCheck = await tx.select({ id: searches.id }).from(searches).where(and(eq(searches.id, searchId), eq(searches.userId, userId))).limit(1);
    if (searchCheck.length === 0) throw new Error('Unauthorized search access');

    return await tx.select({
      lead: leads,
      sourceCount: sql<number>`count(${leadSources.searchId})`
    }).from(leads)
    .innerJoin(leadSources, eq(leadSources.leadId, leads.id))
    .where(eq(leadSources.searchId, searchId))
    .groupBy(leads.id)
    .orderBy(desc(leads.createdAt));
  }

  static async findByTaskId(userId: number, taskId: number, limit?: number, offset?: number, tx: any = db) {
    // Ownership check
    const taskCheck = await tx.select({ id: tasks.id }).from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))).limit(1);
    if (taskCheck.length === 0) throw new Error('Unauthorized task access');

    let query = tx.select({
      lead: leads,
      sourceCount: sql<number>`1`
    }).from(leads)
    .innerJoin(taskLeads, eq(taskLeads.leadId, leads.id))
    .where(eq(taskLeads.taskId, taskId))
    .orderBy(desc(leads.createdAt));

    if (limit !== undefined) query = query.limit(limit);
    if (offset !== undefined) query = query.offset(offset);

    return await query;
  }

  static async findAllByUserId(userId: number, limit: number = 10, tx: any = db) {
    const userSearches = tx.select({ id: searches.id }).from(searches).where(eq(searches.userId, userId));
    
    return await tx.select({
      lead: leads,
      sourceCount: sql<number>`count(${leadSources.searchId})`
    }).from(leads)
    .innerJoin(leadSources, eq(leadSources.leadId, leads.id))
    .where(inArray(leadSources.searchId, userSearches))
    .groupBy(leads.id)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
  }

  /**
   * Deletes leads that are orphaned AND were associated with a specific set of IDs.
   */
  static async cleanupTargetedOrphans(tx: any, leadIds: number[]) {
    if (leadIds.length === 0) return;
    
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < leadIds.length; i += CHUNK_SIZE) {
      const chunk = leadIds.slice(i, i + CHUNK_SIZE);
      await tx.delete(leads).where(and(
        inArray(leads.id, chunk),
        notExists(tx.select().from(leadSources).where(eq(leadSources.leadId, leads.id))),
        notExists(tx.select().from(taskLeads).where(eq(taskLeads.leadId, leads.id))),
        notExists(tx.select().from(savedListItems).where(eq(savedListItems.leadId, leads.id)))
      ));
    }
  }

  static async wipeAllForUser(userId: number, tx: any) {
    // Correct order to avoid FK violations
    const userSearches = tx.select({ id: searches.id }).from(searches).where(eq(searches.userId, userId));
    const userTasks = tx.select({ id: tasks.id }).from(tasks).where(eq(tasks.userId, userId));
    
    // Deletions from junction tables
    await tx.delete(taskLeads).where(inArray(taskLeads.taskId, userTasks));
    await tx.delete(leadSources).where(inArray(leadSources.searchId, userSearches));
    
    // Deletions from parent tables
    await tx.delete(searches).where(eq(searches.userId, userId));
    await tx.delete(tasks).where(eq(tasks.userId, userId));
  }
}
