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
            // Check if we should send periodic logs
            const lastSent = task.last_logs_sent_at ? new Date(task.last_logs_sent_at) : new Date(0);
            const now = new Date();
            if (now.getTime() - lastSent.getTime() > 2 * 60 * 1000) { // Every 2 mins
                await (0, worker_logic_1.sendLogsToTelegram)(taskId);
                await (0, db_1.db) `UPDATE tasks SET last_logs_sent_at = CURRENT_TIMESTAMP WHERE id = ${taskId}`;
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
app.listen(port, () => {
    console.log(`LeadSpotter Worker listening at http://localhost:${port}`);
});
