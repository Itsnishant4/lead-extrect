import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LeadSpotter Comparisons — See How We Stack Up Against Competitors',
  description: 'Compare LeadSpotter with PhantomBuster, Apollo, Outscraper, ZoomInfo, and more. See features, pricing, and why teams switch to LeadSpotter for Google Maps lead extraction.',
  alternates: { canonical: 'https://leadspotter.in/compare' },
};

const competitors = [
  { slug: 'phantombuster', name: 'PhantomBuster', tagline: 'Cloud automation tool with limited Google Maps support' },
  { slug: 'apollo', name: 'Apollo.io', tagline: 'B2B database with indirect Google Maps data' },
  { slug: 'outscraper', name: 'Outscraper', tagline: 'API-based extraction with per-request pricing' },
  { slug: 'apify', name: 'Apify', tagline: 'Developer platform requiring technical setup' },
  { slug: 'zoominfo', name: 'ZoomInfo', tagline: 'Enterprise B2B database with high pricing' },
  { slug: 'lusha', name: 'Lusha', tagline: 'Chrome extension with limited bulk extraction' },
  { slug: 'hunter', name: 'Hunter.io', tagline: 'Email-only finder without Google Maps integration' },
  { slug: 'snov', name: 'Snov.io', tagline: 'Email outreach tool with basic lead finding' },
  { slug: 'd7leadfinder', name: 'D7 Lead Finder', tagline: 'Basic Google Maps scraper with limited features' },
];

export default function CompareHubPage() {
  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd type="BreadcrumbList" data={{
        items: [
          { name: "Home", url: "https://leadspotter.in" },
          { name: "Compare", url: "https://leadspotter.in/compare" },
        ],
      }} />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">LeadSpotter vs Everyone</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See how LeadSpotter compares to other lead extraction tools. Real feature comparisons, transparent pricing, honest verdicts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {competitors.map((comp) => (
              <Link
                key={comp.slug}
                href={`/compare/leadspotter-vs-${comp.slug}`}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    LeadSpotter vs {comp.name}
                  </h2>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-500">{comp.tagline}</p>
              </Link>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-indigo-50 p-10 text-center border border-indigo-100">
            <h2 className="text-2xl font-bold mb-4">Ready to try LeadSpotter?</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Start with 500 free leads per month. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg">
              Get Started Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
