import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin, Store, CheckCircle } from 'lucide-react';

type Params = Promise<{ niche: string; city: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { niche, city } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Best ${capitalizedNiche} in ${capitalizedCity} | Verified B2B Leads | LeadSpotter`,
    description: `Get a list of verified ${capitalizedNiche} in ${capitalizedCity}. Extract names, phone numbers, and emails for your cold outreach campaigns.`,
    alternates: { canonical: `https://leadspotter.in/leads/${niche}/${city}` },
  };
}

export default async function ProgrammaticLeadsPage({ params }: { params: Params }) {
  const { niche, city } = await params;
  const capitalizedNiche = niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const capitalizedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Mock sample data for pSEO
  const sampleLeads = [
    { name: `${capitalizedNiche} Hub`, city: capitalizedCity, rating: 4.8 },
    { name: `Elite ${capitalizedNiche}`, city: capitalizedCity, rating: 4.9 },
    { name: `Professional ${capitalizedNiche} Solutions`, city: capitalizedCity, rating: 4.7 },
  ];

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd 
        type="FAQPage" 
        data={{ 
          faqs: [
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
                text: `Yes, LeadSpotter enriches basic Google Maps data by crawling business websites to find hidden email addresses for ${capitalizedNiche.toLowerCase()} in the ${capitalizedCity} area.`
              }
            }
          ]
        }} 
      />
      <LandingBanner />
      <LandingHeader />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Verified {capitalizedNiche} in {capitalizedCity}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Are you looking to connect with {capitalizedNiche.toLowerCase()} in {capitalizedCity}? LeadSpotter helps you extract verified business contact information in seconds.
            </p>
          </div>

          <div className="grid gap-4 mb-12">
            <h2 className="text-2xl font-bold mb-4">Sample Data for {capitalizedCity}</h2>
            {sampleLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50 blur-[2px] opacity-60">
                <div className="flex items-center gap-4">
                  <Store className="text-indigo-500" />
                  <div>
                    <p className="font-bold">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{lead.rating} ★</p>
                  <p className="text-xs text-gray-400">Locked</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Unlock 500+ {capitalizedNiche} Leads in {capitalizedCity}</h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">Get verified emails, phone numbers, and social profiles for all {capitalizedNiche.toLowerCase()} in the area.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg">
              Extract All Leads Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
