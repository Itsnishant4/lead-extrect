import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/db/schema';

const client = createClient({
  url: process.env.DATABASE_URL || 'https://sqlhost.onrender.com/leads/',
  authToken: process.env.DATABASE_AUTH_TOKEN || 'Nishant',
});

const db = drizzle(client, { schema });

async function populateRegistry() {
  console.log('Fetching all leads...');
  const allLeads = await db.select().from(schema.leads);
  console.log(`Found ${allLeads.length} leads.`);

  const seoStats = new Map<string, any>();
  
  for (const lead of allLeads) {
    if (!lead.category || !lead.city) continue;
    
    const niche = lead.category.trim();
    const city = lead.city.trim();
    if (!niche || !city) continue;
    
    const key = `${niche}::${city}`;
    if (!seoStats.has(key)) {
      seoStats.set(key, { 
        niche, 
        city, 
        count: 0, 
        withEmail: 0, 
        withPhone: 0, 
        withWebsite: 0, 
        totalRating: 0, 
        ratingCount: 0 
      });
    }
    
    const stat = seoStats.get(key);
    stat.count += 1;
    if (lead.email || lead.websiteEmail) stat.withEmail += 1;
    if (lead.phone || lead.websitePhone) stat.withPhone += 1;
    if (lead.website) stat.withWebsite += 1;
    if (lead.rating) {
      stat.totalRating += Number(lead.rating);
      stat.ratingCount += 1;
    }
  }

  console.log(`Aggregated into ${seoStats.size} niche/city pairs.`);

  if (seoStats.size > 0) {
    const seoInsertData = Array.from(seoStats.values()).map(stat => ({
      niche: stat.niche,
      city: stat.city,
      totalLeads: stat.count,
      withEmail: stat.withEmail,
      withPhone: stat.withPhone,
      withWebsite: stat.withWebsite,
      avgRating: stat.ratingCount > 0 ? (stat.totalRating / stat.ratingCount) : 0,
      lastUpdated: new Date()
    }));

    // Clear existing registrar (optional, but cleaner for a full rebuild)
    console.log('Clearing existing registry...');
    await db.run(sql`DELETE FROM seo_hub_registry`);

    console.log('Inserting aggregated data...');
    // Drizzle might hit bulk insert limits for very large sets, so we chunk
    const CHUNK_SIZE = 100;
    for (let i = 0; i < seoInsertData.length; i += CHUNK_SIZE) {
      await db.insert(schema.seoHubRegistry).values(seoInsertData.slice(i, i + CHUNK_SIZE));
    }
    console.log('Done!');
  }
}

populateRegistry().catch(console.error).finally(() => process.exit(0));
