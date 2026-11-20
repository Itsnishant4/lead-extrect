import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { seoHubRegistry } from '@/lib/db/schema';
import { sql, like } from 'drizzle-orm';

type Params = Promise<{ niche: string }>;

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { niche } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const searchNiche = niche.replace(/-/g, ' ');

  // Check if data exists to prevent index bloat
  let hasData = false;
  try {
    const count = await db.select({ total: sql<number>`SUM(${seoHubRegistry.totalLeads})` })
      .from(seoHubRegistry)
      .where(like(seoHubRegistry.niche, `%${searchNiche}%`));
    hasData = Number(count[0]?.total || 0) > 0;
  } catch {}

  return {
    title: `Best ${capitalizedNiche} Leads Database | B2B Directory | LeadSpotter`,
    description: `Discover top ${capitalizedNiche} leads across multiple cities. Extract names, emails, and phone numbers for your next outreach campaign.`,
    alternates: { canonical: `https://leadspotter.in/leads/${niche}` },
    robots: hasData ? { index: true, follow: true } : { index: false, follow: true },
    keywords: [`${capitalizedNiche} leads`, `${capitalizedNiche} database`, 'b2b leads', 'google maps leads', 'business directory', `${capitalizedNiche} email list`],
    openGraph: {
      title: `Best ${capitalizedNiche} Leads Database | LeadSpotter`,
      description: `Discover top ${capitalizedNiche} leads across multiple cities. Extract names, emails, and phone numbers.`,
      url: `https://leadspotter.in/leads/${niche}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${capitalizedNiche} Leads Database | LeadSpotter`,
      description: `Discover top ${capitalizedNiche} leads across multiple cities.`,
      images: ['https://leadspotter.in/opengraph-image'],
    },
  };
}

export default async function NicheHubPage({ params }: { params: Params }) {
  const { niche } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const searchNiche = niche.replace(/-/g, ' ');

  // Fetch cities that have data for this niche
  let popularCities: string[] = ['mumbai', 'delhi', 'bangalore', 'pune', 'chennai', 'hyderabad', 'kolkata', 'ahmedabad', 'jaipur', 'surat'];
  try {
    const dbCities = await db.select({ city: seoHubRegistry.city })
      .from(seoHubRegistry)
      .where(like(seoHubRegistry.niche, `%${searchNiche}%`))
      .groupBy(seoHubRegistry.city)
      .orderBy(sql`SUM(${seoHubRegistry.totalLeads}) DESC`)
      .limit(20);
    if (dbCities.length > 0) {
      popularCities = dbCities.map(c => String(c.city).toLowerCase().replace(/\s+/g, '-'));
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
            { name: capitalizedNiche, url: `https://leadspotter.in/leads/${niche}` },
          ],
        }}
      />
      <JsonLd
        type="FAQPage"
        data={{
          faqs: [
            {
              "@type": "Question",
              name: `How can I find ${capitalizedNiche.toLowerCase()} leads?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `You can use LeadSpotter to extract a complete list of ${capitalizedNiche.toLowerCase()} across any city. It provides names, verified emails, phone numbers directly from Google Maps.`
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
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Verified {capitalizedNiche} Leads</h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Select a city below to view our comprehensive database of {capitalizedNiche.toLowerCase()} and extract their business contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {popularCities.map((city) => (
              <Link
                key={city}
                href={`/leads/${niche}/${city}`}
                className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="bg-indigo-50 p-3 mr-3 rounded-lg text-indigo-600 mr-4 group-hover:bg-indigo-100 transition-colors">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {city.charAt(0).toUpperCase() + city.slice(1)}
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
            <h2 className="text-2xl font-bold mb-4">Can't find your city?</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Sign up for free and use our intelligent Google Maps extractor to find {capitalizedNiche.toLowerCase()} anywhere in the world.</p>
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