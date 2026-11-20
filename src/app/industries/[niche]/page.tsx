import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, Globe, Star } from 'lucide-react';
import { notFound } from 'next/navigation';

type Params = Promise<{ niche: string }>;

const industriesData: Record<string, {
  name: string;
  description: string;
  keywords: string[];
  stats: string;
  useCase: string;
}> = {
  ' ': {
    name: 'Dentists',
    description: 'Extract verified dental practice leads from Google Maps. Find dentist offices with contact information, ratings, and social media profiles.',
    keywords: ['dentist', 'dental clinic', 'dental office', 'orthodontist', 'dental care'],
    stats: 'Over 200,000 dental practices across major cities',
    useCase: 'Perfect for dental supply companies, marketing agencies, and healthcare recruiters targeting dental practices.',
  },
  'restaurants': {
    name: 'Restaurants',
    description: 'Extract restaurant and food business leads from Google Maps. Get complete contact data for restaurants, cafes, and food establishments.',
    keywords: ['restaurant', 'cafe', 'food', 'dining', 'takeaway'],
    stats: 'Over 1 million restaurants in top cities',
    useCase: 'Ideal for food delivery services, restaurant suppliers, POS system vendors, and food industry marketers.',
  },
  'real-estate': {
    name: 'Real Estate',
    description: 'Extract real estate agent and agency leads from Google Maps. Find property dealers, brokers, and real estate offices.',
    keywords: ['real estate agent', 'property dealer', 'real estate agency', 'broker'],
    stats: 'Over 500,000 real estate professionals',
    useCase: 'Great for mortgage lenders, property listing services, and real estate technology companies.',
  },
  'gyms': {
    name: 'Gyms & Fitness',
    description: 'Extract gym and fitness center leads from Google Maps. Get contact data for gyms, fitness studios, and wellness centers.',
    keywords: ['gym', 'fitness center', 'yoga studio', 'crossfit', 'fitness'],
    stats: 'Over 100,000 fitness facilities',
    useCase: 'Perfect for fitness equipment suppliers, supplement companies, and gym management software vendors.',
  },
  'salons': {
    name: 'Salons & Beauty',
    description: 'Extract beauty salon and spa leads from Google Maps. Find hair salons, nail studios, and beauty parlors.',
    keywords: ['salon', 'beauty parlour', 'hair salon', 'spa', 'nail studio'],
    stats: 'Over 300,000 beauty businesses',
    useCase: 'Ideal for beauty product distributors, salon software companies, and beauty industry recruiters.',
  },
  'lawyers': {
    name: 'Lawyers',
    description: 'Extract law firm and attorney leads from Google Maps. Find lawyers, legal consultants, and law offices.',
    keywords: ['lawyer', 'attorney', 'law firm', 'legal consultant', 'advocate'],
    stats: 'Over 150,000 legal professionals',
    useCase: 'Great for legal technology companies, court reporting services, and legal marketing agencies.',
  },
  'plumbers': {
    name: 'Plumbers',
    description: 'Extract plumbing service leads from Google Maps. Get contact data for plumbers and plumbing companies.',
    keywords: ['plumber', 'plumbing service', 'pipe repair', 'drain cleaning'],
    stats: 'Over 100,000 plumbing businesses',
    useCase: 'Perfect for plumbing supply companies, home warranty providers, and home service aggregators.',
  },
  'electricians': {
    name: 'Electricians',
    description: 'Extract electrical contractor leads from Google Maps. Find electricians and electrical service providers.',
    keywords: ['electrician', 'electrical contractor', 'electrical service', 'wiring'],
    stats: 'Over 80,000 electrical businesses',
    useCase: 'Ideal for electrical supply distributors, solar panel installers, and smart home companies.',
  },
};

export async function generateStaticParams() {
  return Object.keys(industriesData).map((niche) => ({ niche }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { niche } = await params;
  const data = industriesData[niche];
  
  if (!data) return { title: 'Not Found' };

  return {
    title: `${data.name} Leads — Extract ${data.name} Business Data from Google Maps`,
    description: `${data.description} Free ${data.name.toLowerCase()} leads available. Start extracting ${data.name.toLowerCase()} contact data today.`,
    keywords: [
      ...data.keywords,
      `${data.name.toLowerCase()} leads`,
      `${data.name.toLowerCase()} email list`,
      `${data.name.toLowerCase()} phone numbers`,
      `extract ${data.name.toLowerCase()} from google maps`,
    ],
    alternates: { canonical: `https://leadspotter.in/industries/${niche}` },
    openGraph: {
      title: `${data.name} Leads from Google Maps | LeadSpotter`,
      description: data.description,
      url: `https://leadspotter.in/industries/${niche}`,
    },
  };
}

export default async function IndustryPage({ params }: { params: Params }) {
  const { niche } = await params;
  const data = industriesData[niche];

  if (!data) notFound();

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd type="BreadcrumbList" data={{
        items: [
          { name: "Home", url: "https://leadspotter.in" },
          { name: "Industries", url: "https://leadspotter.in/industries" },
          { name: data.name, url: `https://leadspotter.in/industries/${niche}` },
        ],
      }} />
      <JsonLd type="FAQPage" data={{
        faqs: [
          {
            "@type": "Question",
            name: `How many ${data.name.toLowerCase()} can I extract?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${data.stats}. You can extract all of them with LeadSpotter's bulk extraction feature.`,
            },
          },
          {
            "@type": "Question",
            name: `What data can I get for ${data.name.toLowerCase()}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Business name, address, phone, email, website, rating, reviews, social media profiles, and operating hours.",
            },
          },
        ],
      }} />
      <LandingBanner />
      <LandingHeader />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {data.name} Leads from Google Maps
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {data.description}
            </p>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-700 transition-colors">
                Extract {data.name} Leads Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <MapPin className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{data.stats.split(' ')[0]}+</div>
              <div className="text-gray-500">{data.name} Businesses</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <Phone className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-gray-500">Phone Numbers</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <Star className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-gray-500">User Rating</div>
            </div>
          </div>

          {/* Use Case */}
          <div className="bg-indigo-50 rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold mb-4">Who Should Use This?</h2>
            <p className="text-gray-700 text-lg">{data.useCase}</p>
          </div>

          {/* Sample Keywords */}
          <div className="mb-16">
            <h2 className="text-xl font-bold mb-4">Example Search Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((kw) => (
                <span key={kw} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-700 transition-colors">
              Start Extracting {data.name} Leads <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
