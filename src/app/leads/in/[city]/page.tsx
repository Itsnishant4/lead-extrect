import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, MapPin, Search, Store } from 'lucide-react';
import { db } from '@/lib/db';
import { seoHubRegistry } from '@/lib/db/schema';
import { sql, like } from 'drizzle-orm';

type Params = Promise<{ city: string }>;

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city } = await params;
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const searchCity = city.replace(/-/g, ' ');

  // Check if data exists to prevent index bloat
  let hasData = false;
  try {
    const count = await db.select({ total: sql<number>`SUM(${seoHubRegistry.totalLeads})` })
      .from(seoHubRegistry)
      .where(like(seoHubRegistry.city, `%${searchCity}%`));
    hasData = Number(count[0]?.total || 0) > 0;
  } catch {}

  return {
    title: `Best B2B Leads in ${capitalizedCity} | Business Directory | LeadSpotter`,
    description: `Discover verified businesses and local leads in ${capitalizedCity}. Extract names, emails, and phone numbers across multiple industries.`,
    alternates: { canonical: `https://leadspotter.in/leads/in/${city}` },
    robots: hasData ? { index: true, follow: true } : { index: false, follow: true },
    keywords: [`leads in ${capitalizedCity}`, `${capitalizedCity} businesses`, 'b2b leads', 'google maps leads', 'local business directory'],
    openGraph: {
      title: `Best B2B Leads in ${capitalizedCity} | LeadSpotter`,
      description: `Discover verified businesses and local leads in ${capitalizedCity}. Extract names, emails, and phone numbers.`,
      url: `https://leadspotter.in/leads/in/${city}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best B2B Leads in ${capitalizedCity} | LeadSpotter`,
      description: `Discover verified businesses and local leads in ${capitalizedCity}.`,
      images: ['https://leadspotter.in/opengraph-image'],
    },
  };
}

export default async function CityHubPage({ params }: { params: Params }) {
  const { city } = await params;
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const searchCity = city.replace(/-/g, ' ');

  // Fetch niches that have data for this city
  let popularNiches: string[] = ['dentists', 'plumbers', 'real-estate-agents', 'restaurants', 'gyms', 'hospitals', 'lawyers', 'software-companies', 'digital-marketing', 'interior-designers'];
  try {
    const dbNiches = await db.select({ niche: seoHubRegistry.niche })
      .from(seoHubRegistry)
      .where(like(seoHubRegistry.city, `%${searchCity}%`))
      .groupBy(seoHubRegistry.niche)
      .orderBy(sql`SUM(${seoHubRegistry.totalLeads}) DESC`)
      .limit(20);
    if (dbNiches.length > 0) {
      popularNiches = dbNiches.map(n => String(n.niche).toLowerCase().replace(/\s+/g, '-'));
    }
  } catch {}

  return (
    <div className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Leads", url: "https://leadspotter.in/leads" },
            { name: capitalizedCity, url: `https://leadspotter.in/leads/in/${city}` },
          ],
        }}
      />
      <JsonLd
        type="FAQPage"
        data={{
          faqs: [
            {
              "@type": "Question",
              name: `How can I find businesses in ${capitalizedCity}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `You can use LeadSpotter to extract a complete list of verified businesses across any industry in ${capitalizedCity}. It provides names, verified emails, phone numbers directly from Google Maps.`
              }
            }
          ]
        }}
      />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-32 pb-20 flex-grow">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Top Businesses in {capitalizedCity}</h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Select an industry below to view our comprehensive database of local businesses in {capitalizedCity} and extract their contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {popularNiches.map((niche) => (
              <Link
                key={niche}
                href={`/leads/${niche}/${city}`}
                className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="bg-indigo-50 p-3 mr-3 rounded-lg text-indigo-600 mr-4 group-hover:bg-indigo-100 transition-colors">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h3>
                  <p className="text-sm text-gray-500">View leads</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-3xl bg-indigo-50 p-10 text-center border border-indigo-100">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
              <Search size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Need a specific industry?</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Sign up for free and use our intelligent Google Maps extractor to find exactly the businesses you need in {capitalizedCity}.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
