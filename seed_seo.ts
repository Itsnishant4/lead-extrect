import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL + '?sslmode=require');
const db = drizzle(client);

async function main() {
  console.log("Starting seed...");
  try {
    await db.execute(sql`
      INSERT INTO seo_hub_registry (niche, city, total_leads, with_email, with_phone, with_website, avg_rating)
      SELECT 
        category as niche,
        city,
        COUNT(*) as total_leads,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email,
        SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_phone,
        SUM(CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END) as with_website,
        AVG(rating) as avg_rating
      FROM leads
      WHERE category IS NOT NULL AND city IS NOT NULL
      GROUP BY category, city
      ON CONFLICT (niche, city) DO UPDATE SET 
        total_leads = seo_hub_registry.total_leads + EXCLUDED.total_leads,
        with_email = seo_hub_registry.with_email + EXCLUDED.with_email,
        with_phone = seo_hub_registry.with_phone + EXCLUDED.with_phone,
        with_website = seo_hub_registry.with_website + EXCLUDED.with_website,
        last_updated = NOW();
    `);
    console.log("Seeded successfully!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
