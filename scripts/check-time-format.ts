import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'https://sqlhost.onrender.com/leads/',
  authToken: process.env.DATABASE_AUTH_TOKEN || 'Nishant',
});

async function check() {
  const res = await client.execute('SELECT id, last_heartbeat FROM tasks WHERE id = 4');
  console.log('Task 4 Heartbeat Raw:', res.rows[0].last_heartbeat);
  console.log('Current Date.now():', Date.now());
  console.log('Current unixepoch:', Math.floor(Date.now() / 1000));
}

check().catch(console.error).finally(() => process.exit(0));
