import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import { notFound } from 'next/navigation';

type Params = Promise<{ competitor: string }>;

const alternativesData: Record<string, {
  name: string;
  fullName: string;
  description: string;
  features: { name: string; leadspotter: boolean; competitor: boolean }[];
  pricing: string;
  verdict: string;
}> = {
  'apollo': {
    name: 'Apollo',
    fullName: 'Apollo.io',
    description: 'Apollo is a B2B sales intelligence platform with a large contact database, but it doesn\'t specialize in Google Maps data extraction.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: false },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: true },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: true },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: false },
      { name: 'CRM-Ready Export', leadspotter: true, competitor: true },
      { name: 'Local Business Targeting', leadspotter: true, competitor: false },
    ],
    pricing: 'Apollo starts at $49/month for basic features. LeadSpotter offers free leads.',
    verdict: 'Choose LeadSpotter if you need local business data from Google Maps. Choose Apollo for B2B SaaS company databases.',
  },
  'zoominfo': {
    name: 'ZoomInfo',
    fullName: 'ZoomInfo',
    description: 'ZoomInfo is an enterprise B2B intelligence platform with premium pricing, primarily focused on corporate contacts rather than local businesses.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: false },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: true },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: true },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: true },
      { name: 'CRM-Ready Export', leadspotter: true, competitor: true },
      { name: 'Local Business Targeting', leadspotter: true, competitor: false },
      { name: 'Free Plan Available', leadspotter: true, competitor: false },
    ],
    pricing: 'ZoomInfo starts at $15,000+/year. LeadSpotter offers a free plan.',
    verdict: 'Choose LeadSpotter for affordable local business lead extraction. Choose ZoomInfo for enterprise corporate contact databases.',
  },
  'outscraper': {
    name: 'Outscraper',
    fullName: 'Outscraper',
    description: 'Outscraper is an API-first Google Maps scraping service with per-request pricing, requiring technical knowledge to use effectively.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: true },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: true },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: true },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: true },
      { name: 'CRM-Ready Export', leadspotter: true, competitor: true },
      { name: 'No-Code Interface', leadspotter: true, competitor: false },
      { name: 'Free Plan Available', leadspotter: true, competitor: false },
    ],
    pricing: 'Outscraper charges per API request. LeadSpotter offers predictable monthly pricing.',
    verdict: 'Choose LeadSpotter for a no-code, all-in-one solution. Choose Outscraper if you need API access for custom integrations.',
  },
  'apify': {
    name: 'Apify',
    fullName: 'Apify',
    description: 'Apify is a web scraping platform that requires developer skills to set up Actors and configure scrapers.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: true },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: false },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: true },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'No-Code Interface', leadspotter: true, competitor: false },
      { name: 'Built-in Email Enrichment', leadspotter: true, competitor: false },
      { name: 'Free Plan Available', leadspotter: true, competitor: true },
    ],
    pricing: 'Apify charges for compute units. LeadSpotter offers simple flat-rate pricing.',
    verdict: 'Choose LeadSpotter for an easy, no-code solution. Choose Apify if you need custom scraping beyond Google Maps.',
  },
  'phantombuster': {
    name: 'PhantomBuster',
    fullName: 'PhantomBuster',
    description: 'PhantomBuster is a cloud automation tool for social media scraping with limited Google Maps support.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: false },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: false },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: false },
      { name: 'Social Media Scraping', leadspotter: false, competitor: true },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: true },
      { name: 'CRM-Ready Export', leadspotter: true, competitor: true },
      { name: 'Local Business Targeting', leadspotter: true, competitor: false },
    ],
    pricing: 'PhantomBuster starts at $69/month. LeadSpotter offers a free plan.',
    verdict: 'Choose LeadSpotter for Google Maps lead extraction. Choose PhantomBuster for LinkedIn/social media automation.',
  },
  'lusha': {
    name: 'Lusha',
    fullName: 'Lusha',
    description: 'Lusha is a browser extension for finding contact information on LinkedIn profiles, with limited bulk extraction capabilities.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: false },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: true },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: true },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: false },
      { name: 'Bulk Extraction', leadspotter: true, competitor: false },
      { name: 'Free Plan Available', leadspotter: true, competitor: true },
    ],
    pricing: 'Lusha starts at $29/month. LeadSpotter offers free leads.',
    verdict: 'Choose LeadSpotter for bulk local business extraction. Choose Lusha for quick LinkedIn contact lookups.',
  },
  'hunter': {
    name: 'Hunter',
    fullName: 'Hunter.io',
    description: 'Hunter.io specializes in finding email addresses from company domains but doesn\'t extract data from Google Maps.',
    features: [
      { name: 'Google Maps Direct Extraction', leadspotter: true, competitor: false },
      { name: 'Bulk Keyword Generation', leadspotter: true, competitor: false },
      { name: 'Business Email Finder', leadspotter: true, competitor: true },
      { name: 'Phone Number Extraction', leadspotter: true, competitor: false },
      { name: 'Social Media Discovery', leadspotter: true, competitor: false },
      { name: 'Cloud Processing 24/7', leadspotter: true, competitor: false },
      { name: 'Email Verification', leadspotter: true, competitor: true },
      { name: 'Domain Search', leadspotter: false, competitor: true },
    ],
    pricing: 'Hunter starts at $49/month. LeadSpotter offers free leads.',
    verdict: 'Choose LeadSpotter for complete business data from Google Maps. Choose Hunter for email-focused domain searches.',
  },
};

export async function generateStaticParams() {
  return Object.keys(alternativesData).map((competitor) => ({ competitor }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { competitor } = await params;
  const data = alternativesData[competitor];
  
  if (!data) return { title: 'Not Found' };

  return {
    title: `LeadSpotter vs ${data.fullName} — Which is Better for Lead Generation?`,
    description: `Compare LeadSpotter with ${data.fullName}. ${data.verdict}`,
    alternates: { canonical: `https://leadspotter.in/alternatives/${competitor}` },
    openGraph: {
      title: `LeadSpotter vs ${data.fullName} — Comparison`,
      description: data.verdict,
      url: `https://leadspotter.in/alternatives/${competitor}`,
    },
  };
}

export default async function AlternativesPage({ params }: { params: Params }) {
  const { competitor } = await params;
  const data = alternativesData[competitor];

  if (!data) notFound();

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd type="BreadcrumbList" data={{
        items: [
          { name: "Home", url: "https://leadspotter.in" },
          { name: "Alternatives", url: "https://leadspotter.in/compare" },
          { name: `${data.name} Alternative`, url: `https://leadspotter.in/alternatives/${competitor}` },
        ],
      }} />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              LeadSpotter vs {data.fullName}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {data.description}
            </p>
          </div>

          {/* Feature Comparison */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-12">
            <h2 className="text-xl font-bold mb-6">Feature Comparison</h2>
            <div className="space-y-3">
              {data.features.map((feature) => (
                <div key={feature.name} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <span className="font-medium">{feature.name}</span>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-24 text-right">LeadSpotter</span>
                      {feature.leadspotter ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <X size={20} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-24 text-right">{data.name}</span>
                      {feature.competitor ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <X size={20} className="text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict */}
          <div className="bg-indigo-50 rounded-2xl p-6 md:p-8 mb-12">
            <h2 className="text-xl font-bold mb-4">Our Verdict</h2>
            <p className="text-gray-700 text-lg">{data.verdict}</p>
            <p className="text-gray-500 mt-4 text-sm">{data.pricing}</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-700 transition-colors">
              Try LeadSpotter Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
