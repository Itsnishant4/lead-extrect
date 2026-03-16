"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@libsql/client");
var dotenv = require("dotenv");
var path_1 = require("path");
// Load environment variables from .env.local
dotenv.config({ path: (0, path_1.resolve)(process.cwd(), '.env.local') });
var url = process.env.DATABASE_URL;
var authToken = process.env.DATABASE_AUTH_TOKEN;
if (!url) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
}
var db = (0, client_1.createClient)({
    url: url,
    authToken: authToken,
});
var tables = [
    "CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    email TEXT NOT NULL UNIQUE,\n    password TEXT NOT NULL,\n    is_admin INTEGER DEFAULT 0,\n    is_suspended INTEGER DEFAULT 0,\n    plan_type TEXT DEFAULT 'free',\n    leads_extracted INTEGER DEFAULT 0,\n    bonus_credits INTEGER DEFAULT 0,\n    subscription_expiry INTEGER,\n    otp_code TEXT,\n    otp_expiry INTEGER,\n    otp_attempts INTEGER DEFAULT 0,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS tasks (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    name TEXT NOT NULL,\n    status TEXT DEFAULT 'pending',\n    status_reason TEXT,\n    total_keywords INTEGER DEFAULT 0,\n    current_keyword_index INTEGER DEFAULT 0,\n    total_leads INTEGER DEFAULT 0,\n    keywords TEXT,\n    user_agent TEXT,\n    accept_language TEXT,\n    last_logs_sent_at INTEGER DEFAULT (unixepoch()),\n    last_heartbeat INTEGER DEFAULT (unixepoch()),\n    export_file_ids TEXT,\n    export_status TEXT,\n    export_created_at INTEGER,\n    exported_leads_count INTEGER DEFAULT 0,\n    created_at INTEGER DEFAULT (unixepoch()),\n    updated_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS server_logs (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER,\n    task_id INTEGER,\n    level TEXT DEFAULT 'INFO',\n    message TEXT,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS searches (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    query TEXT NOT NULL,\n    task_id INTEGER REFERENCES tasks(id),\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS leads (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    address TEXT,\n    city TEXT,\n    website TEXT,\n    phone TEXT,\n    email TEXT,\n    rating REAL,\n    reviews_count INTEGER,\n    category TEXT,\n    place_id TEXT UNIQUE,\n    latitude REAL,\n    longitude REAL,\n    direction_url TEXT,\n    monday_hours TEXT,\n    tuesday_hours TEXT,\n    wednesday_hours TEXT,\n    thursday_hours TEXT,\n    friday_hours TEXT,\n    saturday_hours TEXT,\n    sunday_hours TEXT,\n    facebook TEXT,\n    instagram TEXT,\n    linkedin TEXT,\n    twitter TEXT,\n    youtube TEXT,\n    pinterest TEXT,\n    tiktok TEXT,\n    website_email TEXT,\n    website_phone TEXT,\n    lead_score INTEGER DEFAULT 0,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS lead_sources (\n    lead_id INTEGER REFERENCES leads(id),\n    search_id INTEGER REFERENCES searches(id),\n    task_id INTEGER REFERENCES tasks(id),\n    created_at INTEGER DEFAULT (unixepoch()),\n    UNIQUE(lead_id, search_id)\n  )",
    "CREATE TABLE IF NOT EXISTS city_areas (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    country TEXT NOT NULL,\n    state TEXT NOT NULL,\n    city TEXT NOT NULL,\n    areas TEXT NOT NULL,\n    last_updated INTEGER DEFAULT (unixepoch()),\n    UNIQUE(country, state, city)\n  )",
    "CREATE TABLE IF NOT EXISTS keyword_history (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    name TEXT NOT NULL,\n    niche TEXT,\n    location TEXT,\n    keywords TEXT NOT NULL,\n    total_keywords INTEGER,\n    keywords_truncated INTEGER DEFAULT 0,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS task_leads (\n    task_id INTEGER REFERENCES tasks(id),\n    lead_id INTEGER REFERENCES leads(id),\n    created_at INTEGER DEFAULT (unixepoch()),\n    UNIQUE(task_id, lead_id)\n  )",
    "CREATE TABLE IF NOT EXISTS settings (\n    user_id INTEGER REFERENCES users(id),\n    key TEXT NOT NULL,\n    value TEXT NOT NULL,\n    UNIQUE(user_id, key)\n  )",
    "CREATE TABLE IF NOT EXISTS saved_lists (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    name TEXT NOT NULL,\n    description TEXT,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS saved_list_items (\n    list_id INTEGER REFERENCES saved_lists(id),\n    lead_id INTEGER REFERENCES leads(id),\n    created_at INTEGER DEFAULT (unixepoch()),\n    UNIQUE(list_id, lead_id)\n  )",
    "CREATE TABLE IF NOT EXISTS export_templates (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    name TEXT NOT NULL,\n    columns TEXT NOT NULL,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS proxies (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    host TEXT NOT NULL,\n    port INTEGER NOT NULL,\n    username TEXT,\n    password TEXT,\n    protocol TEXT DEFAULT 'http',\n    is_active INTEGER DEFAULT 1,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS audit_logs (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    action TEXT NOT NULL,\n    status TEXT,\n    metadata TEXT,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS pincode_coords (\n    country TEXT NOT NULL,\n    pincode TEXT NOT NULL,\n    latitude REAL NOT NULL,\n    longitude REAL NOT NULL,\n    created_at INTEGER DEFAULT (unixepoch()),\n    UNIQUE(country, pincode)\n  )",
    "CREATE TABLE IF NOT EXISTS blog_posts (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    slug TEXT UNIQUE NOT NULL,\n    title TEXT NOT NULL,\n    description TEXT,\n    content TEXT NOT NULL,\n    author TEXT DEFAULT 'LeadSpotter Team',\n    category TEXT DEFAULT 'General',\n    read_time TEXT,\n    image_url TEXT,\n    meta_title TEXT,\n    meta_description TEXT,\n    is_published INTEGER DEFAULT 0,\n    published_at INTEGER,\n    created_at INTEGER DEFAULT (unixepoch()),\n    updated_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS rate_limits (\n    key TEXT PRIMARY KEY,\n    count INTEGER DEFAULT 1,\n    reset_at INTEGER NOT NULL\n  )",
    "CREATE TABLE IF NOT EXISTS plans (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    description TEXT,\n    price INTEGER NOT NULL,\n    discount INTEGER DEFAULT 0,\n    period TEXT NOT NULL,\n    leads_credits INTEGER NOT NULL,\n    max_concurrent_tasks INTEGER DEFAULT 1,\n    features TEXT,\n    unavailable_features TEXT,\n    whatsapp_url TEXT,\n    badge TEXT,\n    sort_order INTEGER DEFAULT 0,\n    is_active INTEGER DEFAULT 1,\n    created_at INTEGER DEFAULT (unixepoch()),\n    updated_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS transactions (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER REFERENCES users(id),\n    plan_id INTEGER REFERENCES plans(id),\n    amount TEXT NOT NULL,\n    status TEXT DEFAULT 'pending',\n    gateway_order_id TEXT,\n    utr TEXT,\n    created_at INTEGER DEFAULT (unixepoch()),\n    updated_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS site_config (\n    key TEXT PRIMARY KEY,\n    value TEXT NOT NULL,\n    updated_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS seo_hub_registry (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    niche TEXT NOT NULL,\n    city TEXT NOT NULL,\n    total_leads INTEGER DEFAULT 0,\n    with_email INTEGER DEFAULT 0,\n    with_phone INTEGER DEFAULT 0,\n    with_website INTEGER DEFAULT 0,\n    avg_rating REAL DEFAULT 0,\n    last_updated INTEGER DEFAULT (unixepoch()),\n    UNIQUE(niche, city)\n  )",
    "CREATE TABLE IF NOT EXISTS notifications (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER NOT NULL REFERENCES users(id),\n    type TEXT NOT NULL,\n    title TEXT NOT NULL,\n    message TEXT NOT NULL,\n    is_read INTEGER DEFAULT 0,\n    metadata TEXT,\n    created_at INTEGER DEFAULT (unixepoch())\n  )",
    "CREATE TABLE IF NOT EXISTS push_subscriptions (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER NOT NULL REFERENCES users(id),\n    endpoint TEXT NOT NULL,\n    p256dh TEXT NOT NULL,\n    auth TEXT NOT NULL,\n    created_at INTEGER DEFAULT (unixepoch()),\n    UNIQUE(endpoint)\n  )"
];
var indexes = [
    'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_server_logs_task_id ON server_logs(task_id)',
    'CREATE INDEX IF NOT EXISTS idx_server_logs_user_id ON server_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_searches_query ON searches(query)',
    'CREATE INDEX IF NOT EXISTS idx_leads_place_id ON leads(place_id)',
    'CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city)',
    'CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category)',
    'CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score)',
    'CREATE INDEX IF NOT EXISTS idx_lead_sources_lead_id ON lead_sources(lead_id)',
    'CREATE INDEX IF NOT EXISTS idx_lead_sources_search_id ON lead_sources(search_id)',
    'CREATE INDEX IF NOT EXISTS idx_lead_sources_task_id ON lead_sources(task_id)',
    'CREATE INDEX IF NOT EXISTS idx_task_leads_task_id ON task_leads(task_id)',
    'CREATE INDEX IF NOT EXISTS idx_task_leads_lead_id ON task_leads(lead_id)',
    'CREATE INDEX IF NOT EXISTS idx_saved_list_items_list_id ON saved_list_items(list_id)',
    'CREATE INDEX IF NOT EXISTS idx_saved_list_items_lead_id ON saved_list_items(lead_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id)'
];
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, tables_1, table, _a, indexes_1, idx, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Initializing libSQL database...');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    _i = 0, tables_1 = tables;
                    _b.label = 2;
                case 2:
                    if (!(_i < tables_1.length)) return [3 /*break*/, 5];
                    table = tables_1[_i];
                    return [4 /*yield*/, db.execute(table)];
                case 3:
                    _b.sent();
                    console.log('Created table');
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _a = 0, indexes_1 = indexes;
                    _b.label = 6;
                case 6:
                    if (!(_a < indexes_1.length)) return [3 /*break*/, 9];
                    idx = indexes_1[_a];
                    return [4 /*yield*/, db.execute(idx)];
                case 7:
                    _b.sent();
                    console.log('Created index');
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log('Database initialized successfully!');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    console.error('Error initializing database:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
init();
