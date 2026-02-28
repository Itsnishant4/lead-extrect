import type { Metadata } from 'next';
import BlogPageClient from './client';
import { getBlogPostsPublicAction } from '@/app/actions';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingHeader } from "@/components/LandingHeader";

export const metadata: Metadata = {
  title: 'Blog - Lead Generation Tips, Guides & Best Practices',
  description:
    'Learn how to generate B2B leads, extract business data from Google Maps, build cold outreach campaigns, and grow your sales pipeline. Tips and guides from the LeadSpotter team.',
  alternates: { canonical: '/blog' },
  keywords: [
    'lead generation blog',
    'b2b lead generation tips',
    'google maps scraping guide',
    'cold outreach best practices',
    'sales prospecting tips',
    'how to extract leads from google maps',
    'business data extraction guide',
  ],
  openGraph: {
    title: 'Blog - Lead Generation Tips & Guides | LeadSpotter',
    description: 'Tips, guides, and best practices for B2B lead generation and sales prospecting.',
    url: 'https://leadspotter.in/blog',
  },
};

export default async function BlogPage() {
  const res = await getBlogPostsPublicAction();
  const posts = ('data' in res) ? res.data : [];
  
  return (
    <>
      <LandingBanner />
      <LandingHeader />
      <BlogPageClient initialPosts={posts || []} />
    </>
  );
}
