import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/db/schema';

const client = createClient({
  url: process.env.DATABASE_URL || 'https://sqlhost.onrender.com/leads/',
  authToken: process.env.DATABASE_AUTH_TOKEN || 'Nishant',
});

const db = drizzle(client, { schema });

async function query() {
  const tasks = await db.select({
      id: schema.tasks.id, 
      name: schema.tasks.name, 
      status: schema.tasks.status, 
      statusReason: schema.tasks.statusReason,
      currentKeywordIndex: schema.tasks.currentKeywordIndex,
      totalKeywords: schema.tasks.totalKeywords,
      totalLeads: schema.tasks.totalLeads,
      lastHeartbeat: schema.tasks.lastHeartbeat
  }).from(schema.tasks);
  
  console.log('Tasks in DB:');
  tasks.forEach(t => {
      console.log(`[Task ${t.id}] ${t.name} - ${t.status} (${t.statusReason}) - Keywords: ${t.currentKeywordIndex}/${t.totalKeywords} - Heartbeat: ${t.lastHeartbeat}`);
  });
  
  const tables = ['seo_hub_registry', 'notifications', 'push_subscriptions'];
  for (const table of tables) {
    try {
      const res = await db.run(sql`SELECT count(*) as count FROM ${sql.raw(table)}`);
      console.log(`Table ${table} exists. Rows:`, res.rows[0]);
    } catch (e: any) {
      console.error(`Table ${table} does NOT exist or error:`, e.message);
    }
  }
}

query().catch(console.error).finally(() => process.exit(0));
