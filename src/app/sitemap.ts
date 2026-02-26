import { db } from '@/lib/db/index';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://leadspotter.in';

  let blogEntries: MetadataRoute.Sitemap = [];
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

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/google-maps-extractor`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/email-enrichment`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/bulk-keyword-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  const niches = ['dentists', 'plumbers', 'real-estate-agents', 'restaurants', 'gyms'];
  const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'chennai'];
  
  const leadEntries: MetadataRoute.Sitemap = [];
  niches.forEach(niche => {
    cities.forEach(city => {
      leadEntries.push({
        url: `${baseUrl}/leads/${niche}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    });
  });

  return [...staticEntries, ...blogEntries, ...leadEntries];
}
