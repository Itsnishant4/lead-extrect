import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    is_suspended INTEGER DEFAULT 0,
    plan_type TEXT DEFAULT 'free',
    leads_extracted INTEGER DEFAULT 0,
    bonus_credits INTEGER DEFAULT 0,
    subscription_expiry INTEGER,
    otp_code TEXT,
    otp_expiry INTEGER,
    otp_attempts INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    status_reason TEXT,
    total_keywords INTEGER DEFAULT 0,
    current_keyword_index INTEGER DEFAULT 0,
    total_leads INTEGER DEFAULT 0,
    keywords TEXT,
    user_agent TEXT,
    accept_language TEXT,
    last_logs_sent_at INTEGER DEFAULT (unixepoch()),
    last_heartbeat INTEGER DEFAULT (unixepoch()),
    export_file_ids TEXT,
    export_status TEXT,
    export_created_at INTEGER,
    exported_leads_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS server_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task_id INTEGER,
    level TEXT DEFAULT 'INFO',
    message TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    query TEXT NOT NULL,
    task_id INTEGER REFERENCES tasks(id),
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    rating REAL,
    reviews_count INTEGER,
    category TEXT,
    place_id TEXT UNIQUE,
    latitude REAL,
    longitude REAL,
    direction_url TEXT,
    monday_hours TEXT,
    tuesday_hours TEXT,
    wednesday_hours TEXT,
    thursday_hours TEXT,
    friday_hours TEXT,
    saturday_hours TEXT,
    sunday_hours TEXT,
    facebook TEXT,
    instagram TEXT,
    linkedin TEXT,
    twitter TEXT,
    youtube TEXT,
    pinterest TEXT,
    tiktok TEXT,
    website_email TEXT,
    website_phone TEXT,
    lead_score INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS lead_sources (
    lead_id INTEGER REFERENCES leads(id),
    search_id INTEGER REFERENCES searches(id),
    task_id INTEGER REFERENCES tasks(id),
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(lead_id, search_id)
  )`,

  `CREATE TABLE IF NOT EXISTS city_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    areas TEXT NOT NULL,
    last_updated INTEGER DEFAULT (unixepoch()),
    UNIQUE(country, state, city)
  )`,

  `CREATE TABLE IF NOT EXISTS keyword_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    niche TEXT,
    location TEXT,
    keywords TEXT NOT NULL,
    total_keywords INTEGER,
    keywords_truncated INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS task_leads (
    task_id INTEGER REFERENCES tasks(id),
    lead_id INTEGER REFERENCES leads(id),
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(task_id, lead_id)
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER REFERENCES users(id),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    UNIQUE(user_id, key)
  )`,

  `CREATE TABLE IF NOT EXISTS saved_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS saved_list_items (
    list_id INTEGER REFERENCES saved_lists(id),
    lead_id INTEGER REFERENCES leads(id),
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(list_id, lead_id)
  )`,

  `CREATE TABLE IF NOT EXISTS export_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    columns TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS proxies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT,
    password TEXT,
    protocol TEXT DEFAULT 'http',
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    status TEXT,
    metadata TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS pincode_coords (
    country TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(country, pincode)
  )`,

  `CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'LeadSpotter Team',
    category TEXT DEFAULT 'General',
    read_time TEXT,
    image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    is_published INTEGER DEFAULT 0,
    published_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1,
    reset_at INTEGER NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    period TEXT NOT NULL,
    leads_credits INTEGER NOT NULL,
    max_concurrent_tasks INTEGER DEFAULT 1,
    features TEXT,
    unavailable_features TEXT,
    whatsapp_url TEXT,
    badge TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES plans(id),
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    gateway_order_id TEXT,
    utr TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS seo_hub_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    niche TEXT NOT NULL,
    city TEXT NOT NULL,
    total_leads INTEGER DEFAULT 0,
    with_email INTEGER DEFAULT 0,
    with_phone INTEGER DEFAULT 0,
    with_website INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0,
    last_updated INTEGER DEFAULT (unixepoch()),
    UNIQUE(niche, city)
  )`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    metadata TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  )`,

  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(endpoint)
  )`
];

const indexes = [
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

async function init() {
  console.log('Initializing libSQL database...');

  try {
    for (const table of tables) {
      await db.execute(table);
      console.log('Created table');
    }

    for (const idx of indexes) {
      await db.execute(idx);
      console.log('Created index');
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init();
