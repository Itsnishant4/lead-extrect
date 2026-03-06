import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use the pooled URL for better performance in serverless/worker environments
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing POSTGRES_URL or DATABASE_URL environment variable');
}

// Supabase Connection Pooling (PgBouncer) setup
export const client = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // MANDATORY for PgBouncer/Supabase pooling
});

export const db = drizzle(client, { schema });

// Keep the raw client for edge cases if needed, but prefer 'db'
export const raw = client;

let isInitialized = false;

// We'll keep the seed function for now as a fallback, but migrate to drizzle-kit soon
export async function seed() {
  if (isInitialized) return;
  // ... existing seed logic if needed ...
  isInitialized = true;
}
