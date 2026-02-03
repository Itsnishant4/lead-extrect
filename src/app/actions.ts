'use server';

import { db, seed } from '@/lib/db/index';
import { fetchLeads } from '@/lib/extractor';
import { Lead } from '@/lib/parser';
import { enrichLead } from '@/lib/enricher';

export async function searchLeadsAction(query: string, taskId?: number) {
  try {
    // Lazy init schema on first search
    await seed();

    const trimmedQuery = query.trim();
    // 1. Check for recent cache (last 30 days) for this exact query
    const existingSearches = await db`
      SELECT id FROM searches 
      WHERE query = ${trimmedQuery} 
      AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const existingSearch = existingSearches[0];

    if (existingSearch) {
      const searchId = existingSearch.id;
      
      // Get leads associated with this search
      const existingLeads = await db`SELECT id, place_id FROM leads WHERE search_id = ${searchId}`;

      if (existingLeads.length > 0) {
        // If this is part of a task, link these existing leads to the current task
        if (taskId) {
            for (const lead of existingLeads) {
                await db`
                    INSERT INTO task_leads (task_id, lead_id) VALUES (${taskId}, ${lead.id})
                    ON CONFLICT DO NOTHING
                `;
            }

            // Update task's lead count
            const countRes = await db`SELECT COUNT(*) as count FROM task_leads WHERE task_id = ${taskId}`;
            await db`UPDATE tasks SET total_leads = ${countRes[0].count} WHERE id = ${taskId}`;
        }

        return { success: true, count: existingLeads.length, searchId, cached: true };
      }
    }

    // 2. CACHE MISS: Create a new search record and fetch from API
    const searchResult = await db`
        INSERT INTO searches (query, task_id) VALUES (${trimmedQuery}, ${taskId || null}) RETURNING id
    `;
    const searchId = searchResult[0].id;

    // 3. Fetch leads from Google Maps
    const rawLeads = await fetchLeads(query);

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

    // 5. Store leads in Postgres
    for (const lead of enrichedLeads) {
        await db`
          INSERT INTO leads 
          (search_id, task_id, name, address, city, website, phone, email, rating, reviews_count, category, place_id, latitude, longitude, direction_url, 
           monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours, saturday_hours, sunday_hours,
           facebook, instagram, linkedin, twitter, youtube, pinterest, tiktok,
           website_email, website_phone)
          VALUES (${searchId}, ${taskId || null}, ${lead.name}, ${lead.address}, ${lead.city}, ${lead.website}, ${lead.phone}, ${lead.email}, ${lead.rating}, ${lead.reviewsCount}, ${lead.category}, ${lead.placeId}, ${lead.latitude}, ${lead.longitude}, ${lead.directionUrl}, 
           ${lead.hours?.monday || null}, ${lead.hours?.tuesday || null}, ${lead.hours?.wednesday || null}, ${lead.hours?.thursday || null}, ${lead.hours?.friday || null}, ${lead.hours?.saturday || null}, ${lead.hours?.sunday || null},
           ${lead.socials?.facebook || null}, ${lead.socials?.instagram || null}, ${lead.socials?.linkedin || null}, ${lead.socials?.twitter || null}, ${lead.socials?.youtube || null}, ${lead.socials?.pinterest || null}, ${lead.socials?.tiktok || null},
           ${lead.website_email || null}, ${lead.website_phone || null})
          ON CONFLICT (place_id) DO NOTHING
        `;

        // Map lead to task in junction table
        if (taskId) {
            const leadRow = await db`SELECT id FROM leads WHERE place_id = ${lead.placeId}`;
            if (leadRow[0]) {
                await db`
                    INSERT INTO task_leads (task_id, lead_id) VALUES (${taskId}, ${leadRow[0].id})
                    ON CONFLICT DO NOTHING
                `;
            }
        }
    }

    // Update task's lead count correctly from the junction table
    if (taskId) {
      const countRes = await db`SELECT COUNT(*) as count FROM task_leads WHERE task_id = ${taskId}`;
      await db`UPDATE tasks SET total_leads = ${countRes[0].count} WHERE id = ${taskId}`;
    }

    return { success: true, count: enrichedLeads.length, searchId, cached: false };
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createTaskAction(name: string, keywords: string[]) {
  try {
    const result = await db`
      INSERT INTO tasks (name, keywords, total_keywords, status) 
      VALUES (${name}, ${JSON.stringify(keywords)}, ${keywords.length}, 'pending')
      RETURNING id
    `;
    
    return { success: true, taskId: Number(result[0].id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTaskStatusAction(taskId: number, status: string, currentIndex?: number) {
  try {
    if (currentIndex !== undefined) {
      await db`
        UPDATE tasks SET status = ${status}, current_keyword_index = ${currentIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}
      `;
    } else {
      await db`
        UPDATE tasks SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}
      `;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTasksAction() {
  try {
    const results = await db`SELECT * FROM tasks ORDER BY created_at DESC`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTaskAction(taskId: number) {
  try {
    const result = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTaskLeadsAction(taskId: number) {
  try {
    const results = await db`
        SELECT l.* 
        FROM leads l 
        JOIN task_leads tl ON l.id = tl.lead_id 
        WHERE tl.task_id = ${taskId} 
        ORDER BY tl.created_at DESC
    `;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLeadsAction(searchId?: number) {
  try {
    let results;
    if (searchId) {
      results = await db`SELECT * FROM leads WHERE search_id = ${searchId} ORDER BY created_at DESC`;
    } else {
      results = await db`SELECT * FROM leads ORDER BY created_at DESC LIMIT 10`;
    }
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTaskAction(taskId: number) {
  try {
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
  try {
    await db`UPDATE tasks SET status = 'paused' WHERE status = 'running'`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getRecentSearchesAction() {
  try {
    const results = await db`SELECT * FROM searches ORDER BY created_at DESC LIMIT 10`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCityAreasAction(country: string, state: string, city: string) {
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

export async function saveKeywordHistoryAction(name: string, niche: string, location: string, keywords: string[]) {
  try {
    await db`
      INSERT INTO keyword_history (name, niche, location, keywords)
      VALUES (${name}, ${niche}, ${location}, ${JSON.stringify(keywords)})
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getKeywordHistoryAction() {
  try {
    const results = await db`SELECT * FROM keyword_history ORDER BY created_at DESC LIMIT 50`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteKeywordHistoryAction(id: number) {
  try {
    await db`DELETE FROM keyword_history WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getDatabaseStatsAction() {
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
  try {
    await db`DELETE FROM keyword_history`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSettingsAction() {
  try {
    // Lazy init
    await seed();

    const results = await db`SELECT * FROM settings`;
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
  try {
    const serializedValue = JSON.stringify(value);
    await db`
      INSERT INTO settings (key, value) VALUES (${key}, ${serializedValue})
      ON CONFLICT (key) DO UPDATE SET value = ${serializedValue}
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getProxiesAction() {
  try {
    const results = await db`SELECT * FROM proxies ORDER BY created_at DESC`;
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function addProxyAction(proxy: any) {
  try {
    await db`
      INSERT INTO proxies (host, port, username, password, protocol, is_active)
      VALUES (${proxy.host}, ${proxy.port}, ${proxy.username || null}, ${proxy.password || null}, ${proxy.protocol || 'http'}, ${proxy.is_active !== undefined ? (proxy.is_active ? 1 : 0) : 1})
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteProxyAction(id: number) {
  try {
    await db`DELETE FROM proxies WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleProxyAction(id: number, isActive: boolean) {
  try {
    await db`UPDATE proxies SET is_active = ${isActive ? 1 : 0} WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}