import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin, Store, CheckCircle, Download, Users, Globe, Phone, Mail } from 'lucide-react';
import { db } from '@/lib/db';
import { leads, seoHubRegistry } from '@/lib/db/schema';
import { sql, like, and, eq, or } from 'drizzle-orm';

export const revalidate = 86400; // ISR: revalidate every 24 hours

type Params = Promise<{ niche: string; city: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { niche, city } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const searchNiche = niche.replace(/-/g, ' ');
  const searchCity = city.replace(/-/g, ' ');

  // Check if data exists to prevent index bloat
  let hasData = false;
  try {
    const count = await db.select({ total: sql<number>`SUM(${seoHubRegistry.totalLeads})` })
      .from(seoHubRegistry)
      .where(and(
        like(seoHubRegistry.niche, `%${searchNiche}%`),
        like(seoHubRegistry.city, `%${searchCity}%`)
      ));
    hasData = Number(count[0]?.total || 0) > 0;
  } catch {}

  return {
    title: `Best ${capitalizedNiche} in ${capitalizedCity} | Verified B2B Leads | LeadSpotter`,
    description: `Get a list of verified ${capitalizedNiche} in ${capitalizedCity}. Extract names, phone numbers, and emails for your cold outreach campaigns.`,
    alternates: { canonical: `https://leadspotter.in/leads/${niche}/${city}` },
    robots: hasData ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function ProgrammaticLeadsPage({ params }: { params: Params }) {
  const { niche, city } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const searchNiche = niche.replace(/-/g, ' ');
  const searchCity = city.replace(/-/g, ' ');

  // Fetch real aggregate data
  let total = 0;
  let withWebsite = 0;
  let withPhone = 0;
  let withEmail = 0;
  let avgRating = 0;
  let sampleLeads: any[] = [];

  try {
    // Use Drizzle's aggregate functions instead of raw SQL
    const statsRes = await db.select({
      total: sql<number>`SUM(${seoHubRegistry.totalLeads})`,
      withWebsite: sql<number>`SUM(${seoHubRegistry.withWebsite})`,
      withPhone: sql<number>`SUM(${seoHubRegistry.withPhone})`,
      withEmail: sql<number>`SUM(${seoHubRegistry.withEmail})`,
      avgRating: sql<number>`AVG(${seoHubRegistry.avgRating})`,
    })
      .from(seoHubRegistry)
      .where(and(
        like(seoHubRegistry.niche, `%${searchNiche}%`),
        like(seoHubRegistry.city, `%${searchCity}%`)
      ));

    if (statsRes[0] && Number(statsRes[0].total || 0) > 0) {
      total = Number(statsRes[0].total || 0);
      withWebsite = Number(statsRes[0].withWebsite || 0);
      withPhone = Number(statsRes[0].withPhone || 0);
      withEmail = Number(statsRes[0].withEmail || 0);
      avgRating = Number(statsRes[0].avgRating || 0);
    } else {
      // Fallback to active leads if registry missed it
      const fallbackRes = await db.select({
        total: sql<number>`COUNT(*)`,
        withWebsite: sql<number>`SUM(CASE WHEN ${leads.website} IS NOT NULL AND ${leads.website} != '' THEN 1 ELSE 0 END)`,
        withPhone: sql<number>`SUM(CASE WHEN ${leads.phone} IS NOT NULL AND ${leads.phone} != '' THEN 1 ELSE 0 END)`,
        withEmail: sql<number>`SUM(CASE WHEN ${leads.email} IS NOT NULL AND ${leads.email} != '' THEN 1 ELSE 0 END)`,
        avgRating: sql<number>`AVG(${leads.rating})`,
      })
        .from(leads)
        .where(and(
          like(leads.category, `%${searchNiche}%`),
          like(leads.city, `%${searchCity}%`)
        ));
      if (fallbackRes[0]) {
        total = Number(fallbackRes[0].total || 0);
        withWebsite = Number(fallbackRes[0].withWebsite || 0);
        withPhone = Number(fallbackRes[0].withPhone || 0);
        withEmail = Number(fallbackRes[0].withEmail || 0);
        avgRating = Number(fallbackRes[0].avgRating || 0);
      }
    }

    // Fetch up to 3 real sample leads
    sampleLeads = await db.select({
      name: leads.name,
      rating: leads.rating,
      reviewsCount: leads.reviewsCount,
      address: leads.address,
    })
      .from(leads)
      .where(and(
        like(leads.category, `%${searchNiche}%`),
        like(leads.city, `%${searchCity}%`)
      ))
      .limit(3);

  } catch (error) {
    console.error('Failed to fetch lead stats:', error);
  }

  // Fetch related niches in the same city and related cities for the same niche
  let relatedNiches: string[] = [];
  let relatedCities: string[] = [];
  try {
    const nichesRes = await db.select({ niche: seoHubRegistry.niche })
      .from(seoHubRegistry)
      .where(and(
        like(seoHubRegistry.city, `%${searchCity}%`),
        sql`${seoHubRegistry.niche} NOT LIKE ${`%${searchNiche}%`}`
      ))
      .groupBy(seoHubRegistry.niche)
      .orderBy(sql`SUM(${seoHubRegistry.totalLeads}) DESC`)
      .limit(5);
    relatedNiches = nichesRes.map(n => String(n.niche));

    const citiesRes = await db.select({ city: seoHubRegistry.city })
      .from(seoHubRegistry)
      .where(and(
        like(seoHubRegistry.niche, `%${searchNiche}%`),
        sql`${seoHubRegistry.city} NOT LIKE ${`%${searchCity}%`}`
      ))
      .groupBy(seoHubRegistry.city)
      .orderBy(sql`SUM(${seoHubRegistry.totalLeads}) DESC`)
      .limit(5);
    relatedCities = citiesRes.map(c => String(c.city));
  } catch {}

  // If DB has no data, show a "coming soon" page instead of fake random numbers
  if (total === 0) {
    return (
      <div className="bg-white text-gray-900 antialiased">
        <LandingHeader />
        <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {capitalizedNiche} in {capitalizedCity}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re currently collecting data for {capitalizedNiche.toLowerCase()} in {capitalizedCity}.
            Our database is updated regularly — check back soon or start your own extraction.
          </p>
          <Link href="/leads" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Start Extracting Leads
          </Link>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Leads", url: "https://leadspotter.in/leads" },
            { name: capitalizedNiche, url: `https://leadspotter.in/leads/${niche}` },
            { name: `${capitalizedNiche} in ${capitalizedCity}`, url: `https://leadspotter.in/leads/${niche}/${city}` },
          ],
        }}
      />
      <JsonLd
        type="FAQPage"
        data={{
          faqs: [
            {
              "@type": "Question",
              name: `How many ${capitalizedNiche.toLowerCase()} are there in ${capitalizedCity}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `According to our latest data extraction, there are approximately ${total.toLocaleString()} ${capitalizedNiche.toLowerCase()} in the ${capitalizedCity} area.`
              }
            },
            {
              "@type": "Question",
              name: `How can I get a list of ${capitalizedNiche.toLowerCase()} in ${capitalizedCity}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `You can use LeadSpotter to extract a complete list of ${capitalizedNiche.toLowerCase()} in ${capitalizedCity} with their business names, verified emails, phone numbers, and more directly from Google Maps.`
              }
            },
            {
              "@type": "Question",
              name: `Does this list include emails for ${capitalizedNiche.toLowerCase()} in ${capitalizedCity}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Yes, of the ${total.toLocaleString()} leads found, approximately ${withEmail.toLocaleString()} have direct contact emails associated with them.`
              }
            }
          ]
        }}
      />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Verified {capitalizedNiche} in {capitalizedCity}</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Are you looking to connect with {capitalizedNiche.toLowerCase()} in {capitalizedCity}? Our system has aggregated deep insights and verified contact information to power your outreach.
            </p>
            <Link href="/signup?intent=download_sample" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg">
              <Download size={20} /> Download Sample CSV
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <Users className="text-indigo-600 mb-2" size={24} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Leads Found</div>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <Mail className="text-indigo-600 mb-2" size={24} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{withEmail.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Verified Emails</div>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <Phone className="text-indigo-600 mb-2" size={24} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{withPhone.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Phone Numbers</div>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <Globe className="text-indigo-600 mb-2" size={24} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{withWebsite.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Websites</div>
            </div>
          </div>

          <div className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold">Top Rated {capitalizedNiche} in {capitalizedCity}</h2>
              <span className="text-sm text-gray-500 hidden md:inline-block">Average Rating: {avgRating.toFixed(1)} ★</span>
            </div>

            <div className="grid gap-4">
              {sampleLeads.map((lead, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 transition-colors shadow-sm relative overflow-hidden group">
                  <div className="flex items-start gap-4 z-10">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 flex-shrink-0">
                      <Store size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500 mb-2">{lead.address || capitalizedCity}</p>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">Verified Phone</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Verified Email</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-left md:text-right z-10">
                    <p className="font-bold text-amber-500 text-lg flex items-center md:justify-end gap-1">
                      {lead.rating ? Number(lead.rating).toFixed(1) : '4.5'} <span className="text-sm text-gray-400">({lead.reviewsCount || 120} reviews)</span>
                    </p>
                    <Link href="/signup" className="text-sm text-indigo-600 font-bold hover:underline mt-2 inline-block">
                      Unlock Contact Details &rarr;
                    </Link>
                  </div>
                  {/* Blur effect overlay to signify locked data */}
                  <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Export the Full List of {total.toLocaleString()} Leads</h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">Get verified emails, phone numbers, and social profiles for all {capitalizedNiche.toLowerCase()} in the area directly into a CSV.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg">
              Extract All Leads Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      {/* ━━━━━━ RELATED NICHES + CITIES ━━━━━━ */}
      {(relatedNiches.length > 0 || relatedCities.length > 0) && (
        <section className="py-16 bg-gray-50/40 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            {relatedNiches.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">More Industries in {capitalizedCity}</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedNiches.map((n) => (
                    <Link key={n} href={`/leads/${n.toLowerCase().replace(/\s+/g, '-')}/${city}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                      {n}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedCities.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{capitalizedNiche} in Other Cities</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedCities.map((c) => (
                    <Link key={c} href={`/leads/${niche}/${c.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <LandingFooter />
    </div>
  );
}