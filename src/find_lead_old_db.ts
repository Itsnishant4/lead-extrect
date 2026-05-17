import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './lib/db/schema';
import { like } from 'drizzle-orm';

const client = createClient({
  url: 'https://sql-server-8fa0.onrender.com/Leads/',
  authToken: 'Nishant',
});

const db = drizzle(client, { schema });

async function main() {
  console.log('Searching for Meknoid in old DB...');
  try {
    const results = await db.select().from(schema.leads).where(like(schema.leads.name, '%Meknoid%'));
    console.log('Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Query failed:', error);
  }
}

main().catch(console.error);
