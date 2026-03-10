import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function check() {
    console.log('Checking users table (known good with rows):');
    const u1 = await db.execute('SELECT * FROM users LIMIT 1');
    console.log('SELECT users columns:', u1.columns.length);

    const p1 = await db.execute('PRAGMA table_info(users)');
    console.log('PRAGMA users rows:', p1.rows.length);

    console.log('\\nChecking leads table (empty):');
    const l1 = await db.execute('SELECT * FROM leads LIMIT 1');
    console.log('SELECT leads columns:', l1.columns.length);

    const p2 = await db.execute('PRAGMA table_info(leads)');
    console.log('PRAGMA leads rows:', p2.rows.length);
}

check();
