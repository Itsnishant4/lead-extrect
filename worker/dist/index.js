"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./lib/db");
const worker_logic_1 = require("./lib/worker-logic");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Track active tasks in this process to avoid duplicate loops
const activeTasks = new Set();
// Auth middleware for the worker
const workerAuth = (req, res, next) => {
    const token = req.headers['x-worker-token'];
    if (!process.env.WORKER_AUTH_TOKEN || token === process.env.WORKER_AUTH_TOKEN) {
        next();
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Worker is running ' });
});
app.post('/run-task', workerAuth, async (req, res) => {
    const { taskId, userId } = req.body;
    if (!taskId || !userId) {
        return res.status(400).json({ error: 'Missing taskId or userId' });
    }
    // Return immediately to Next.js
    res.json({ success: true, message: 'Task processing started' });
    // Start the background loop
    if (!activeTasks.has(taskId)) {
        processTask(taskId, userId).catch(err => {
            console.error(`Fatal error in task ${taskId}:`, err);
        });
    }
    else {
        console.log(`[WORKER] Task ${taskId} already running in this process.`);
    }
});
async function processTask(taskId, userId) {
    if (activeTasks.has(taskId))
        return;
    activeTasks.add(taskId);
    try {
        console.log(`[WORKER] Starting loop for task ${taskId}`);
        while (true) {
            // ... (rest of the loop content remains same)
            // 1. Refresh task state
            const tasks = await (0, db_1.db) `SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId}`;
            const task = tasks[0];
            if (!task) {
                console.error(`[WORKER] Task ${taskId} not found`);
                break;
            }
            if (task.status !== 'running') {
                console.log(`[WORKER] Task ${taskId} is ${task.status}. Stopping loop.`);
                break;
            }
            const keywords = JSON.parse(task.keywords);
            const index = task.current_keyword_index || 0;
            if (index >= keywords.length) {
                // Final Export of any details
                try {
                    const finalTaskState = await (0, db_1.db) `SELECT total_leads, exported_leads_count FROM tasks WHERE id = ${taskId}`;
                    const total = finalTaskState[0]?.total_leads || 0;
                    const exported = finalTaskState[0]?.exported_leads_count || 0;
                    if (total > exported) {
                        const remainingLeads = await (0, db_1.db) `
                            SELECT l.* 
                            FROM leads l 
                            JOIN task_leads tl ON l.id = tl.lead_id 
                            WHERE tl.task_id = ${taskId}
                            ORDER BY l.created_at ASC
                            OFFSET ${exported}
                        `;
                        if (remainingLeads.length > 0) {
                            console.log(`[WORKER] Performing final export for task ${taskId} (${remainingLeads.length} leads)`);
                            await (0, worker_logic_1.uploadExportChunk)(taskId, remainingLeads);
                        }
                    }
                }
                catch (e) {
                    console.error(`[WORKER] Final export failed for task ${taskId}:`, e);
                }
                await (0, db_1.db) `UPDATE tasks SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
                await (0, worker_logic_1.saveServerLog)(taskId, 'SUCCESS', 'Task completed');
                await (0, worker_logic_1.sendLogsToTelegram)(taskId);
                console.log(`[WORKER] Task ${taskId} completed.`);
                break;
            }
            const keyword = keywords[index];
            const options = {
                userAgent: task.user_agent || undefined,
                acceptLanguage: task.accept_language || undefined
            };
            // 2. Process one keyword with a 2-minute timeout
            console.log(`[WORKER] Processing keyword "${keyword}" (Index: ${index})`);
            const stepTimeout = 2 * 60 * 1000; // 2 minutes
            try {
                const result = await Promise.race([
                    (0, worker_logic_1.searchLeadsInternal)(keyword, userId, taskId, options),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Step timeout reached (2 minutes)')), stepTimeout))
                ]);
                if (!result.success) {
                    console.error(`[WORKER] Task ${taskId} failed at index ${index}:`, result.error);
                    if (result.limitReached) {
                        await (0, db_1.db) `UPDATE tasks SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
                        await (0, worker_logic_1.saveServerLog)(taskId, 'WARN', 'Task paused due to limit reached');
                    }
                    else {
                        await (0, db_1.db) `UPDATE tasks SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
                        await (0, worker_logic_1.saveServerLog)(taskId, 'ERROR', `Task failed: ${result.error}`);
                    }
                    await (0, worker_logic_1.sendLogsToTelegram)(taskId);
                    break;
                }
            }
            catch (err) {
                console.error(`[WORKER] Timeout or error in task ${taskId} at index ${index}:`, err.message);
                await (0, worker_logic_1.saveServerLog)(taskId, 'ERROR', `Step timeout or error: ${err.message}`);
                // On timeout, we mark the task as 'paused' or 'failed'. 
                // The user asked for "automatic restart". 
                // A better approach for "restart" is to increment the index anyway and continue, 
                // effectively skipping the stuck keyword.
                const nextIndex = index + 1;
                await (0, db_1.db) `UPDATE tasks SET current_keyword_index = ${nextIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
                await (0, worker_logic_1.saveServerLog)(taskId, 'INFO', `Skipping stuck keyword and moving to next index: ${nextIndex}`);
                continue; // Continue the while loop
            }
            // 3. Increment index and continue
            const nextIndex = index + 1;
            await (0, db_1.db) `UPDATE tasks SET current_keyword_index = ${nextIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
            // --- EXPORT LOGIC (Every 2 Keywords) ---
            try {
                // User Request: Export every 2 keywords to avoid too many small CSVs
                // Check if we just finished an even number of keywords (2, 4, 6...)
                if (nextIndex > 0 && nextIndex % 2 === 0) {
                    const currentTaskState = await (0, db_1.db) `SELECT total_leads, exported_leads_count, export_file_ids FROM tasks WHERE id = ${taskId}`;
                    if (currentTaskState[0]) {
                        const totalLeads = currentTaskState[0].total_leads || 0;
                        const exportedCount = currentTaskState[0].exported_leads_count || 0;
                        const unexported = totalLeads - exportedCount;
                        console.log(`[WORKER] Task ${taskId} Keyword Check: Processed ${nextIndex} keywords. Unexported leads: ${unexported}`);
                        if (unexported > 0) {
                            console.log(`[WORKER] Triggering export for ${unexported} leads (Batch of 2 keywords completed)...`);
                            const leadsToExport = await (0, db_1.db) `
                                SELECT l.* 
                                FROM leads l 
                                JOIN task_leads tl ON l.id = tl.lead_id 
                                WHERE tl.task_id = ${taskId}
                                ORDER BY l.created_at ASC
                                OFFSET ${exportedCount}
                            `;
                            if (leadsToExport.length > 0) {
                                await (0, worker_logic_1.uploadExportChunk)(taskId, leadsToExport);
                            }
                        }
                    }
                }
            }
            catch (e) {
                console.error(`[WORKER] Export chunk failed for task ${taskId}:`, e);
            }
            // --------------------
            // --------------------
            // Check if we should send periodic logs
            // Logic: Send logs only if > 1 hour has passed since last *successful* send.
            let lastSent = task.last_logs_sent_at ? new Date(task.last_logs_sent_at) : null;
            const now = new Date();
            // If never sent, mark current time as start (don't send immediately on first run, wait 1 hour)
            if (!lastSent) {
                await (0, db_1.db) `UPDATE tasks SET last_logs_sent_at = ${now} WHERE id = ${taskId}`;
                lastSent = now;
            }
            if (now.getTime() - lastSent.getTime() > 60 * 60 * 1000) { // Every 1 hour
                console.log(`[WORKER] Sending hourly logs for task ${taskId}...`);
                await (0, worker_logic_1.sendLogsToTelegram)(taskId);
                await (0, db_1.db) `UPDATE tasks SET last_logs_sent_at = ${new Date()} WHERE id = ${taskId}`;
            }
            console.log(`[WORKER] Task ${taskId} progress: ${nextIndex}/${keywords.length}`);
            // Small delay between keywords to avoid rate limits
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    finally {
        activeTasks.delete(taskId);
        console.log(`[WORKER] Task ${taskId} removed from active tracking.`);
    }
}
// Watchdog: Every 2 minutes, check for stuck 'running' tasks and resume them
setInterval(async () => {
    try {
        // Find tasks marked 'running' that haven't been updated for 5 minutes
        const stuckTasks = await (0, db_1.db) `
            SELECT id, user_id FROM tasks 
            WHERE status = 'running' 
            AND updated_at < NOW() - INTERVAL '5 minutes'
        `;
        for (const task of stuckTasks) {
            if (!activeTasks.has(task.id)) {
                console.log(`[WATCHDOG] Resuming stalled task ${task.id}`);
                processTask(task.id, task.user_id).catch(e => console.error(`Watchdog resumption failed for ${task.id}:`, e));
            }
        }
    }
    catch (e) {
        console.error('[WATCHDOG] Error checking for stuck tasks:', e);
    }
}, 2 * 60 * 1000);
// Start Server
const PORT = process.env.PORT || 4001;
// Ensure schema on startup
// Ensure schema on startup
(0, worker_logic_1.ensureWorkerSchema)().then(async () => {
    // Resume interrupted tasks on startup
    try {
        const interruptedTasks = await (0, db_1.db) `SELECT id, user_id FROM tasks WHERE status = 'running'`;
        if (interruptedTasks.length > 0) {
            console.log(`[WORKER] Found ${interruptedTasks.length} interrupted tasks. Resuming...`);
            for (const task of interruptedTasks) {
                processTask(task.id, task.user_id).catch(e => console.error(`Failed to resume task ${task.id}:`, e));
            }
        }
    }
    catch (e) {
        console.error('[WORKER] Failed to resume interrupted tasks:', e);
    }
    app.listen(PORT, () => {
        console.log(`LeadSpotter Worker listening at http://localhost:${PORT}`);
    });
});
