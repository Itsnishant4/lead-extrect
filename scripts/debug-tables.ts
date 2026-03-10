import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function debug() {
    const tablesToCheck = ['users', 'tasks', 'leads', 'task_leads'];
    for (const table of tablesToCheck) {
        console.log(`Checking table: ${table}`);
        try {
            const rs = await db.execute(`SELECT * FROM ${table} LIMIT 1`);
            console.log(`  Columns:`, rs.columns);
        } catch (e) {
            console.error(`  Error selecting from ${table}:`, (e as Error).message);
        }
    }
}

debug();
