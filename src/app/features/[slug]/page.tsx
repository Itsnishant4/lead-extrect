import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Search, Mail, Layers } from 'lucide-react';

const features = {
  'google-maps-extractor': {
    title: 'Google Maps Lead Extractor',
    description: 'Extract business data from Google Maps in bulk. Get names, addresses, ratings, and more automatically.',
    icon: Search,
    longDescription: 'Our Google Maps Extractor is designed for high-volume lead generation. It simulates human behavior to navigate through map results and capture every detail about local businesses.',
    benefits: ['Unlimited search queries', 'Real-time data extraction', 'Accurate business categories', 'Global market coverage'],
  },
  'email-enrichment': {
    title: 'B2B Email Finder & Enrichment',
    description: 'Find verified business emails and social profiles by automatically crawling business websites.',
    icon: Mail,
    longDescription: 'Go beyond basic map data. Our enrichment engine visits every business website to discover hidden contact information like direct emails, phone numbers, and LinkedIn profiles.',
    benefits: ['Verified email discovery', 'Social media profile extraction', 'Direct business line finding', 'Automatic deduplication'],
  },
  'bulk-keyword-generator': {
    title: 'Bulk Keyword Combination Generator',
    description: 'Generate thousands of targeted keywords by combining niches and locations in one click.',
    icon: Layers,
    longDescription: 'Scale your prospecting with our keyword generator. Combine multiple industries with hundreds of cities to create a massive search net that captures every potential lead.',
    benefits: ['One-click generation', 'Smart location targeting', 'Niche-specific filtering', 'Exportable keyword lists'],
  }
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return Object.keys(features).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];
  if (!feature) return { title: 'Feature Not Found' };

  return {
    title: `${feature.title} | LeadSpotter`,
    description: feature.description,
    alternates: { canonical: `https://leadspotter.in/features/${slug}` },
  };
}

export default async function FeaturePage({ params }: { params: Params }) {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];
  if (!feature) notFound();

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd 
        type="SoftwareApplication" 
        data={{ 
          name: feature.title, 
          description: feature.description,
          featureList: feature.benefits.join(', ')
        }} 
      />
      <LandingBanner />
      <LandingHeader />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <feature.icon size={32} />
            </div>
            <h1 className="text-4xl font-bold">{feature.title}</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {feature.longDescription}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {feature.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span className="font-semibold">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-indigo-900 p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Start using {feature.title} today</h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">Get free leads every month with our starter plan. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors">
              Get Started for Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
