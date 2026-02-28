import { db } from '@/lib/db/index';
import { blogPosts, leads } from '@/lib/db/schema';
import { eq, isNotNull, and, sql } from 'drizzle-orm';
import { MetadataRoute } from 'next';

// Generate multiple sitemaps based on chunks of 25,000 URLs
export async function generateSitemaps() {
  try {
    const res = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM (SELECT DISTINCT category, city FROM leads WHERE category IS NOT NULL AND city IS NOT NULL) as c
    `);
    const count = Number(res[0]?.count || 0);
    const limit = 25000;
    const sitemapsCount = Math.ceil(count / limit) || 1; // at least 1
    
    return Array.from({ length: sitemapsCount }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error('Failed to generate sitemaps count:', error);
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://leadspotter.in';
  const limit = 25000;
  const parsedId = Number(id) || 0;
  const offset = parsedId * limit;

  let blogEntries: MetadataRoute.Sitemap = [];
  if (parsedId === 0) {
    // Only include static & blog entries in the first sitemap chunk
    try {
      const posts = await db.select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));

      blogEntries = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    } catch (e) {
      console.error('Sitemap: Failed to fetch blog posts:', e);
    }
  }

  const staticEntries: MetadataRoute.Sitemap = parsedId === 0 ? [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/features/google-maps-extractor`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/features/email-enrichment`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/features/bulk-keyword-generator`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/use-cases`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/company`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    
    // Competitor Comparison Pages
    { url: `${baseUrl}/compare/leadspotter-vs-phantombuster`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-d7leadfinder`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-apollo`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-outscraper`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-apify`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    
    // Core SEO Hub Pages (Fallback if DB is empty)
    { url: `${baseUrl}/leads/dentists`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/leads/real-estate-agents`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/leads/restaurants`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/leads/in/mumbai`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/leads/in/delhi`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/leads/in/bangalore`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ] : [];

  const leadEntries: MetadataRoute.Sitemap = [];
  try {
    const data = await db.execute(sql`
      SELECT DISTINCT category, city 
      FROM leads 
      WHERE category IS NOT NULL AND city IS NOT NULL
      ORDER BY category ASC, city ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Ensure we don't have duplicates because slugifying might map different raw categories to the same slug.
    const uniqueSlugs = new Set<string>();

    data.forEach((row: any) => {
      // Slugify strings: lower case, replace non-alphanumeric with hyphen
      const niche = String(row.category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const city = String(row.city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (niche && city) {
        // Add hub pages (if not already added)
        if (!uniqueSlugs.has(`niche-${niche}`)) {
          uniqueSlugs.add(`niche-${niche}`);
          leadEntries.push({
            url: `${baseUrl}/leads/${niche}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
        if (!uniqueSlugs.has(`city-${city}`)) {
          uniqueSlugs.add(`city-${city}`);
          leadEntries.push({
            url: `${baseUrl}/leads/in/${city}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }

        const slug = `${niche}/${city}`;
        if (!uniqueSlugs.has(slug)) {
          uniqueSlugs.add(slug);
          leadEntries.push({
            url: `${baseUrl}/leads/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          });
        }
      }
    });
  } catch (error) {
    console.error('Sitemap: Failed to fetch lead categories:', error);
  }

  return [...staticEntries, ...blogEntries, ...leadEntries];
}