import { MetadataRoute } from 'next';
import { db } from '@/lib/db/index';
import { seoHubRegistry, blogPosts } from '@/lib/db/schema';
import { sql, gt, eq } from 'drizzle-orm';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://leadspotter.in';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/leads`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/features/google-maps-extractor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/email-enrichment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/bulk-keyword-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/localized-area-search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/cloud-processing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/verified-email-extraction`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features/crm-ready-export`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/use-cases/marketing-agencies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases/sales-teams`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases/real-estate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases/freelancers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases/recruiters`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/use-cases/home-services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/compare/leadspotter-vs-phantombuster`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-apollo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-outscraper`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-apify`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-zoominfo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-lusha`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-hunter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-snov`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare/leadspotter-vs-d7leadfinder`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/integrations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/apollo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/zoominfo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/outscraper`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/apify`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/phantombuster`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/lusha`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/hunter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/dentists`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/restaurants`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/real-estate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/gyms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/salons`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/lawyers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/plumbers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/industries/electricians`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/company`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Programmatic leads pages (paginated, max 5000 for main sitemap)
  let leadsPages: MetadataRoute.Sitemap = [];
  try {
    const leadsData = await db.select({
      niche: seoHubRegistry.niche,
      city: seoHubRegistry.city,
      lastUpdated: seoHubRegistry.lastUpdated,
    })
      .from(seoHubRegistry)
      .where(gt(seoHubRegistry.totalLeads, 0))
      .orderBy(sql`${seoHubRegistry.niche}, ${seoHubRegistry.city}`)

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

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.select({
      slug: blogPosts.slug,
      updatedAt: blogPosts.updatedAt,
    })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(sql`${blogPosts.publishedAt} DESC`)
      .limit(100);

    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt ? new Date(Number(post.updatedAt) * 1000) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch blog posts', e);
  }

  return [...staticPages, ...leadsPages, ...blogPages];
}
