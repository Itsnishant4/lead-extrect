import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { seoHubRegistry } from '@/lib/db/schema';
import { sql, gt } from 'drizzle-orm';

export const revalidate = 3600;

const PAGE_SIZE = 5000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 5) {
    return new NextResponse('Not found', { status: 404 });
  }

  const baseUrl = 'https://leadspotter.in';
  const offset = (pageNum - 1) * PAGE_SIZE;

  let leadsPages: { url: string; lastModified: Date; changeFrequency: string; priority: number }[] = [];
  try {
    const leadsData = await db.select({
      niche: seoHubRegistry.niche,
      city: seoHubRegistry.city,
      lastUpdated: seoHubRegistry.lastUpdated,
    })
      .from(seoHubRegistry)
      .where(gt(seoHubRegistry.totalLeads, 0))
      .orderBy(sql`${seoHubRegistry.niche}, ${seoHubRegistry.city}`)
      .limit(PAGE_SIZE)
      .offset(offset);

    leadsPages = leadsData.map((row) => {
      const niche = row.niche.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const city = row.city.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return {
        url: `${baseUrl}/leads/${niche}/${city}`,
        lastModified: row.lastUpdated ? new Date(Number(row.lastUpdated) * 1000) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
  } catch (e) {
    console.error('Sitemap: failed to fetch leads pages', e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${leadsPages.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
