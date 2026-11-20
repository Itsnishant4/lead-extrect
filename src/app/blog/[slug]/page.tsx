import React from 'react';
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react';
import { getBlogPostBySlugPublicAction, getBlogPostsPublicAction } from '@/app/actions';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import JsonLdBlog from '@/components/JsonLdBlog';
import JsonLd from '@/components/JsonLd';
import { StaticBreadcrumbs } from '@/components/Breadcrumbs';

export const dynamicParams = true;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const res = await getBlogPostsPublicAction();
  if (!('data' in res)) return [];
  return res.data.map((post: any) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBlogPostBySlugPublicAction(slug);

  if (!('data' in res)) return { title: 'Article Not Found' };
  const article = res.data;

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.description || undefined,
    alternates: { canonical: `https://leadspotter.in/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      url: `https://leadspotter.in/blog/${slug}`,
      type: 'article',
      publishedTime: (article.publishedAt || article.createdAt)?.toISOString(),
      modifiedTime: (article.updatedAt || article.publishedAt || article.createdAt)?.toISOString(),
      images: article.imageUrl ? [{ url: article.imageUrl }] : [{ url: 'https://leadspotter.in/opengraph-image' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description || undefined,
      images: [article.imageUrl || 'https://leadspotter.in/opengraph-image'],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const res = await getBlogPostBySlugPublicAction(slug);

  if (!('data' in res)) {
    notFound();
  }

  const article = res.data;

  // Fetch related posts (simple approach: all other posts)
  const allPostsRes = await getBlogPostsPublicAction();
  const relatedPosts = (('data' in allPostsRes) ? allPostsRes.data : [])
    .filter((p: any) => p.slug !== slug)
    .slice(0, 3);

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let paragraphCount = 0;

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) { result.push(<br key={i} />); return; }
      if (trimmed.startsWith('## ')) { result.push(<h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">{trimmed.slice(3)}</h2>); return; }
      if (trimmed.startsWith('### ')) { result.push(<h3 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{trimmed.slice(4)}</h3>); return; }
      if (trimmed.startsWith('- **')) {
        const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) { result.push(<li key={i} className="ml-6 mb-2 text-gray-600 list-disc"><strong className="text-gray-900">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</li>); return; }
      }
      if (trimmed.startsWith('- ')) { result.push(<li key={i} className="ml-6 mb-2 text-gray-600 list-disc">{trimmed.slice(2)}</li>); return; }
      if (trimmed.startsWith('1. ') || /^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s*/, '');
        const boldMatch = text.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
        if (boldMatch) { result.push(<li key={i} className="ml-6 mb-2 text-gray-600 list-decimal"><strong className="text-gray-900">{boldMatch[1]}</strong>{boldMatch[2] ? `: ${boldMatch[2]}` : ''}</li>); return; }
        result.push(<li key={i} className="ml-6 mb-2 text-gray-600 list-decimal">{text}</li>); return;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) { result.push(<p key={i} className="font-bold text-gray-900 mt-4 mb-2">{trimmed.slice(2, -2)}</p>); return; }
      if (trimmed.startsWith('**')) {
        const parts = trimmed.split(/\*\*/g);
        result.push(<p key={i} className="text-gray-600 leading-relaxed mb-4">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-gray-900">{part}</strong> : part)}</p>);
        paragraphCount++;
      } else {
        result.push(<p key={i} className="text-gray-600 leading-relaxed mb-4">{trimmed}</p>);
        paragraphCount++;
      }

      // Insert inline CTA after ~8 paragraphs
      if (paragraphCount === 8) {
        result.push(
          <div key={`cta-${i}`} className="my-10 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-6 text-center">
            <p className="font-bold text-gray-900 mb-2">Ready to try it yourself?</p>
            <p className="text-gray-500 text-sm mb-4">Start extracting leads from Google Maps for free.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors">
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        );
      }
    });

    return result;
  };

  const publishDate = article.publishedAt || article.createdAt;

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Blog", url: "https://leadspotter.in/blog" },
            { name: article.title, url: `https://leadspotter.in/blog/${slug}` },
          ],
        }}
      />
      <JsonLdBlog article={article} />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-28 md:pt-36 pb-20">
        <article className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-8 hover:text-indigo-700 transition-colors">
            <ArrowLeft size={16} />Back to Blog
          </Link>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-10 pb-10 border-b border-gray-100">
            <span className="flex items-center gap-1.5"><Clock size={14} />{article.readTime}</span>
            <span className="flex items-center gap-1.5"><User size={14} />{article.author}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{publishDate ? format(new Date(publishDate), 'MMMM dd, yyyy') : 'Recently'}</span>
          </div>

          <div className="prose max-w-none">
            {renderContent(article.content)}
          </div>

          <div className="mt-16 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Extract Your First Leads?</h3>
            <p className="text-gray-500 mb-6">Start with free leads from Google Maps. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors">
              Get Started Free<ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 mt-24">
            <h2 className="text-2xl font-bold mb-10 text-center">More from LeadSpotter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post: any) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-video rounded-xl bg-gray-100 mb-4 overflow-hidden">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                        <Clock size={48} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
