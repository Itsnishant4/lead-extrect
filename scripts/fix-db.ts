import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function fix() {
    const tablesToFix = ['leads', 'task_leads', 'lead_sources', 'searches', 'server_logs', 'keyword_history'];

    for (const table of tablesToFix) {
        console.log(`Checking table: ${table}`);
        try {
            const rs = await db.execute(`SELECT * FROM ${table} LIMIT 1`);
            if (rs.columns.length === 0) {
                console.log(`  Table ${table} is BROKEN (0 columns). Fixing...`);
                await db.execute(`DROP TABLE IF EXISTS ${table}`);
                console.log(`  Dropped ${table}`);
            } else {
                console.log(`  Table ${table} is OK (${rs.columns.length} columns)`);
            }
        } catch (e) {
            console.log(`  Table ${table} not found or error. Recreating...`);
            await db.execute(`DROP TABLE IF EXISTS ${table}`);
        }
    }

    console.log('Re-running full initialization...');
}

fix();
