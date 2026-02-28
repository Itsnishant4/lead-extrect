import { db } from '@/lib/db/index';
import { users, leads, searches, taskLeads, leadSources, pincodeCoords, settings, tasks, savedLists, savedListItems, auditLogs, keywordHistory, proxies, exportTemplates, serverLogs, seoHubRegistry } from '@/lib/db/schema';
import { eq, and, sql, desc, inArray, exists, notExists } from 'drizzle-orm';
import { fetchLeads } from '@/lib/extractor';
import { enrichLead } from '@/lib/enricher';
import { AuditService } from './audit.service';
import { LeadRepository } from '@/repositories/lead.repository';
import { TaskRepository } from '@/repositories/task.repository';
import { UserRepository } from '@/repositories/user.repository';
import { pLimit } from '@/lib/utils/promise';

const BLOCKED_CATEGORIES = [
  'Housing society', 'Apartment building', 'Condominium complex', 'Housing complex',
  'Residents association', 'Gated community', 'Tea store', 'Coffee shop', 'Flour mill',
  'Private User', 'Transit station', 'Public toilet', 'Park', 'Garden', 'Playground',
  'Hostel', 'Dormitory', 'Paying guest', 'Lodging', 'Cottage', 'Villa', 'Resort',
  'Homestay', 'Guest house', 'School', 'College', 'University', 'Library'
];

const IT_BLOCKED_CATEGORIES = [
  'Manufacturer', 'Wholesaler', 'Supplier', 'Store', 'Shop', 'Factory', 'Mill',
  'Industrial', 'Plant', 'Agency', 'Consultant', 'Travel', 'Transport', 'Logistics',
  'Real estate', 'Broker', 'Gym', 'Fitness', 'Hospital', 'Clinic', 'Doctor',
  'Pharmacy', 'Restaurant', 'Hotel', 'Cafe', 'Bakery', 'Food', 'Beverage',
  'Clothing', 'Textile', 'Fashion', 'Jewelry', 'Furniture', 'Hardware',
  'Construction', 'Contractor', 'Interior', 'Automobile', 'Car', 'Bike',
  'Garage', 'Repair', 'Salon', 'Spa', 'Beauty', 'Makeup'
];

export class LeadService {
  static async searchLeads(query: string, taskId?: number, forceStore?: boolean, options?: { userAgent?: string; acceptLanguage?: string; manualUserId?: number }) {
    if (!options?.manualUserId) throw new Error('Unauthorized');
    const userId = options.manualUserId;

    const user = await UserRepository.findById(userId);
    if (!user || user.isSuspended) throw new Error('Account suspended or not found.');

    if (taskId) {
      const taskCheck = await TaskRepository.findById(taskId, userId);
      if (!taskCheck) throw new Error('Unauthorized task access');
      if (taskCheck.status !== 'running') {
        console.log(`[LEAD SERVICE] Task ${taskId} is no longer running (status: ${taskCheck.status}). Aborting search.`);
        return { success: false, error: 'Task paused or stopped' };
      }
    }

    const limits = this.computeLimits(user);
    if (limits.currentLimit !== Infinity && limits.remaining <= 0) {
      return { success: false, error: 'Limit reached', limitReached: true };
    }

    const trimmedQuery = query.trim();
    const coords = await this.getCoordinatesForPincode(trimmedQuery);

    const settingRows = await db.select({ value: settings.value }).from(settings).where(and(eq(settings.userId, userId), eq(settings.key, 'fastMode'))).limit(1);
    const fastMode = settingRows[0] ? JSON.parse(settingRows[0].value) : true;
    const shouldStoreLeads = forceStore ? true : !fastMode;

    if (shouldStoreLeads) {
      const cached = await this.tryGetCachedLeads(trimmedQuery, userId, taskId, limits);
      if (cached) return cached;
    }

    await AuditService.saveServerLog(taskId || null, 'INFO', `Cache miss for "${query}". Calling fetchLeads...`, userId);
    const rawLeads = await fetchLeads(query, coords?.lat, coords?.lng, { userAgent: options.userAgent, acceptLanguage: options.acceptLanguage });
    console.log(`[LEAD SERVICE] fetchLeads returned ${rawLeads.length} leads for "${query}"`);
    
    const validLeads = rawLeads.filter(lead => this.validateLead(lead, trimmedQuery));
    const filteredCount = rawLeads.length - validLeads.length;
    if (filteredCount > 0) {
      await AuditService.saveServerLog(taskId || null, 'INFO', `Filtered out ${filteredCount} irrelevant leads.`, userId);
    }

    const enrichedLeads = await this.enrichLeadsBatch(validLeads);
    const uniqueLeads = this.deduplicateLeads(enrichedLeads);

    return await this.saveLeadsBatch(uniqueLeads, userId, trimmedQuery, taskId, shouldStoreLeads, limits, fastMode);
  }

  private static validateLead(lead: any, query: string): boolean {
    if (!lead.category) return true;
    const lowerCat = lead.category.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (BLOCKED_CATEGORIES.some(c => lowerCat.includes(c.toLowerCase()))) return false;

    const isITIntent = ['it company', 'software', 'web', 'digital', 'tech', 'app dev', 'cyber'].some(k => lowerQuery.includes(k));
    if (isITIntent) {
      const isWhitelisted = ['computer', 'software', 'technology', 'web', 'digital', 'marketing', 'advertising', 'design', 'internet', 'data', 'security', 'cctv'].some(k => lowerCat.includes(k));
      if (isWhitelisted) return true;
      if (IT_BLOCKED_CATEGORIES.some(c => lowerCat.includes(c.toLowerCase()))) {
        if (lowerCat.includes('agency') && (lowerCat.includes('web') || lowerCat.includes('digital') || lowerCat.includes('marketing'))) return true;
        return false;
      }
    }
    return true;
  }

  private static computeLimits(user: any) {
    const isUnlimited = user.planType === 'premium' || user.planType === 'enterprise';
    const currentLimit = isUnlimited ? Infinity : 500 + (user.bonusCredits || 0);
    const used = user.leadsExtracted || 0;
    const remaining = currentLimit === Infinity ? Infinity : Math.max(currentLimit - used, 0);
    return { currentLimit, used, remaining };
  }

  static computeLeadScore(lead: any) {
    let score = 0;
    if (lead.rating) score += Math.min(Math.round(Number(lead.rating) * 10), 50);
    if (lead.reviewsCount || lead.reviews_count) score += Math.min(Math.round(Number(lead.reviewsCount || lead.reviews_count) / 10), 30);
    if (lead.email || lead.websiteEmail) score += 10;
    if (lead.phone || lead.websitePhone) score += 10;
    if (lead.website) score += 5;
    return Math.min(score, 100);
  }

  private static getLeadKey(lead: any) {
    const placeId = (lead.placeId || lead.place_id || '').toString().trim();
    if (placeId) return `pid:${placeId}`;
    const name = (lead.name || '').toString().trim().toLowerCase();
    const address = (lead.address || '').toString().trim().toLowerCase();
    const phone = (lead.phone || '').toString().trim();
    const website = (lead.website || '').toString().trim().toLowerCase();
    return `fb:${name}|${address}|${phone}|${website}`;
  }

  private static async getCoordinatesForPincode(query: string) {
    const pincodeMatch = query.match(/\b(\d{6})\b/);
    if (!pincodeMatch) return null;
    const pincode = pincodeMatch[1];

    const cached = await db.select().from(pincodeCoords).where(and(eq(pincodeCoords.country, 'India'), eq(pincodeCoords.pincode, pincode))).limit(1);
    if (cached[0]) return { lat: cached[0].latitude, lng: cached[0].longitude };

    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`, {
        headers: { 'User-Agent': 'LeadSpotter/1.0' }
      });
      const geoData = await geoRes.json();
      if (geoData && geoData[0]) {
        const lat = parseFloat(geoData[0].lat);
        const lng = parseFloat(geoData[0].lon);
        await db.insert(pincodeCoords).values({ country: 'India', pincode, latitude: lat, longitude: lng }).onConflictDoNothing();
        return { lat, lng };
      }
    } catch (e) {
      console.error(`Geocoding failed for ${pincode}:`, e);
    }
    return null;
  }

  private static async tryGetCachedLeads(query: string, userId: number, taskId: number | undefined, limits: any) {
    const existingSearches = await db.select().from(searches)
      .where(and(eq(searches.query, query), eq(searches.userId, userId), sql`created_at > NOW() - INTERVAL '30 days'`))
      .orderBy(desc(searches.createdAt)).limit(1);
    
    if (existingSearches.length === 0) return null;

    const searchId = existingSearches[0].id;
    const cachedLeadsRes = await db.select({ id: leads.id }).from(leads)
      .innerJoin(leadSources, eq(leads.id, leadSources.leadId))
      .where(eq(leadSources.searchId, searchId));
    
    if (cachedLeadsRes.length === 0) return null;

    const count = cachedLeadsRes.length;

    return await db.transaction(async (tx) => {
      // FIX: Use row-level locking for credit limit check
      const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
      const lockedLimits = this.computeLimits(user[0]);
      
      if (lockedLimits.currentLimit !== Infinity && lockedLimits.remaining < count) {
        return { success: false, error: 'Limit reached for cached results', limitReached: true };
      }

      if (taskId) {
        const tLeads = cachedLeadsRes.map(l => ({ taskId, leadId: l.id }));
        await tx.insert(taskLeads).values(tLeads).onConflictDoNothing();
        const countRes = await tx.select({ count: sql<number>`count(*)` }).from(taskLeads).where(eq(taskLeads.taskId, taskId));
        await tx.update(tasks).set({ totalLeads: Number(countRes[0].count) }).where(eq(tasks.id, taskId));
      }

      const lSources = cachedLeadsRes.map(l => ({ leadId: l.id, searchId, taskId: taskId || null }));
      await tx.insert(leadSources).values(lSources).onConflictDoNothing();

      await tx.update(users).set({ leadsExtracted: sql`leads_extracted + ${count}` }).where(eq(users.id, userId));
      return { success: true, count, searchId, cached: true, leads: [] };
    });
  }

  private static async enrichLeadsBatch(validLeads: any[]) {
    const limit = pLimit(10); // Max 10 concurrent enrichment requests
    return await Promise.all(validLeads.map(async (lead) => {
      return limit(async () => {
        if (lead.website) {
          try {
            const enrichment = await enrichLead(lead.website);
            return {
              ...lead,
              email: lead.email || (enrichment.emails.length > 0 ? enrichment.emails[0] : null),
              websiteEmail: enrichment.emails.join(', ') || null,
              websitePhone: enrichment.phones.join(', ') || null,
              socials: { ...lead.socials, ...enrichment.socials }
            };
          } catch (e) {
            console.error(`Enrichment failed for ${lead.website}:`, e);
          }
        }
        return lead;
      });
    }));
  }

  private static deduplicateLeads(enrichedLeads: any[]) {
    const dedupeMap = new Map<string, any>();
    for (const lead of enrichedLeads) {
      const key = this.getLeadKey(lead);
      if (!dedupeMap.has(key)) dedupeMap.set(key, lead);
    }
    return Array.from(dedupeMap.values());
  }

  private static async saveLeadsBatch(uniqueLeads: any[], userId: number, query: string, taskId: number | undefined, shouldStoreLeads: boolean, limits: any, fastMode: boolean) {
    return await db.transaction(async (tx) => {
      // FIX: Use row-level locking for credit limit check
      const userRows = await tx.select().from(users).where(eq(users.id, userId)).for('update');
      const lockedLimits = this.computeLimits(userRows[0]);

      const allowedCount = lockedLimits.currentLimit === Infinity ? uniqueLeads.length : Math.min(uniqueLeads.length, lockedLimits.remaining);
      if (allowedCount <= 0) return { success: false, error: 'Limit reached', limitReached: true };

      const leadsToInsert = uniqueLeads.slice(0, allowedCount);
      const searchRes = await tx.insert(searches).values({ userId, query, taskId: taskId || null }).returning({ id: searches.id });
      const searchId = searchRes[0].id;

      if (shouldStoreLeads && leadsToInsert.length > 0) {
        const insertData = leadsToInsert.map(lead => ({
          name: lead.name, address: lead.address, city: lead.city, website: lead.website, phone: lead.phone, email: lead.email, rating: lead.rating, reviewsCount: lead.reviewsCount, category: lead.category, placeId: lead.placeId, latitude: lead.latitude, longitude: lead.longitude, directionUrl: lead.directionUrl,
          mondayHours: lead.hours?.monday || null, tuesdayHours: lead.hours?.tuesday || null, wednesdayHours: lead.hours?.wednesday || null, thursdayHours: lead.hours?.thursday || null, fridayHours: lead.hours?.friday || null, saturdayHours: lead.hours?.saturday || null, sundayHours: lead.hours?.sunday || null,
          facebook: lead.socials?.facebook || null, instagram: lead.socials?.instagram || null, linkedin: lead.socials?.linkedin || null, twitter: lead.socials?.twitter || null, youtube: lead.socials?.youtube || null, pinterest: lead.socials?.pinterest || null, tiktok: lead.socials?.tiktok || null,
          websiteEmail: lead.websiteEmail || null, websitePhone: lead.websitePhone || null, leadScore: this.computeLeadScore(lead)
        }));

        await tx.insert(leads).values(insertData).onConflictDoUpdate({
          target: [leads.placeId],
          set: { 
            name: sql`EXCLUDED.name`,
            rating: sql`EXCLUDED.rating`,
            reviewsCount: sql`EXCLUDED.reviews_count`,
            websiteEmail: sql`EXCLUDED.website_email`,
            websitePhone: sql`EXCLUDED.website_phone`,
            leadScore: sql`EXCLUDED.lead_score`
          }
        });

        // Update SEO Hub Registry
        try {
          const seoStats = new Map<string, any>();
          
          for (const lead of leadsToInsert) {
            if (!lead.category || !lead.city) continue;
            
            // Basic normalization
            const niche = String(lead.category).trim();
            const city = String(lead.city).trim();
            if (!niche || !city) continue;
            
            const key = `${niche}::${city}`;
            if (!seoStats.has(key)) {
              seoStats.set(key, { niche, city, count: 0, withEmail: 0, withPhone: 0, withWebsite: 0, totalRating: 0, ratingCount: 0 });
            }
            
            const stat = seoStats.get(key);
            stat.count += 1;
            if (lead.email || lead.websiteEmail) stat.withEmail += 1;
            if (lead.phone || lead.websitePhone) stat.withPhone += 1;
            if (lead.website) stat.withWebsite += 1;
            if (lead.rating) {
              stat.totalRating += Number(lead.rating);
              stat.ratingCount += 1;
            }
          }

          if (seoStats.size > 0) {
            const seoInsertData = Array.from(seoStats.values()).map(stat => ({
              niche: stat.niche,
              city: stat.city,
              totalLeads: stat.count,
              withEmail: stat.withEmail,
              withPhone: stat.withPhone,
              withWebsite: stat.withWebsite,
              avgRating: stat.ratingCount > 0 ? (stat.totalRating / stat.ratingCount) : 0,
            }));

            await tx.insert(seoHubRegistry).values(seoInsertData).onConflictDoUpdate({
              target: [seoHubRegistry.niche, seoHubRegistry.city],
              set: {
                totalLeads: sql`seo_hub_registry.total_leads + EXCLUDED.total_leads`,
                withEmail: sql`seo_hub_registry.with_email + EXCLUDED.with_email`,
                withPhone: sql`seo_hub_registry.with_phone + EXCLUDED.with_phone`,
                withWebsite: sql`seo_hub_registry.with_website + EXCLUDED.with_website`,
                lastUpdated: sql`NOW()`
              }
            });
          }
        } catch (seoErr) {
          console.error('[LEAD SERVICE] Failed to update seo_hub_registry', seoErr);
        }

        const inserted = await tx.select({ id: leads.id, placeId: leads.placeId }).from(leads).where(inArray(leads.placeId, leadsToInsert.map(l => l.placeId).filter(Boolean) as string[]));
        
        if (inserted.length > 0) {
          if (taskId) {
            await tx.insert(taskLeads).values(inserted.map(l => ({ taskId, leadId: l.id }))).onConflictDoNothing();
          }
          await tx.insert(leadSources).values(inserted.map(l => ({ leadId: l.id, searchId, taskId: taskId || null }))).onConflictDoNothing();
        }

        if (taskId) {
          const countRes = await tx.select({ count: sql<number>`count(*)` }).from(taskLeads).where(eq(taskLeads.taskId, taskId));
          await tx.update(tasks).set({ totalLeads: Number(countRes[0].count) }).where(eq(tasks.id, taskId));
        }
      }

      await tx.update(users).set({ leadsExtracted: sql`leads_extracted + ${leadsToInsert.length}` }).where(eq(users.id, userId));

      return {
        success: true,
        count: leadsToInsert.length,
        searchId,
        cached: false,
        limitReached: lockedLimits.currentLimit !== Infinity && leadsToInsert.length < uniqueLeads.length,
        leads: shouldStoreLeads ? [] : leadsToInsert,
        fastMode
      };
    });
  }

  static async getLeads(userId: number, searchId?: number) {
    if (searchId) {
      return await LeadRepository.findBySearchId(userId, searchId);
    } else {
      return await LeadRepository.findAllByUserId(userId);
    }
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

      await AuditService.logAction('total_wipe', 'success', { userId }, tx);
    });
  }
}
