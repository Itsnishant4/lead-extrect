import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Keep the raw client for edge cases if needed
export const raw = client;

let isInitialized = false;

export async function seed() {
  if (isInitialized) return;
  // Seed logic if needed
  isInitialized = true;
}
