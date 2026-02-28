import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

const competitors: Record<string, { name: string; type: string }> = {
  'phantombuster': { name: 'PhantomBuster', type: 'cloud' },
  'd7leadfinder': { name: 'D7 Lead Finder', type: 'b2b' },
  'apollo': { name: 'Apollo.io', type: 'b2b' },
  'outscraper': { name: 'Outscraper', type: 'maps' },
  'apify': { name: 'Apify', type: 'scraper' },
};

type Params = Promise<{ competitor: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { competitor } = await params;
  const comp = competitors[competitor.replace('leadspotter-vs-', '')];

  if (!comp) return { title: 'Not Found' };

  return {
    title: `LeadSpotter vs ${comp.name} | Best Google Maps Extractor Alternative`,
    description: `Compare LeadSpotter and ${comp.name}. See why LeadSpotter is the best alternative for extracting B2B leads from Google Maps with emails and phone numbers.`,
    alternates: { canonical: `https://leadspotter.in/compare/leadspotter-vs-${competitor.replace('leadspotter-vs-', '')}` },
  };
}

export default async function ComparePage({ params }: { params: Params }) {
  const { competitor } = await params;
  const compKey = competitor.replace('leadspotter-vs-', '');
  const comp = competitors[compKey];

  if (!comp) {
    notFound();
  }

  return (
    <div className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
      <JsonLd 
        type="FAQPage" 
        data={{ 
          faqs: [
            {
              "@type": "Question",
              name: `What makes LeadSpotter a better alternative to ${comp.name}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `LeadSpotter is designed specifically for deep Google Maps data extraction with built-in email enrichment, making it significantly more targeted and cost-effective than general scrapers like ${comp.name}.`
              }
            }
          ]
        }} 
      />
      <LandingBanner />
      <LandingHeader />
      
      <main className="pt-32 pb-20 flex-grow">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              LeadSpotter <span className="text-gray-400 font-normal italic">vs</span> {comp.name}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Looking for an alternative to {comp.name}? See why modern sales teams choose LeadSpotter for high-volume, enriched B2B lead generation.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-16">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 p-6 font-bold text-center text-lg">
              <div className="text-left text-gray-500 uppercase tracking-wider text-sm flex items-center">Features</div>
              <div className="text-indigo-600 text-xl">LeadSpotter</div>
              <div className="text-gray-900 text-xl">{comp.name}</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Google Maps Extraction', us: true, them: comp.type === 'maps' },
                { label: 'Built-in Email Discovery', us: true, them: comp.type === 'b2b' },
                { label: 'One-Time Payment Options', us: true, them: false },
                { label: 'No Proxy Configuration Needed', us: true, them: comp.type !== 'scraper' },
                { label: 'Bulk Keyword Generation', us: true, them: false },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 p-6 items-center text-center hover:bg-gray-50 transition-colors">
                  <div className="text-left font-medium text-gray-700">{row.label}</div>
                  <div className="flex justify-center">
                    {row.us ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-gray-300" size={24} />}
                  </div>
                  <div className="flex justify-center">
                    {row.them ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-gray-300" size={24} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Why choose LeadSpotter?</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                While {comp.name} is a capable tool, LeadSpotter was built specifically for agencies and sales teams that need high-volume, accurate data from Google Maps without the complex setup.
              </p>
              <ul className="space-y-4">
                {[
                  "Pay-as-you-go & one-time plans so you don't get locked into monthly subscriptions.",
                  "Zero technical configuration required. Just type a keyword and let it run.",
                  "Deep website crawling to find emails that aren't publicly listed on Google Maps.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-indigo-950 mb-4">Ready to make the switch?</h3>
              <p className="text-indigo-800 mb-8">
                Join thousands of businesses that have moved to LeadSpotter for their B2B data needs. 
                Start for free and see the data quality yourself.
              </p>
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg">
                Start Free Trial <ArrowRight size={20} />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}