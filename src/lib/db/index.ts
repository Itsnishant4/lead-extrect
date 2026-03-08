import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const dbPath = process.env.SQLITE_DB_PATH || './data/leads.db';

// Ensure data directory exists
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 10000');

export const db = drizzle(sqlite, { schema });

// Keep the raw client for edge cases if needed
export const raw = sqlite;

let isInitialized = false;

export async function seed() {
  if (isInitialized) return;
  // Seed logic if needed
  isInitialized = true;
}
