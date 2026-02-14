"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveServerLog = saveServerLog;
exports.sendLogsToTelegram = sendLogsToTelegram;
exports.searchLeadsInternal = searchLeadsInternal;
exports.uploadExportChunk = uploadExportChunk;
exports.ensureWorkerSchema = ensureWorkerSchema;
const db_1 = require("./db");
const extractor_1 = require("./extractor");
const enricher_1 = require("./enricher");
const node_fetch_1 = __importDefault(require("node-fetch"));
const formdata_node_1 = require("formdata-node");
const getTs = () => `[${new Date().toLocaleTimeString('en-GB')}]`;
async function saveServerLog(taskId, level, message) {
    try {
        await (0, db_1.db) `
      INSERT INTO server_logs (task_id, level, message)
      VALUES (${taskId}, ${level}, ${message})
    `;
        console.log(`${getTs()} [LOG][${level}][Task:${taskId}] ${message}`);
    }
    catch (error) {
        console.error(`${getTs()} Failed to save server log:`, error);
    }
}
async function sendLogsToTelegram(taskId) {
    try {
        const logs = await (0, db_1.db) `
      SELECT level, message, created_at 
      FROM server_logs 
      WHERE task_id = ${taskId} 
      ORDER BY created_at ASC
    `;
        if (logs.length === 0)
            return;
        const logContent = logs.map(l => `[${l.created_at.toISOString()}] [${l.level}] ${l.message}`).join('\n');
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!token || !chatId)
            return;
        const taskData = await (0, db_1.db) `SELECT name FROM tasks WHERE id = ${taskId}`;
        const taskName = taskData[0]?.name || `Task ${taskId}`;
        const form = new formdata_node_1.FormData();
        form.append('chat_id', chatId);
        const logBlob = new formdata_node_1.Blob([logContent], { type: 'text/plain' });
        form.append('document', logBlob, `${taskName.replace(/\s+/g, '_')}_logs.txt`);
        const res = await (0, node_fetch_1.default)(`https://api.telegram.org/bot${token}/sendDocument`, {
            method: 'POST',
            // @ts-ignore
            body: form
        });
        const data = await res.json();
        if (data.ok) {
            // Delete ALL logs for this task as they have been sent.
            await (0, db_1.db) `DELETE FROM server_logs WHERE task_id = ${taskId}`;
        }
    }
    catch (error) {
        console.error('Failed to send logs to Telegram:', error);
    }
}
const limits = {
    'free': 500,
    'pro': 5000,
    'premium': Infinity
};
const computeLimit = (userRow) => {
    const baseLimit = limits[userRow?.plan_type || 'free'] ?? 500;
    const bonusCredits = userRow?.bonus_credits || 0;
    const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits;
    const used = userRow?.leads_extracted || 0;
    const remaining = currentLimit === Infinity ? Infinity : Math.max(currentLimit - used, 0);
    return { baseLimit, bonusCredits, currentLimit, used, remaining };
};
const computeLeadScore = (lead) => {
    let score = 0;
    if (lead.rating)
        score += Math.min(Math.round(Number(lead.rating) * 10), 50);
    if (lead.reviewsCount)
        score += Math.min(Math.round(Number(lead.reviewsCount) / 10), 30);
    if (lead.email || lead.website_email)
        score += 10;
    if (lead.phone || lead.website_phone)
        score += 10;
    if (lead.website)
        score += 5;
    return Math.min(score, 100);
};
const getLeadKey = (lead) => {
    const placeId = (lead.placeId || lead.place_id || '').toString().trim();
    if (placeId)
        return `pid:${placeId}`;
    const name = (lead.name || '').toString().trim().toLowerCase();
    const address = (lead.address || '').toString().trim().toLowerCase();
    const phone = (lead.phone || '').toString().trim();
    const website = (lead.website || '').toString().trim().toLowerCase();
    return `fb:${name}|${address}|${phone}|${website}`;
};
const BLOCKED_CATEGORIES = [
    'Housing society',
    'Apartment building',
    'Condominium complex',
    'Housing complex',
    'Residents association',
    'Gated community',
    'Tea store',
    'Coffee shop',
    'Flour mill',
    'Private User',
    'Transit station',
    'Public toilet',
    'Park',
    'Garden',
    'Playground',
    'Hostel',
    'Dormitory',
    'Paying guest',
    'Lodging',
    'Cottage',
    'Villa',
    'Resort',
    'Homestay',
    'Guest house',
    'School',
    'College',
    'University',
    'Library'
];
const IT_BLOCKED_CATEGORIES = [
    'Manufacturer',
    'Wholesaler',
    'Supplier',
    'Store',
    'Shop',
    'Factory',
    'Mill',
    'Industrial',
    'Plant',
    'Agency', // Be careful, Web Agency is valid. Handled in validateLead.
    'Consultant', // Computer Consultant is valid. 
    'Travel',
    'Transport',
    'Logistics',
    'Real estate',
    'Broker',
    'Gym',
    'Fitness',
    'Hospital',
    'Clinic',
    'Doctor',
    'Pharmacy',
    'Restaurant',
    'Hotel',
    'Cafe',
    'Bakery',
    'Food',
    'Beverage',
    'Clothing',
    'Textile',
    'Fashion',
    'Jewelry',
    'Furniture',
    'Hardware',
    'Construction',
    'Contractor',
    'Interior',
    'Automobile',
    'Car',
    'Bike',
    'Garage',
    'Repair',
    'Salon',
    'Spa',
    'Beauty',
    'Makeup'
];
function validateLead(lead, query) {
    if (!lead.category)
        return true;
    const lowerCat = lead.category.toLowerCase();
    const lowerQuery = query.toLowerCase();
    // 1. Global Blocklist Check (Always blocked)
    if (BLOCKED_CATEGORIES.some(c => lowerCat.includes(c.toLowerCase()))) {
        return false;
    }
    // 2. Intent-Based Strict Filtering
    const isITIntent = ['it company', 'software', 'web', 'digital', 'tech', 'app dev', 'cyber'].some(k => lowerQuery.includes(k));
    if (isITIntent) {
        // Allow list overrides Blocklist
        const isWhitelisted = ['computer', 'software', 'technology', 'web', 'digital', 'marketing', 'advertising', 'design', 'internet', 'data', 'security', 'cctv'].some(k => lowerCat.includes(k));
        if (isWhitelisted)
            return true;
        // Check IT Specific Blocks
        if (IT_BLOCKED_CATEGORIES.some(c => lowerCat.includes(c.toLowerCase()))) {
            // Exception for "Agency" and "Consultant" and "Store" if related to IT
            if (lowerCat.includes('agency') && (lowerCat.includes('web') || lowerCat.includes('digital') || lowerCat.includes('marketing') || lowerCat.includes('advertising') || lowerCat.includes('creative')))
                return true;
            if (lowerCat.includes('consultant') && (lowerCat.includes('computer') || lowerCat.includes('it') || lowerCat.includes('software')))
                return true;
            if (lowerCat.includes('store') && (lowerCat.includes('computer') || lowerCat.includes('mobile') || lowerCat.includes('electronic')))
                return true; // Allow Computer Store
            if (lowerCat.includes('shop') && (lowerCat.includes('computer') || lowerCat.includes('mobile')))
                return true;
            if (lowerCat.includes('repair') && (lowerCat.includes('computer') || lowerCat.includes('laptop') || lowerCat.includes('mobile')))
                return true;
            return false;
        }
    }
    return true;
}
async function searchLeadsInternal(query, userId, taskId, options) {
    const totalStartTime = Date.now();
    try {
        const users = await (0, db_1.db) `SELECT plan_type, leads_extracted, bonus_credits FROM users WHERE id = ${userId}`;
        const user = users[0];
        if (!user)
            return { success: false, error: 'User not found' };
        const { currentLimit, remaining } = computeLimit(user);
        if (currentLimit !== Infinity && remaining <= 0) {
            return { success: false, error: 'Limit reached', limitReached: true };
        }
        const trimmedQuery = query.trim();
        let lat;
        let lng;
        const pincodeMatch = trimmedQuery.match(/\b(\d{6})\b/);
        if (pincodeMatch) {
            const pincode = pincodeMatch[1];
            const cachedCoords = await (0, db_1.db) `SELECT latitude, longitude FROM pincode_coords WHERE country = 'India' AND pincode = ${pincode}`;
            if (cachedCoords[0]) {
                lat = cachedCoords[0].latitude;
                lng = cachedCoords[0].longitude;
            }
            else {
                try {
                    const geoRes = await (0, node_fetch_1.default)(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`, {
                        headers: { 'User-Agent': 'LeadSpotter/1.0' }
                    });
                    const geoData = await geoRes.json();
                    if (geoData && geoData[0]) {
                        lat = parseFloat(geoData[0].lat);
                        lng = parseFloat(geoData[0].lon);
                        await (0, db_1.db) `INSERT INTO pincode_coords (country, pincode, latitude, longitude) VALUES ('India', ${pincode}, ${lat}, ${lng}) ON CONFLICT DO NOTHING`;
                    }
                }
                catch (e) { }
            }
        }
        await saveServerLog(taskId || null, 'INFO', `Extraction started for: "${query}"`);
        const heartbeat = async (leadsFound) => {
            if (taskId) {
                try {
                    await (0, db_1.db) `UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
                    console.log(`${getTs()} [HEARTBEAT][Task:${taskId}] Extraction in progress. Leads found: ${leadsFound}`);
                }
                catch (e) {
                    console.error(`${getTs()} Heartbeat update failed:`, e);
                }
            }
        };
        const rawLeads = await (0, extractor_1.fetchLeads)(query, lat, lng, {
            ...options,
            onProgress: (count) => {
                heartbeat(count).catch(e => console.error(e));
                if (options?.onProgress)
                    options.onProgress(count);
            }
        });
        // --- FILTERING STEP ---
        const validRawLeads = rawLeads.filter(lead => validateLead(lead, trimmedQuery));
        const filteredCount = rawLeads.length - validRawLeads.length;
        if (filteredCount > 0) {
            console.log(`${getTs()} [WORKER][Task:${taskId}] Filtered out ${filteredCount} irrelevant leads.`);
            await saveServerLog(taskId || null, 'INFO', `Filtered out ${filteredCount} irrelevant leads (e.g. Housing societies).`);
        }
        // ----------------------
        console.log(`${getTs()} [WORKER][Task:${taskId}] Starting enrichment for ${validRawLeads.length} leads...`);
        const enrichmentStartTime = Date.now();
        const enrichedLeads = await Promise.all(validRawLeads.map(async (lead) => {
            if (lead.website) {
                const enrichment = await (0, enricher_1.enrichLead)(lead.website);
                return {
                    ...lead,
                    email: lead.email || (enrichment.emails.length > 0 ? enrichment.emails[0] : null),
                    website_email: enrichment.emails.join(', ') || null,
                    website_phone: enrichment.phones.join(', ') || null,
                    socials: { ...lead.socials, ...enrichment.socials }
                };
            }
            return lead;
        }));
        const enrichmentDuration = ((Date.now() - enrichmentStartTime) / 1000).toFixed(2);
        console.log(`${getTs()} [WORKER][Task:${taskId}] Enrichment completed for ${rawLeads.length} leads. (Took ${enrichmentDuration}s)`);
        const dedupeMap = new Map();
        for (const lead of enrichedLeads) {
            const key = getLeadKey(lead);
            if (!dedupeMap.has(key))
                dedupeMap.set(key, lead);
        }
        const uniqueLeads = Array.from(dedupeMap.values());
        const result = await db_1.db.begin(async (tx) => {
            const lockedUsers = await tx `SELECT leads_extracted FROM users WHERE id = ${userId} FOR UPDATE`;
            const lockedUser = lockedUsers[0];
            const { remaining: lockedRemaining } = computeLimit({ ...user, leads_extracted: lockedUser.leads_extracted });
            if (currentLimit !== Infinity && lockedRemaining <= 0) {
                return { success: false, error: 'Limit reached during processing', limitReached: true };
            }
            const allowedCount = currentLimit === Infinity ? uniqueLeads.length : Math.min(uniqueLeads.length, lockedRemaining);
            const leadsToInsert = uniqueLeads.slice(0, allowedCount);
            const searchResult = await tx `INSERT INTO searches (user_id, query, task_id) VALUES (${userId}, ${trimmedQuery}, ${taskId || null}) RETURNING id`;
            const searchId = searchResult[0].id;
            const leadsData = leadsToInsert.map(lead => ({
                search_id: searchId,
                task_id: taskId || null,
                name: lead.name,
                address: lead.address,
                city: lead.city,
                website: lead.website,
                phone: lead.phone,
                email: lead.email,
                rating: lead.rating,
                reviews_count: lead.reviewsCount,
                category: lead.category,
                place_id: lead.placeId,
                latitude: lead.latitude,
                longitude: lead.longitude,
                direction_url: lead.directionUrl,
                monday_hours: lead.hours?.monday || null,
                tuesday_hours: lead.hours?.tuesday || null,
                wednesday_hours: lead.hours?.wednesday || null,
                thursday_hours: lead.hours?.thursday || null,
                friday_hours: lead.hours?.friday || null,
                saturday_hours: lead.hours?.saturday || null,
                sunday_hours: lead.hours?.sunday || null,
                facebook: lead.socials?.facebook || null,
                instagram: lead.socials?.instagram || null,
                linkedin: lead.socials?.linkedin || null,
                twitter: lead.socials?.twitter || null,
                youtube: lead.socials?.youtube || null,
                pinterest: lead.socials?.pinterest || null,
                tiktok: lead.socials?.tiktok || null,
                website_email: lead.website_email || null,
                website_phone: lead.website_phone || null,
                lead_score: computeLeadScore(lead)
            }));
            if (leadsData.length > 0) {
                const insertedLeads = await tx `
                    INSERT INTO leads ${tx(leadsData)}
                    ON CONFLICT (place_id) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id, place_id
                `;
                const taskLeadsData = taskId ? insertedLeads.map((l) => ({
                    task_id: taskId,
                    lead_id: l.id
                })) : [];
                const leadSourcesData = insertedLeads.map((l) => ({
                    lead_id: l.id,
                    search_id: searchId,
                    task_id: taskId || null
                }));
                if (taskLeadsData.length > 0) {
                    await tx `INSERT INTO task_leads ${tx(taskLeadsData)} ON CONFLICT DO NOTHING`;
                }
                await tx `INSERT INTO lead_sources ${tx(leadSourcesData)} ON CONFLICT DO NOTHING`;
            }
            if (taskId) {
                const countRes = await tx `SELECT COUNT(*) as count FROM task_leads WHERE task_id = ${taskId}`;
                await tx `UPDATE tasks SET total_leads = ${countRes[0].count} WHERE id = ${taskId}`;
            }
            await tx `UPDATE users SET leads_extracted = leads_extracted + ${leadsToInsert.length} WHERE id = ${userId}`;
            const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(2);
            console.log(`${getTs()} [WORKER] Finished searchLeadsInternal for "${query}". [Total Duration: ${totalDuration}s]`);
            return { success: true, count: leadsToInsert.length };
        });
        return result;
    }
    catch (error) {
        console.error('Worker internal error:', error);
        return { success: false, error: error.message };
    }
}
async function uploadExportChunk(taskId, leads) {
    if (leads.length === 0)
        return;
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!token || !chatId)
            return;
        const taskData = await (0, db_1.db) `SELECT name, export_file_ids FROM tasks WHERE id = ${taskId}`;
        if (!taskData[0])
            return;
        const taskName = taskData[0].name || `Task ${taskId}`;
        const existingIds = taskData[0].export_file_ids ? JSON.parse(taskData[0].export_file_ids) : [];
        const chunkIndex = existingIds.length + 1;
        // Generate CSV
        const header = [
            "Name", "Category", "Rating", "Reviews",
            "Phone", "Website Phone", "Email", "Website Email",
            "Website", "Address", "City", "Latitude", "Longitude", "Place ID",
            "Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube", "Pinterest", "TikTok",
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ];
        const escapeCsv = (str) => {
            if (str === null || str === undefined)
                return "";
            const stringValue = String(str);
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };
        const csvRows = leads.map(lead => [
            lead.name, lead.category, lead.rating, lead.reviewsCount || lead.reviews_count,
            lead.phone, lead.website_phone, lead.email, lead.website_email,
            lead.website, lead.address, lead.city, lead.latitude, lead.longitude, lead.place_id,
            lead.facebook, lead.instagram, lead.linkedin, lead.twitter, lead.youtube, lead.pinterest, lead.tiktok,
            lead.monday_hours, lead.tuesday_hours, lead.wednesday_hours, lead.thursday_hours, lead.friday_hours, lead.saturday_hours, lead.sunday_hours
        ].map(escapeCsv).join(","));
        // Include headers in every chunk for standalone validity
        const output = [header.join(","), ...csvRows].join("\n");
        const filename = `${taskName.replace(/\s+/g, '_')}_part_${chunkIndex}.csv`;
        const form = new formdata_node_1.FormData();
        form.append('chat_id', chatId);
        const fileBlob = new formdata_node_1.Blob([output], { type: 'text/csv' });
        form.append('document', fileBlob, filename);
        const res = await (0, node_fetch_1.default)(`https://api.telegram.org/bot${token}/sendDocument`, {
            method: 'POST',
            // @ts-ignore
            body: form
        });
        const data = await res.json();
        if (data.ok && data.result?.document?.file_id) {
            const fileId = data.result.document.file_id;
            existingIds.push(fileId);
            await (0, db_1.db) `
                UPDATE tasks 
                SET export_file_ids = ${JSON.stringify(existingIds)}, 
                    exported_leads_count = COALESCE(exported_leads_count, 0) + ${leads.length},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${taskId}
            `;
            console.log(`${getTs()} [WORKER][Task:${taskId}] Exported chunk ${chunkIndex} with ${leads.length} leads to Telegram.`);
        }
        else {
            console.error(`${getTs()} [WORKER][Task:${taskId}] Failed to upload export chunk to Telegram:`, data);
        }
    }
    catch (error) {
        console.error(`${getTs()} [WORKER][Task:${taskId}] Export error:`, error);
    }
}
async function ensureWorkerSchema() {
    try {
        // Fix: Force TIMESTAMPTZ to avoid 5.5hr drift
        try {
            await (0, db_1.db) `ALTER TABLE tasks ALTER COLUMN last_logs_sent_at TYPE TIMESTAMPTZ`;
        }
        catch (e) {
            // Ignore if column doesn't exist yet
        }
        await (0, db_1.db) `
            ALTER TABLE tasks 
            ADD COLUMN IF NOT EXISTS export_file_ids TEXT,
            ADD COLUMN IF NOT EXISTS exported_leads_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_logs_sent_at TIMESTAMPTZ
        `;
        console.log(`${getTs()} [WORKER] Schema verified: export_file_ids/exported_leads_count/last_logs_sent_at exist.`);
    }
    catch (error) {
        console.error(`${getTs()} [WORKER] Failed to verify schema:`, error);
    }
}
