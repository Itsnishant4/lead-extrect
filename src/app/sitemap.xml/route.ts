import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://leadspotter.in';
  
  // Create a sitemap index that points to the dynamic sitemaps
  // We currently only have 1 chunk (id=0), but this can be expanded if needed
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap/0.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
