import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { blogPosts, leads, seoHubRegistry } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const baseUrl = 'https://leadspotter.in';
  const limit = 25000;

  const idMatch = id.match(/^(\d+)\.xml$/);
  if (!idMatch) {
    return new NextResponse('Not found', { status: 404 });
  }

  const parsedId = Number(idMatch[1]);
  const offset = parsedId * limit;

  // Use current date for static pages
  const staticLastMod = new Date().toISOString().split('.')[0] + 'Z';
  const now = new Date();


  // Helper to format date for XML without milliseconds
  const formatDate = (date: Date) => date.toISOString().split('.')[0] + 'Z';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const addUrl = (loc: string, lastMod: Date | string, changeFreq: string, priority: number) => {
    const formattedDate = typeof lastMod === 'string' ? lastMod : formatDate(lastMod);
    xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  };


  if (parsedId === 0) {
    // Core Static Pages
    addUrl(baseUrl, staticLastMod, 'weekly', 1.0);
    addUrl(`${baseUrl}/pricing`, staticLastMod, 'monthly', 0.9);
    addUrl(`${baseUrl}/features`, staticLastMod, 'monthly', 0.9);
    addUrl(`${baseUrl}/features/google-maps-extractor`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/email-enrichment`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/bulk-keyword-generator`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/localized-area-search`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/cloud-processing`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/verified-email-extraction`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/features/crm-ready-export`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases`, staticLastMod, 'monthly', 0.9);
    addUrl(`${baseUrl}/use-cases/marketing-agencies`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases/sales-teams`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases/real-estate`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases/freelancers`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases/recruiters`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/use-cases/home-services`, staticLastMod, 'monthly', 0.8);
    addUrl(`${baseUrl}/compare`, staticLastMod, 'monthly', 0.9);
    addUrl(`${baseUrl}/blog`, staticLastMod, 'weekly', 0.9);
    addUrl(`${baseUrl}/company`, staticLastMod, 'monthly', 0.7);
    addUrl(`${baseUrl}/privacy`, staticLastMod, 'yearly', 0.3);
    addUrl(`${baseUrl}/terms`, staticLastMod, 'yearly', 0.3);

    // Competitors
    const competitors = [
      'phantombuster', 'd7leadfinder', 'apollo', 'outscraper',
      'apify', 'zoominfo', 'lusha', 'hunter', 'snov'
    ];
    competitors.forEach(comp => addUrl(`${baseUrl}/compare/leadspotter-vs-${comp}`, staticLastMod, 'monthly', 0.8));

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
    const data = await db.select({
      category: seoHubRegistry.niche,
      city: seoHubRegistry.city,
      lastUpdated: seoHubRegistry.lastUpdated,
    })
    .from(seoHubRegistry)
    .orderBy(seoHubRegistry.niche, seoHubRegistry.city)
    .limit(limit)
    .offset(offset);

    const uniqueSlugs = new Set<string>();

    data.forEach((row) => {
      const niche = String(row.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const city = String(row.city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const lastMod = row.lastUpdated ? new Date(Number(row.lastUpdated) * 1000) : now;

      if (niche && city) {
        if (!uniqueSlugs.has(`niche-${niche}`)) {
          uniqueSlugs.add(`niche-${niche}`);
          addUrl(`${baseUrl}/leads/${niche}`, lastMod, 'daily', 0.7);
        }
        if (!uniqueSlugs.has(`city-${city}`)) {
          uniqueSlugs.add(`city-${city}`);
          addUrl(`${baseUrl}/leads/in/${city}`, lastMod, 'daily', 0.7);
        }

        const slug = `${niche}/${city}`;
        if (!uniqueSlugs.has(slug)) {
          uniqueSlugs.add(slug);
          addUrl(`${baseUrl}/leads/${slug}`, lastMod, 'daily', 0.6);
        }
      }
    });
  } catch (error) {
    console.error('Sitemap: Failed to fetch lead categories', error);
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  });
}
