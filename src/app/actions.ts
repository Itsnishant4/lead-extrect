'use server';

import { db, seed } from '@/lib/db/index';
import { fetchLeads } from '@/lib/extractor';
import { Lead } from '@/lib/parser';
import { enrichLead } from '@/lib/enricher';
import { hashPassword, verifyPassword, signToken, getSession } from '@/lib/auth';
import { cookies, headers } from 'next/headers';

// --- Logging Helper ---

export async function logAction(action: string, status: 'success' | 'error' | 'info', metadata: any = {}) {
  try {
    const session = await getSession();
    await db`
      INSERT INTO audit_logs (user_id, action, status, metadata)
      VALUES (${session?.id || null}, ${action}, ${status}, ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (e) {
    console.error('Failed to log action:', e);
  }
}

// --- Auth Actions ---

export async function signupAction(name: string, email: string, password: string) {
  try {
    // Check if user exists
    const existing = await db`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return { success: false, error: 'User with this email already exists' };
    }

    const hashedPassword = await hashPassword(password);
    
    const result = await db`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id
    `;

    const userId = result[0].id;

    // Auto-login: Sign token and set cookie
    const token = await signToken({ id: userId, email, name });
    
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    await logAction('signup', 'success', { email });
    return { success: true };
  } catch (error) {
    await logAction('signup', 'error', { email, error: (error as Error).message });
    return { success: false, error: (error as Error).message };
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const users = await db`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user || !(await verifyPassword(password, user.password))) {
      return { success: false, error: 'Invalid credentials' };
    }
    if (user.is_suspended) {
      return { success: false, error: 'Account suspended. Contact support.' };
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    await logAction('login', 'success', { email });
    return { success: true };
  } catch (error) {
    await logAction('login', 'error', { email, error: (error as Error).message });
    return { success: false, error: (error as Error).message };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}

export async function getUserAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  
  try {
    const users = await db`SELECT id, name, email, is_admin, is_suspended, plan_type, leads_extracted, bonus_credits, subscription_expiry FROM users WHERE id = ${session.id}`;
    const user = users[0];
    if (user) {
      if (user.is_suspended) {
        return { success: true, data: user };
      }
      // Check for subscription expiry
      if (user.plan_type === 'pro' && user.subscription_expiry && new Date(user.subscription_expiry) < new Date()) {
        await db`UPDATE users SET plan_type = 'free' WHERE id = ${user.id}`;
        user.plan_type = 'free';
        await logAction('subscription_expired', 'info', { email: user.email });
      }
      return { success: true, data: user };
    }
  } catch (e) {}
  
  return { success: false, data: null };
}

// --- Protected Data Actions ---

export async function searchLeadsAction(query: string, taskId?: number, forceStore?: boolean, options?: { userAgent?: string; acceptLanguage?: string; manualUserId?: number }) {
  let effectiveUserId: number;
  const session = await getSession();
  
  if (options?.manualUserId) {
    effectiveUserId = options.manualUserId;
  } else if (session) {
    effectiveUserId = session.id;
  } else {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const suspendedCheck = await db`SELECT is_suspended FROM users WHERE id = ${effectiveUserId}`;
    if (suspendedCheck[0]?.is_suspended) {
      return { success: false, error: 'Account suspended. Contact support.' };
    }

    // --- Subscription & Limit Check ---
    const limits: Record<string, number> = {
      'free': 500,
      'pro': 5000,
      'premium': Infinity
    };

    const computeLimit = (userRow: any) => {
      const baseLimit = limits[userRow?.plan_type || 'free'] ?? 500;
      const bonusCredits = userRow?.bonus_credits || 0;
      const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits;
      const used = userRow?.leads_extracted || 0;
      const remaining = currentLimit === Infinity ? Infinity : Math.max(currentLimit - used, 0);
      return { baseLimit, bonusCredits, currentLimit, used, remaining };
    };

    const computeLeadScore = (lead: any) => {
      let score = 0;
      if (lead.rating) score += Math.min(Math.round(Number(lead.rating) * 10), 50);
      if (lead.reviewsCount) score += Math.min(Math.round(Number(lead.reviewsCount) / 10), 30);
      if (lead.email || lead.website_email) score += 10;
      if (lead.phone || lead.website_phone) score += 10;
      if (lead.website) score += 5;
      return Math.min(score, 100);
    };

    const getLeadKey = (lead: any) => {
      const placeId = (lead.placeId || lead.place_id || '').toString().trim();
      if (placeId) return `pid:${placeId}`;
      const name = (lead.name || '').toString().trim().toLowerCase();
      const address = (lead.address || '').toString().trim().toLowerCase();
      const phone = (lead.phone || '').toString().trim();
      const website = (lead.website || '').toString().trim().toLowerCase();
      return `fb:${name}|${address}|${phone}|${website}`;
    };

    const users = await db`SELECT plan_type, leads_extracted, bonus_credits FROM users WHERE id = ${effectiveUserId}`;
    const user = users[0];
    const { currentLimit, used, remaining } = computeLimit(user);

    if (currentLimit !== Infinity && remaining <= 0) {
      return { 
        success: false, 
        error: `Limit reached! You have extracted ${used} leads. Please upgrade your plan to extract more.`,
        limitReached: true 
      };
    }

    const headerList = await headers();
    const userAgent = options?.userAgent || headerList.get('user-agent') || undefined;
    const acceptLanguage = options?.acceptLanguage || headerList.get('accept-language') || undefined;

    await saveServerLogAction(taskId || null, 'INFO', `searchLeadsAction started for query: "${query}"`);
    console.log(`[ACTION] UA: ${userAgent?.substring(0, 50)}...`);

    const trimmedQuery = query.trim();

    // --- Pincode Coordinate Logic ---
    let lat: number | undefined = undefined;
    let lng: number | undefined = undefined;

    // Detect 6-digit Indian pincode
    const pincodeMatch = trimmedQuery.match(/\b(\d{6})\b/);
    if (pincodeMatch) {
      const pincode = pincodeMatch[1];
      
      // 1. Check local cache
      const cachedCoords = await db`
        SELECT latitude, longitude FROM pincode_coords 
        WHERE country = 'India' AND pincode = ${pincode}
      `;

      if (cachedCoords[0]) {
        lat = cachedCoords[0].latitude;
        lng = cachedCoords[0].longitude;
        console.log(`Using cached coordinates for ${pincode}: ${lat}, ${lng}`);
      } else {
        // 2. Fetch from external API (Nominatim is free but has rate limits, perfect for background)
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`, {
            headers: { 'User-Agent': 'LeadSpotter/1.0' }
          });
          const geoData = await geoRes.json();

          if (geoData && geoData[0]) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);

            // Save to cache
            await db`
              INSERT INTO pincode_coords (country, pincode, latitude, longitude)
              VALUES ('India', ${pincode}, ${lat}, ${lng})
              ON CONFLICT DO NOTHING
            `;
            console.log(`Geocoded ${pincode} to ${lat}, ${lng}`);
          }
        } catch (e) {
          console.error(`Geocoding failed for ${pincode}:`, e);
        }
      }
    }

    const settingsRows = await db`
      SELECT value FROM settings WHERE user_id = ${effectiveUserId} AND key = 'fastMode'
    `;
    const fastMode = settingsRows[0] ? JSON.parse(settingsRows[0].value) : true;
    const shouldStoreLeads = forceStore ? true : !fastMode;

    if (shouldStoreLeads) {
      // 1. Check for recent cache (last 30 days) for this exact query
      const existingSearches = await db`
        SELECT id, task_id FROM searches 
        WHERE query = ${trimmedQuery} 
        AND user_id = ${effectiveUserId}
        AND created_at > NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const existingSearch = existingSearches[0];

      if (existingSearch) {
        const searchId = existingSearch.id;
        
        // Get leads associated with this search
        const existingLeads = await db`SELECT id, place_id FROM leads WHERE search_id = ${searchId}`;
        const existingLeadKeys = new Set(existingLeads.map((lead: any) => getLeadKey(lead)));
        const existingLeadCount = existingLeadKeys.size;

        if (existingLeads.length > 0) {
          if (currentLimit !== Infinity && existingLeadCount > remaining) {
            return {
              success: false,
              error: "Limit reached. Not enough credits to use cached results.",
              limitReached: true
            };
          }

          const cachedResult = await db.begin(async (tx: any) => {
            const lockedUsers = await tx`
              SELECT plan_type, leads_extracted, bonus_credits 
              FROM users WHERE id = ${effectiveUserId} FOR UPDATE
            `;
            const lockedUser = lockedUsers[0];
            const locked = computeLimit(lockedUser);
            if (locked.currentLimit !== Infinity && locked.remaining <= 0) {
              return { 
                success: false, 
                error: `Limit reached! You have extracted ${locked.used} leads. Please upgrade your plan to extract more.`,
                limitReached: true 
              };
            }
            if (locked.currentLimit !== Infinity && existingLeadCount > locked.remaining) {
              return {
                success: false,
                error: "Limit reached. Not enough credits to use cached results.",
                limitReached: true
              };
            }

            if (taskId) {
                for (const lead of existingLeads) {
                    await tx`
                        INSERT INTO task_leads (task_id, lead_id) VALUES (${taskId}, ${lead.id})
                        ON CONFLICT DO NOTHING
                    `;
                }

                const countRes = await tx`SELECT COUNT(*) as count FROM task_leads WHERE task_id = ${taskId}`;
                await tx`UPDATE tasks SET total_leads = ${countRes[0].count} WHERE id = ${taskId}`;
            }

            for (const lead of existingLeads) {
              await tx`
                INSERT INTO lead_sources (lead_id, search_id, task_id)
                VALUES (${lead.id}, ${searchId}, ${taskId || existingSearch.task_id || null})
                ON CONFLICT DO NOTHING
              `;
            }

            await tx`UPDATE users SET leads_extracted = leads_extracted + ${existingLeadCount} WHERE id = ${effectiveUserId}`;

            return { success: true, count: existingLeadCount, searchId, cached: true, leads: [] };
          });

          return cachedResult;
        }
      }
    }

    // 2. CACHE MISS: Fetch from API
    await saveServerLogAction(taskId || null, 'INFO', `Cache miss for "${query}". Calling fetchLeads...`);
    const rawLeads = await fetchLeads(query, lat, lng, { userAgent, acceptLanguage });
    await saveServerLogAction(taskId || null, 'SUCCESS', `fetchLeads returned ${rawLeads.length} raw leads`);

    // 4. Enrich leads
    const enrichedLeads = await Promise.all(rawLeads.map(async (lead) => {
      // ... same enrichment logic ...
      if (lead.website) {
        const enrichment = await enrichLead(lead.website);
        return {
          ...lead,
          email: lead.email || (enrichment.emails.length > 0 ? enrichment.emails[0] : null),
          website_email: enrichment.emails.join(', ') || null,
          website_phone: enrichment.phones.join(', ') || null,
          socials: {
            ...lead.socials,
            ...enrichment.socials
          }
        };
      }
      return lead;
    }));
    const dedupeMap = new Map<string, any>();
    for (const lead of enrichedLeads) {
      const key = getLeadKey(lead);
      if (!dedupeMap.has(key)) dedupeMap.set(key, lead);
    }
    const uniqueLeads = Array.from(dedupeMap.values());

    const insertResult = await db.begin(async (tx: any) => {
      const lockedUsers = await tx`
        SELECT plan_type, leads_extracted, bonus_credits 
        FROM users WHERE id = ${effectiveUserId} FOR UPDATE
      `;
      const lockedUser = lockedUsers[0];
      const locked = computeLimit(lockedUser);
      if (locked.currentLimit !== Infinity && locked.remaining <= 0) {
        return { 
          success: false, 
          error: `Limit reached! You have extracted ${locked.used} leads. Please upgrade your plan to extract more.`,
          limitReached: true 
        };
      }

      const allowedCount = locked.currentLimit === Infinity
        ? uniqueLeads.length
        : Math.min(uniqueLeads.length, locked.remaining);

      if (allowedCount <= 0) {
        return {
          success: false,
          error: "Limit reached. No remaining credits to save leads.",
          limitReached: true
        };
      }

      const leadsToInsert = uniqueLeads.slice(0, allowedCount);

      const searchResult = await tx`
        INSERT INTO searches (user_id, query, task_id) VALUES (${effectiveUserId}, ${trimmedQuery}, ${taskId || null}) RETURNING id
      `;
      const searchId = searchResult[0].id;

      if (shouldStoreLeads) {
        for (const lead of leadsToInsert) {
            const leadScore = computeLeadScore(lead);
            await tx`
              INSERT INTO leads 
              (search_id, task_id, name, address, city, website, phone, email, rating, reviews_count, category, place_id, latitude, longitude, direction_url, 
               monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours, saturday_hours, sunday_hours,
               facebook, instagram, linkedin, twitter, youtube, pinterest, tiktok,
               website_email, website_phone, lead_score)
              VALUES (${searchId}, ${taskId || null}, ${lead.name}, ${lead.address}, ${lead.city}, ${lead.website}, ${lead.phone}, ${lead.email}, ${lead.rating}, ${lead.reviewsCount}, ${lead.category}, ${lead.placeId}, ${lead.latitude}, ${lead.longitude}, ${lead.directionUrl}, 
               ${lead.hours?.monday || null}, ${lead.hours?.tuesday || null}, ${lead.hours?.wednesday || null}, ${lead.hours?.thursday || null}, ${lead.hours?.friday || null}, ${lead.hours?.saturday || null}, ${lead.hours?.sunday || null},
               ${lead.socials?.facebook || null}, ${lead.socials?.instagram || null}, ${lead.socials?.linkedin || null}, ${lead.socials?.twitter || null}, ${lead.socials?.youtube || null}, ${lead.socials?.pinterest || null}, ${lead.socials?.tiktok || null},
               ${lead.website_email || null}, ${lead.website_phone || null}, ${leadScore})
              ON CONFLICT (place_id) DO NOTHING
            `;

            const leadRow = await tx`SELECT id FROM leads WHERE place_id = ${lead.placeId}`;
            if (leadRow[0]) {
                if (taskId) {
                    await tx`
                        INSERT INTO task_leads (task_id, lead_id) VALUES (${taskId}, ${leadRow[0].id})
                        ON CONFLICT DO NOTHING
                    `;
                }
                await tx`
                  INSERT INTO lead_sources (lead_id, search_id, task_id)
                  VALUES (${leadRow[0].id}, ${searchId}, ${taskId || null})
                  ON CONFLICT DO NOTHING
                `;
            }
        }

        if (taskId) {
          const countRes = await tx`SELECT COUNT(*) as count FROM task_leads WHERE task_id = ${taskId}`;
          await tx`UPDATE tasks SET total_leads = ${countRes[0].count} WHERE id = ${taskId}`;
        }
      }

      await tx`UPDATE users SET leads_extracted = leads_extracted + ${leadsToInsert.length} WHERE id = ${effectiveUserId}`;

      return { 
        success: true, 
        count: leadsToInsert.length, 
        searchId, 
        cached: false,
        limitReached: locked.currentLimit !== Infinity && leadsToInsert.length < uniqueLeads.length,
        leads: shouldStoreLeads ? [] : leadsToInsert,
        fastMode
      };
    });

    return insertResult;
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createTaskAction(name: string, keywords: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || null;
    const acceptLanguage = headerList.get('accept-language') || null;

    const result = await db`
      INSERT INTO tasks (user_id, name, keywords, total_keywords, status, user_agent, accept_language) 
      VALUES (${session.id}, ${name}, ${JSON.stringify(keywords)}, ${keywords.length}, 'pending', ${userAgent}, ${acceptLanguage})
      RETURNING id
    `;
    
    return { success: true, taskId: Number(result[0].id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createTaskShellAction(name: string, totalKeywords: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || null;
    const acceptLanguage = headerList.get('accept-language') || null;

    const result = await db`
      INSERT INTO tasks (user_id, name, keywords, total_keywords, status, user_agent, accept_language) 
      VALUES (${session.id}, ${name}, ${JSON.stringify([])}, ${totalKeywords}, 'pending', ${userAgent}, ${acceptLanguage})
      RETURNING id
    `;

    return { success: true, taskId: Number(result[0].id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function appendTaskKeywordsAction(taskId: number, keywords: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (keywords.length === 0) return { success: true };
    
    const task = await db`SELECT keywords FROM tasks WHERE id = ${taskId} AND user_id = ${session.id}`;
    if (!task[0]) return { success: false, error: 'Task not found or unauthorized' };

    const existing = task[0].keywords || '[]';
    const chunkString = JSON.stringify(keywords);
    const nextKeywords =
      !existing || existing === '[]'
        ? chunkString
        : `${existing.slice(0, -1)},${chunkString.slice(1)}`;

    await db`
      UPDATE tasks 
      SET keywords = ${nextKeywords}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${taskId} AND user_id = ${session.id}
    `;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTaskStatusAction(taskId: number, status: string, currentIndex?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (currentIndex !== undefined) {
      await db`
        UPDATE tasks SET status = ${status}, current_keyword_index = ${currentIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId} AND user_id = ${session.id}
      `;
    } else {
      await db`
        UPDATE tasks SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId} AND user_id = ${session.id}
      `;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTaskLeadCountAction(taskId: number, totalLeads: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`
      UPDATE tasks 
      SET total_leads = ${totalLeads}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${taskId} AND user_id = ${session.id}
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`SELECT * FROM tasks WHERE user_id = ${session.id} ORDER BY created_at DESC`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const result = await db`SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${session.id}`;
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTaskLeadsAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`
        SELECT l.* 
        FROM leads l 
        JOIN task_leads tl ON l.id = tl.lead_id 
        JOIN tasks t ON tl.task_id = t.id
        WHERE tl.task_id = ${taskId} 
        AND t.user_id = ${session.id}
        ORDER BY tl.created_at DESC
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLeadsAction(searchId?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    let results;
    if (searchId) {
      results = await db`
        SELECT l.*, COUNT(ls.search_id) as source_count
        FROM leads l
        LEFT JOIN lead_sources ls ON ls.lead_id = l.id
        WHERE l.search_id = ${searchId}
        GROUP BY l.id
        ORDER BY l.created_at DESC
      `;
    } else {
      results = await db`
        SELECT l.*, COUNT(ls.search_id) as source_count
        FROM leads l
        LEFT JOIN lead_sources ls ON ls.lead_id = l.id
        GROUP BY l.id
        ORDER BY l.created_at DESC
        LIMIT 10
      `;
    }
    const computed = results.map((lead: any) => {
      const score =
        lead.lead_score ??
        (() => {
          let s = 0;
          if (lead.rating) s += Math.min(Math.round(Number(lead.rating) * 10), 50);
          if (lead.reviews_count) s += Math.min(Math.round(Number(lead.reviews_count) / 10), 30);
          if (lead.email || lead.website_email) s += 10;
          if (lead.phone || lead.website_phone) s += 10;
          if (lead.website) s += 5;
          return Math.min(s, 100);
        })();
      return { ...lead, lead_score: score };
    });
    return { success: true, data: computed };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createSavedListAction(name: string, leadIds: number[], description?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (!name.trim() || leadIds.length === 0) {
      return { success: false, error: 'Name and leads are required' };
    }

    const result = await db`
      INSERT INTO saved_lists (user_id, name, description)
      VALUES (${session.id}, ${name.trim()}, ${description || null})
      RETURNING id
    `;
    const listId = Number(result[0].id);

    for (const leadId of leadIds) {
      await db`
        INSERT INTO saved_list_items (list_id, lead_id)
        VALUES (${listId}, ${leadId})
        ON CONFLICT DO NOTHING
      `;
    }

    return { success: true, listId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createSavedListFromLeadsAction(
  name: string,
  leads: any[],
  description?: string
) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (!name.trim() || leads.length === 0) {
      return { success: false, error: 'Name and leads are required' };
    }

    const computeLeadScore = (lead: any) => {
      let score = 0;
      if (lead.rating) score += Math.min(Math.round(Number(lead.rating) * 10), 50);
      if (lead.reviewsCount) score += Math.min(Math.round(Number(lead.reviewsCount) / 10), 30);
      if (lead.email || lead.website_email) score += 10;
      if (lead.phone || lead.website_phone) score += 10;
      if (lead.website) score += 5;
      return Math.min(score, 100);
    };

    const result = await db.begin(async (tx: any) => {
      const listRes = await tx`
        INSERT INTO saved_lists (user_id, name, description)
        VALUES (${session.id}, ${name.trim()}, ${description || null})
        RETURNING id
      `;
      const listId = Number(listRes[0].id);

      for (const lead of leads) {
        const leadScore = computeLeadScore(lead);
        await tx`
          INSERT INTO leads 
          (search_id, task_id, name, address, city, website, phone, email, rating, reviews_count, category, place_id, latitude, longitude, direction_url, 
           monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours, saturday_hours, sunday_hours,
           facebook, instagram, linkedin, twitter, youtube, pinterest, tiktok,
           website_email, website_phone, lead_score)
          VALUES (NULL, NULL, ${lead.name}, ${lead.address}, ${lead.city}, ${lead.website}, ${lead.phone}, ${lead.email}, ${lead.rating}, ${lead.reviewsCount}, ${lead.category}, ${lead.placeId}, ${lead.latitude}, ${lead.longitude}, ${lead.directionUrl}, 
           ${lead.hours?.monday || null}, ${lead.hours?.tuesday || null}, ${lead.hours?.wednesday || null}, ${lead.hours?.thursday || null}, ${lead.hours?.friday || null}, ${lead.hours?.saturday || null}, ${lead.hours?.sunday || null},
           ${lead.socials?.facebook || null}, ${lead.socials?.instagram || null}, ${lead.socials?.linkedin || null}, ${lead.socials?.twitter || null}, ${lead.socials?.youtube || null}, ${lead.socials?.pinterest || null}, ${lead.socials?.tiktok || null},
           ${lead.website_email || null}, ${lead.website_phone || null}, ${leadScore})
          ON CONFLICT (place_id) DO NOTHING
        `;

        const leadRow = await tx`SELECT id FROM leads WHERE place_id = ${lead.placeId}`;
        if (leadRow[0]) {
          await tx`
            INSERT INTO saved_list_items (list_id, lead_id)
            VALUES (${listId}, ${leadRow[0].id})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      return { listId };
    });

    return { success: true, listId: result.listId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

const ensureTaskExportColumns = async () => {
  await db.unsafe(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS export_file_ids TEXT`);
  await db.unsafe(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS export_status TEXT`);
  await db.unsafe(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS export_created_at TIMESTAMP`);
};

const appendTaskExportFileId = async (taskId: number, fileId: string) => {
  await ensureTaskExportColumns();
  const rows = await db`SELECT export_file_ids FROM tasks WHERE id = ${taskId}`;
  const existing = rows[0]?.export_file_ids;
  const list = existing ? JSON.parse(existing) : [];
  list.push(fileId);
  await db`
    UPDATE tasks
    SET export_file_ids = ${JSON.stringify(list)}, export_status = 'uploaded', export_created_at = CURRENT_TIMESTAMP
    WHERE id = ${taskId}
  `;
};

export async function uploadTaskExportChunkAction(
  taskId: number,
  taskName: string,
  csvContent: string,
  chunkIndex: number
) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return { success: false, error: 'Telegram not configured' };
    }

    const filename = `${taskName.replace(/\s+/g, '_')}_part_${chunkIndex + 1}.csv`;
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('document', new Blob([csvContent], { type: 'text/csv' }), filename);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Telegram upload failed' };
    }

    const fileId = data.result?.document?.file_id;
    if (fileId) {
      await appendTaskExportFileId(taskId, fileId);
    }

    return { success: true, fileId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function sendTaskExportToTelegramAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return { success: false, error: 'Telegram not configured' };
    }

    await ensureTaskExportColumns();
    const rows = await db`SELECT export_file_ids FROM tasks WHERE id = ${taskId} AND user_id = ${session.id}`;
    const list = rows[0]?.export_file_ids ? JSON.parse(rows[0].export_file_ids) : [];
    if (list.length === 0) {
      return { success: false, error: 'No export files found' };
    }

    for (const fileId of list) {
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('document', fileId);
      await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: form
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSavedListsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`
      SELECT sl.*, COUNT(sli.lead_id) as lead_count
      FROM saved_lists sl
      LEFT JOIN saved_list_items sli ON sl.id = sli.list_id
      WHERE sl.user_id = ${session.id}
      GROUP BY sl.id
      ORDER BY sl.created_at DESC
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSavedListLeadsAction(listId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`
      SELECT l.*, COUNT(ls.search_id) as source_count
      FROM saved_lists sl
      JOIN saved_list_items sli ON sl.id = sli.list_id
      JOIN leads l ON l.id = sli.lead_id
      LEFT JOIN lead_sources ls ON ls.lead_id = l.id
      WHERE sl.id = ${listId} AND sl.user_id = ${session.id}
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createExportTemplateAction(name: string, columns: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (!name.trim() || columns.length === 0) {
      return { success: false, error: 'Name and columns are required' };
    }

    const result = await db`
      INSERT INTO export_templates (user_id, name, columns)
      VALUES (${session.id}, ${name.trim()}, ${JSON.stringify(columns)})
      RETURNING id
    `;
    return { success: true, templateId: Number(result[0].id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getExportTemplatesAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`
      SELECT id, name, columns, created_at
      FROM export_templates
      WHERE user_id = ${session.id}
      ORDER BY created_at DESC
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    // Verify ownership
    const task = await db`SELECT id FROM tasks WHERE id = ${taskId} AND user_id = ${session.id}`;
    if (!task[0]) return { success: false, error: 'Task not found or unauthorized' };

    // 0. Delete lead source links for this task
    await db`DELETE FROM lead_sources WHERE task_id = ${taskId}`;

    // 1. Delete task-lead entries
    await db`DELETE FROM task_leads WHERE task_id = ${taskId}`;

    // 2. Dissociate searches and leads
    await db`UPDATE searches SET task_id = NULL WHERE task_id = ${taskId}`;
    await db`UPDATE leads SET task_id = NULL WHERE task_id = ${taskId}`;
    
    // 3. Delete the task record itself
    await db`DELETE FROM tasks WHERE id = ${taskId}`;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function pauseAllRunningTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`UPDATE tasks SET status = 'paused' WHERE status = 'running' AND user_id = ${session.id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getRecentSearchesAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`SELECT * FROM searches WHERE user_id = ${session.id} ORDER BY created_at DESC LIMIT 10`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCityAreasAction(country: string, state: string, city: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const result = await db`SELECT areas FROM city_areas WHERE country = ${country} AND state = ${state} AND city = ${city}`;
    
    if (result[0]) {
      return { success: true, data: JSON.parse(result[0].areas) as string[] };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function saveCityAreasAction(country: string, state: string, city: string, areas: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`
      INSERT INTO city_areas (country, state, city, areas, last_updated)
      VALUES (${country}, ${state}, ${city}, ${JSON.stringify(areas)}, CURRENT_TIMESTAMP)
      ON CONFLICT (country, state, city) DO UPDATE SET areas = ${JSON.stringify(areas)}, last_updated = CURRENT_TIMESTAMP
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getBulkCityAreasAction(country: string, state: string, cities: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`
      SELECT city, areas FROM city_areas 
      WHERE country = ${country} AND state = ${state} AND city IN ${db(cities)}
    `;
    
    const data: Record<string, string[]> = {};
    results.forEach(row => {
      data[row.city] = JSON.parse(row.areas);
    });
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function saveBulkCityAreasAction(country: string, state: string, cityAreas: { city: string, areas: string[] }[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    if (cityAreas.length === 0) return { success: true };

    // Collect all rows to insert
    const rows = cityAreas.map(item => ({
      country,
      state,
      city: item.city,
      areas: JSON.stringify(item.areas),
      last_updated: new Date()
    }));

    await db`
      INSERT INTO city_areas ${db(rows)}
      ON CONFLICT (country, state, city) 
      DO UPDATE SET 
        areas = EXCLUDED.areas, 
        last_updated = EXCLUDED.last_updated
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function saveKeywordHistoryAction(
  name: string,
  niche: string,
  location: string,
  keywords: string[],
  totalKeywords?: number,
  truncated?: boolean
) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const total = totalKeywords ?? keywords.length;
    const isTruncated = truncated ?? false;
    await db`
      INSERT INTO keyword_history (user_id, name, niche, location, keywords, total_keywords, keywords_truncated)
      VALUES (${session.id}, ${name}, ${niche}, ${location}, ${JSON.stringify(keywords)}, ${total}, ${isTruncated})
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getKeywordHistoryAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`SELECT * FROM keyword_history WHERE user_id = ${session.id} ORDER BY created_at DESC LIMIT 50`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteKeywordHistoryAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`DELETE FROM keyword_history WHERE id = ${id} AND user_id = ${session.id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getDatabaseStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const totalLeads = await db`SELECT COUNT(*) as count FROM leads`;
    const totalTasks = await db`SELECT COUNT(*) as count FROM tasks`;
    const totalSearches = await db`SELECT COUNT(*) as count FROM searches`;
    const totalHistory = await db`SELECT COUNT(*) as count FROM keyword_history`;
    
    // Postgres size
    const size = await db`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;

    return { 
      success: true, 
      data: { 
        totalLeads: Number(totalLeads[0].count), 
        totalTasks: Number(totalTasks[0].count), 
        totalSearches: Number(totalSearches[0].count),
        totalHistory: Number(totalHistory[0].count),
        dbSize: size[0].size
      } 
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function purgeCacheAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
      // Delete task-lead entries for tasks that don't exist anymore
      await db`DELETE FROM task_leads WHERE task_id NOT IN (SELECT id FROM tasks)`;
      
      // Delete leads not associated with any task
      await db`DELETE FROM leads WHERE id NOT IN (SELECT lead_id FROM task_leads)`;
      
      // Delete searches not associated with any task
      await db`DELETE FROM searches WHERE task_id IS NULL`;
      
      return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function wipeAllLeadsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
      await db`DELETE FROM task_leads`;
      await db`DELETE FROM leads`;
      await db`DELETE FROM searches`;
      await db`DELETE FROM tasks`;
      return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function wipeAllHistoryAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`DELETE FROM keyword_history`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSettingsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`SELECT * FROM settings WHERE user_id = ${session.id}`;
    const settings: Record<string, any> = {};
    results.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSettingAction(key: string, value: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const serializedValue = JSON.stringify(value);
    await db`
      INSERT INTO settings (user_id, key, value) VALUES (${session.id}, ${key}, ${serializedValue})
      ON CONFLICT (user_id, key) DO UPDATE SET value = ${serializedValue}
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getProxiesAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const results = await db`SELECT * FROM proxies WHERE user_id = ${session.id} ORDER BY created_at DESC`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function addProxyAction(proxy: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`
      INSERT INTO proxies (user_id, host, port, username, password, protocol, is_active)
      VALUES (${session.id}, ${proxy.host}, ${proxy.port}, ${proxy.username || null}, ${proxy.password || null}, ${proxy.protocol || 'http'}, ${proxy.is_active !== undefined ? (proxy.is_active ? 1 : 0) : 1})
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteProxyAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`DELETE FROM proxies WHERE id = ${id} AND user_id = ${session.id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleProxyAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db`UPDATE proxies SET is_active = ${isActive ? 1 : 0} WHERE id = ${id} AND user_id = ${session.id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
// --- Admin Actions ---

export async function getAdminDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const usersCount = await db`SELECT COUNT(*) as count FROM users`;
    const suspendedCount = await db`SELECT COUNT(*) as count FROM users WHERE is_suspended = TRUE`;
    const runningTasks = await db`SELECT COUNT(*) as count FROM tasks WHERE status = 'running'`;
    const leadsSum = await db`SELECT SUM(leads_extracted) as sum FROM users`;
    const tasksCount = await db`SELECT COUNT(*) as count FROM tasks`;
    const searchesCount = await db`SELECT COUNT(*) as count FROM searches`;

    const stats = {
      users: usersCount[0].count,
      suspended: suspendedCount[0].count,
      leads: leadsSum[0].sum || 0,
      tasks: tasksCount[0].count,
      runningTasks: runningTasks[0].count,
      searches: searchesCount[0].count,
    };

    const recentLogs = await db`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `;

    return { success: true, data: { stats, recentLogs } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAdminChartDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const leadsGrowth = await db`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM searches
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    const activityStats = await db`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM audit_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    return { success: true, data: { leadsGrowth, activityStats } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllUsersAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const users = await db`
      SELECT id, name, email, is_admin, is_suspended, plan_type, leads_extracted, bonus_credits, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleUserAdminAction(userId: number, isAdmin: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    await db`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`;
    await logAction('admin_status_changed', 'info', { userId, isAdmin });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateUserCreditsAction(userId: number, amount: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const users = await db`SELECT bonus_credits FROM users WHERE id = ${userId}`;
    const currentBonus = users[0]?.bonus_credits || 0;
    const newBonus = Math.max(0, currentBonus + amount);

    await db`UPDATE users SET bonus_credits = ${newBonus} WHERE id = ${userId}`;
    await logAction('update_user_credits', 'info', { target_user_id: userId, amount, new_total: newBonus });
    return { success: true, newTotal: newBonus };
  } catch (error: any) {
    return { success: false, error: (error as Error).message };
  }
}

export async function suspendUserAction(userId: number, isSuspended: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    await db`UPDATE users SET is_suspended = ${isSuspended} WHERE id = ${userId}`;
    await logAction('user_suspension_changed', 'info', { userId, isSuspended });
    if (isSuspended) {
      await db`UPDATE tasks SET status = 'paused' WHERE user_id = ${userId} AND status = 'running'`;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAdminTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const results = await db`
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.updated_at DESC
      LIMIT 200
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTaskStatusAdminAction(taskId: number, status: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    await db`UPDATE tasks SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
    await logAction('admin_task_status_changed', 'info', { taskId, status });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAdminInsightsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    const planBreakdown = await db`
      SELECT plan_type, COUNT(*) as count
      FROM users
      GROUP BY plan_type
    `;

    const taskStatusBreakdown = await db`
      SELECT status, COUNT(*) as count
      FROM tasks
      GROUP BY status
    `;

    const topUsers = await db`
      SELECT id, name, email, plan_type, leads_extracted, bonus_credits
      FROM users
      ORDER BY leads_extracted DESC NULLS LAST
      LIMIT 5
    `;

    const recentSignups = await db`
      SELECT id, name, email, plan_type, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return { 
      success: true, 
      data: { planBreakdown, taskStatusBreakdown, topUsers, recentSignups } 
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function bulkUpdateTasksAdminAction(mode: "pause_running" | "resume_paused") {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  
  const userCheck = await db`SELECT is_admin FROM users WHERE id = ${session.id}`;
  if (!userCheck[0]?.is_admin) return { success: false, error: 'Forbidden' };

  try {
    if (mode === "pause_running") {
      const result = await db`
        UPDATE tasks
        SET status = 'paused', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'running'
      `;
      await logAction('admin_bulk_task_pause', 'info', { mode });
      return { success: true, count: result.count };
    }

    const result = await db`
      UPDATE tasks
      SET status = 'running', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'paused'
        AND user_id IN (
          SELECT id FROM users
          WHERE is_suspended = FALSE
            AND (
              plan_type = 'premium'
              OR leads_extracted < (CASE 
                WHEN plan_type = 'pro' THEN 5000
                ELSE 500
              END) + COALESCE(bonus_credits, 0)
            )
        )
    `;
    await logAction('admin_bulk_task_resume', 'info', { mode });
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
export async function generateKeywordsAction(niche: string, country: string, state: string, city: string | null, selectAllCities: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const niches = niche.split(',').map(n => n.trim()).filter(n => n.length > 0);
    let generated: string[] = [];

    if (selectAllCities && country === 'India') {
      const statesCheck = await db`SELECT id FROM users WHERE id = ${session.id}`; // dummy check
      
      const resCities = await fetch(`https://nominatim.openstreetmap.org/search?state=${encodeURIComponent(state)}&country=India&format=json&featuretype=city`, {
          headers: { 'User-Agent': 'LeadSpotter/1.0' }
      });
      const cityData = await resCities.json();
      const cityNames = Array.from(new Set(cityData.map((c: any) => c.name || c.display_name.split(',')[0]))) as string[];

      const bulkCache = await getBulkCityAreasAction(country, state, cityNames);
      const cachedData: Record<string, string[]> = (bulkCache.success && bulkCache.data) ? bulkCache.data : {};
      
      for (const cityName of cityNames) {
        let areas = cachedData[cityName];
        if (!areas) {
          try {
            const res = await fetch(`https://api.postalpincode.in/postoffice/${cityName}`);
            const data = await res.json();
            if (data && data[0] && data[0].Status === "Success") {
              areas = data[0].PostOffice.map((po: any) => po.Name);
              areas = Array.from(new Set(areas)) as string[];
              await saveCityAreasAction(country, state, cityName, areas);
            }
          } catch (e) {}
        }
        
        if (areas) {
          for (const nicheItem of niches) {
            generated.push(...areas.map(area => `${nicheItem} in ${area}, ${cityName}, ${state}, ${country}`));
          }
        } else {
           for (const nicheItem of niches) {
            generated.push(`${nicheItem} in ${cityName}, ${state}, ${country}`);
          }
        }
      }
    } else if (country === 'India' && city) {
      const cache = await getCityAreasAction(country, state, city);
      let areas = cache.success ? cache.data : null;
      
      if (!areas) {
        try {
          const res = await fetch(`https://api.postalpincode.in/postoffice/${city}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            areas = data[0].PostOffice.map((po: any) => po.Name);
            areas = Array.from(new Set(areas)) as string[];
            await saveCityAreasAction(country, state, city, areas);
          }
        } catch (e) {}
      }

      if (areas) {
        for (const nicheItem of niches) {
          generated.push(...areas.map(area => `${nicheItem} in ${area}, ${city}, ${state}, ${country}`));
        }
      } else {
        for (const nicheItem of niches) {
          generated.push(`${nicheItem} in ${city}, ${state}, ${country}`);
        }
      }
    } else {
      // Basic fallback
      const location = city ? `${city}, ${state}, ${country}` : `${state}, ${country}`;
      for (const nicheItem of niches) {
        generated.push(`${nicheItem} in ${location}`);
      }
    }

    return { success: true, data: generated };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function triggerTaskAutomationAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const task = await db`SELECT status FROM tasks WHERE id = ${taskId} AND user_id = ${session.id}`;
    if (!task[0]) return { success: false, error: 'Task not found' };
    
    // Trigger the recursive worker via internal API call (non-blocking)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const url = `${protocol}://${host}/api/automation/run`;

    // We don't await this to let it run in background
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, userId: session.id }),
    }).catch(e => console.error('Background trigger failed:', e));

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function processTaskStepAction(taskId: number, userId: number) {
  // This is the internal worker that processes ONE keyword
  try {
    const tasks = await db`SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId}`;
    const task = tasks[0];
    if (!task || task.status !== 'running') return { success: false, error: 'Task not running or not found' };

    const keywords = JSON.parse(task.keywords);
    const index = task.current_keyword_index || 0;

    if (index >= keywords.length) {
      await db`UPDATE tasks SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
      return { success: true, completed: true };
    }

    const keyword = keywords[index];
    
    // Pass stored headers and userId to extractor
    const options = {
      userAgent: task.user_agent || undefined,
      acceptLanguage: task.accept_language || undefined,
      manualUserId: userId
    };

    await saveServerLogAction(taskId, 'INFO', `Preparing to search keyword: "${keyword}"`);
    const res = await searchLeadsAction(keyword, taskId, true, options); // forceStore = true
    await saveServerLogAction(taskId, res.success ? 'SUCCESS' : 'ERROR', `searchLeadsAction result: success=${res.success}, count=${'count' in res ? res.count : 0}`);
    
    if (!res.success) {
        console.error(`Task ${taskId} step failed:`, res.error);
        if (res.limitReached) {
            await db`UPDATE tasks SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
            return { success: false, limitReached: true };
        }
        // If it failed for other reasons, maybe don't stop but log it.
        // For now, let's stop to avoid fake progress if it's unauthorized or something critical.
        await db`UPDATE tasks SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
        await saveServerLogAction(taskId, 'ERROR', `Task failed: ${res.error}`);
        await sendLogsToTelegramAction(taskId);
        return { success: false, error: res.error };
    }

    const nextIndex = index + 1;
    await db`UPDATE tasks SET current_keyword_index = ${nextIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;

    // Check if we should send logs periodically (every 1 minute for testing)
    const taskStatusRes = await db`SELECT last_logs_sent_at FROM tasks WHERE id = ${taskId}`;
    const lastSent = taskStatusRes[0]?.last_logs_sent_at ? new Date(taskStatusRes[0].last_logs_sent_at) : new Date(0);
    const now = new Date();
    
    if (now.getTime() - lastSent.getTime() > 60 * 1000) { // 1 minute
        await sendLogsToTelegramAction(taskId);
        await db`UPDATE tasks SET last_logs_sent_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
        await saveServerLogAction(taskId, 'INFO', 'Periodic logs sent to Telegram');
    }

    if (nextIndex < keywords.length) {
        // Trigger next step
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.VERCEL_URL || 'localhost:3000';
        fetch(`${protocol}://${host}/api/automation/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, userId }),
        }).catch(e => console.error('Next step trigger failed:', e));
    } else {
        await db`UPDATE tasks SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
        await saveServerLogAction(taskId, 'SUCCESS', 'Task completed');
        await sendLogsToTelegramAction(taskId);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error processing task ${taskId} at step:`, error);
    await db`UPDATE tasks SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
    await saveServerLogAction(taskId, 'ERROR', `Task crashed: ${(error as Error).message}`);
    await sendLogsToTelegramAction(taskId);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveServerLogAction(taskId: number | null, level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string) {
  try {
    await db`
      INSERT INTO server_logs (task_id, level, message)
      VALUES (${taskId}, ${level}, ${message})
    `;
    console.log(`[LOG][${level}][Task:${taskId}] ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save server log:', error);
    return { success: false };
  }
}

export async function sendLogsToTelegramAction(taskId: number) {
  try {
    // This is an internal function used by worker, but making it an action for flexibility
    const logs = await db`
      SELECT level, message, created_at 
      FROM server_logs 
      WHERE task_id = ${taskId} 
      ORDER BY created_at ASC
    `;

    if (logs.length === 0) return { success: true, message: 'No logs to send' };

    const logContent = logs.map(l => `[${l.created_at.toISOString()}] [${l.level}] ${l.message}`).join('\n');
    
    // We'll use the existing Telegram logic
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return { success: false, error: 'Telegram not configured' };

    const taskData = await db`SELECT name FROM tasks WHERE id = ${taskId}`;
    const taskName = taskData[0]?.name || `Task ${taskId}`;

    // Telegram Document API requires a file name
    const form = new FormData();
    form.append('chat_id', chatId);
    const logBlob = new Blob([logContent], { type: 'text/plain' });
    form.append('document', logBlob, `${taskName.replace(/\s+/g, '_')}_logs.txt`);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form
    });

    const data = await res.json();
    if (!data.ok) return { success: false, error: data.description };

    // Delete logs older than 1 minute to keep DB clean (testing)
    await db`DELETE FROM server_logs WHERE created_at < NOW() - INTERVAL '15 minute'`;

    return { success: true };
  } catch (error) {
    console.error('Failed to send logs to Telegram:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Helper to cleanup old logs
export async function cleanupServerLogsAction() {
  try {
    await db`DELETE FROM server_logs WHERE created_at < NOW() - INTERVAL '1 minute'`;
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
