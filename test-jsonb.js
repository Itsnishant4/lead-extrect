const pg = require('postgres');
require('dotenv').config({ path: '.env.local' });
const db = pg(process.env.DATABASE_URL, { ssl: 'require' });

async function test() {
  try {
    await db`ALTER TABLE tasks ALTER COLUMN keywords TYPE JSONB USING keywords::jsonb`;
    console.log("Converted successfully");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
test();
