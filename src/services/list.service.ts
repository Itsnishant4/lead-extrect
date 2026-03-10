import { db } from '@/lib/db/index';
import { savedLists, savedListItems, exportTemplates, leads, leadSources, taskLeads } from '@/lib/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export class ListService {
  static async getSavedLists(userId: number) {
    return await db.select({
      id: savedLists.id,
      name: savedLists.name,
      description: savedLists.description,
      createdAt: savedLists.createdAt,
      lead_count: sql<number>`count(${savedListItems.leadId})`
    })
    .from(savedLists)
    .leftJoin(savedListItems, eq(savedLists.id, savedListItems.listId))
    .where(eq(savedLists.userId, userId))
    .groupBy(savedLists.id)
    .orderBy(desc(savedLists.createdAt));
  }

  static async getSavedListLeads(userId: number, listId: number) {
    // Check ownership
    const list = await db.select().from(savedLists).where(and(eq(savedLists.id, listId), eq(savedLists.userId, userId))).limit(1);
    if (!list[0]) throw new Error('Unauthorized list access');

    return await db.select({
      lead: leads,
      source_count: sql<number>`count(${leadSources.searchId})`
    })
    .from(savedListItems)
    .innerJoin(leads, eq(savedListItems.leadId, leads.id))
    .leftJoin(leadSources, eq(leadSources.leadId, leads.id))
    .where(eq(savedListItems.listId, listId))
    .groupBy(leads.id)
    .orderBy(desc(leads.createdAt));
  }

  static async createExportTemplate(userId: number, name: string, columns: string[]) {
    const result = await db.insert(exportTemplates).values({
      userId,
      name,
      columns: JSON.stringify(columns),
    }).returning({ id: exportTemplates.id });
    
    return result?.[0]?.id ?? (await db.select({ id: exportTemplates.id }).from(exportTemplates).where(eq(exportTemplates.userId, userId)).orderBy(desc(exportTemplates.createdAt)).limit(1))[0]?.id;
  }

  static async getExportTemplates(userId: number) {
    return await db.select().from(exportTemplates).where(eq(exportTemplates.userId, userId)).orderBy(desc(exportTemplates.createdAt));
  }

  static async createSavedList(userId: number, name: string, leadIds: number[], description?: string) {
    return await db.transaction(async (tx) => {
      const result = await tx.insert(savedLists).values({
        userId,
        name,
        description: description || null,
      }).returning({ id: savedLists.id });
      
      const listId = result?.[0]?.id ?? (await tx.select({ id: savedLists.id }).from(savedLists).where(eq(savedLists.userId, userId)).orderBy(desc(savedLists.createdAt)).limit(1))[0]?.id;
      
      if (leadIds.length > 0) {
        const items = leadIds.map(id => ({ listId, leadId: id }));
        await tx.insert(savedListItems).values(items).onConflictDoNothing();
      }
      return listId;
    });
  }
}
