import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { blogPosts, leads } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const baseUrl = 'https://www.leadspotter.in';
  const limit = 25000;

  // Try to parse the id (e.g., "0.xml" -> 0)
  const idMatch = id.match(/^(\d+)\.xml$/);
  if (!idMatch) {
    return new NextResponse('Not found', { status: 404 });
  }

  const parsedId = Number(idMatch[1]);
  const offset = parsedId * limit;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const addUrl = (loc: string, lastMod: Date, changeFreq: string, priority: number) => {
    xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod.toISOString()}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  };

  if (parsedId === 0) {
    const now = new Date();
    // Core Static Pages
    addUrl(baseUrl, now, 'weekly', 1.0);
    addUrl(`${baseUrl}/pricing`, now, 'monthly', 0.9);
    addUrl(`${baseUrl}/features`, now, 'monthly', 0.9);
    addUrl(`${baseUrl}/features/google-maps-extractor`, now, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/email-enrichment`, now, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/bulk-keyword-generator`, now, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases`, now, 'monthly', 0.9);
    addUrl(`${baseUrl}/blog`, now, 'weekly', 0.9);
    addUrl(`${baseUrl}/company`, now, 'monthly', 0.7);
    addUrl(`${baseUrl}/privacy`, now, 'yearly', 0.3);
    addUrl(`${baseUrl}/terms`, now, 'yearly', 0.3);

    // Competitors
    const competitors = [
      'phantombuster', 'd7leadfinder', 'apollo', 'outscraper',
      'apify', 'zoominfo', 'lusha', 'hunter', 'snov'
    ];
    competitors.forEach(comp => addUrl(`${baseUrl}/compare/leadspotter-vs-${comp}`, now, 'monthly', 0.8));

    // Blog
    try {
      const posts = await db.select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt
      }).from(blogPosts).where(eq(blogPosts.isPublished, true));

      posts.forEach(post => {
        addUrl(`${baseUrl}/blog/${post.slug}`, post.updatedAt || now, 'monthly', 0.8);
      });
    } catch (e) {
      console.error('Sitemap: Failed to fetch blog posts', e);
    }
  }

  // Lead Entries (SEO Hub)
  try {
    const data = await db.execute(sql`
      SELECT niche as category, city 
      FROM seo_hub_registry 
      ORDER BY niche ASC, city ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const uniqueSlugs = new Set<string>();

    data.forEach((row: any) => {
      const niche = String(row.category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const city = String(row.city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (niche && city) {
        if (!uniqueSlugs.has(`niche-${niche}`)) {
          uniqueSlugs.add(`niche-${niche}`);
          addUrl(`${baseUrl}/leads/${niche}`, new Date(), 'weekly', 0.7);
        }
        if (!uniqueSlugs.has(`city-${city}`)) {
          uniqueSlugs.add(`city-${city}`);
          addUrl(`${baseUrl}/leads/in/${city}`, new Date(), 'weekly', 0.7);
        }

        const slug = `${niche}/${city}`;
        if (!uniqueSlugs.has(slug)) {
          uniqueSlugs.add(slug);
          addUrl(`${baseUrl}/leads/${slug}`, new Date(), 'weekly', 0.6);
        }
      }
    });
  } catch (error) {
    console.error('Sitemap: Failed to fetch lead categories', error);
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
