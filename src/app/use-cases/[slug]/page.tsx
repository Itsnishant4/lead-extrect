import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Megaphone, Briefcase, Home, UserSearch, Store, Wrench,
  ArrowRight, CheckCircle, TrendingUp, Target, Star, Globe, Zap,
} from 'lucide-react';

interface UseCaseData {
  title: string;
  subtitle: string;
  icon: any;
  heroDescription: string;
  painPoints: string[];
  howItWorks: string[];
  results: { value: string; label: string }[];
  testimonial: { quote: string; name: string; title: string };
  faqs: { q: string; a: string }[];
  relatedFeatures: { name: string; slug: string }[];
}

const useCases: Record<string, UseCaseData> = {
  'marketing-agencies': {
    title: 'Lead Generation for Marketing Agencies',
    subtitle: 'Build client prospect lists in minutes, not hours',
    icon: Megaphone,
    heroDescription: 'Marketing agencies use LeadSpotter to build massive prospect lists for cold outreach campaigns. Generate thousands of targeted keywords, extract business data in bulk, and deliver results to clients faster than ever.',
    painPoints: [
      'Manually searching Google Maps is slow and tedious',
      'Finding verified emails for outreach takes hours per campaign',
      'Clients expect results fast — you can\'t afford slow lead sourcing',
      'Managing multiple client campaigns requires scalable tools',
    ],
    howItWorks: [
      'Generate keywords by combining service niches with target cities',
      'Run cloud extraction overnight — no browser needed',
      'Export CSV with emails and phone numbers',
      'Import into your CRM and launch outreach campaigns',
    ],
    results: [
      { value: '80%', label: 'Reduction in prospecting time' },
      { value: '5,000+', label: 'Leads per campaign' },
      { value: '12%', label: 'Cold email response rate' },
    ],
    testimonial: {
      quote: "We went from spending 3 hours per client on prospecting to 15 minutes. Our clients love the volume and quality of leads we deliver.",
      name: "Rahul Mehta",
      title: "Founder, GrowthForce Agency",
    },
    faqs: [
      { q: 'Can I manage multiple client campaigns?', a: 'Yes, you can create separate tasks for each client, each with their own niche and location targeting. All tasks run simultaneously on our cloud.' },
      { q: 'How many leads can I extract for one client?', a: 'There\'s no limit per task. A single campaign can extract thousands of leads depending on the niche and city size.' },
      { q: 'Can I white-label the exports?', a: 'Our CSV exports include all raw data without LeadSpotter branding. You can format and deliver them to clients however you like.' },
    ],
    relatedFeatures: [
      { name: 'Bulk Keyword Generation', slug: 'bulk-keyword-generator' },
      { name: 'Cloud Processing', slug: 'cloud-processing' },
      { name: 'CRM-Ready Export', slug: 'crm-ready-export' },
    ],
  },
  'sales-teams': {
    title: 'Lead Generation for B2B Sales Teams',
    subtitle: 'Fill your pipeline with verified business contacts',
    icon: Briefcase,
    heroDescription: 'Sales teams use LeadSpotter to find decision-makers at local businesses. Extract business data from Google Maps, enrich with direct emails and phone numbers, and build targeted lists segmented by location, category, and rating.',
    painPoints: [
      'Cold calling random numbers wastes time',
      'LinkedIn outreach is limited and expensive',
      'Finding direct decision-maker contacts is hard',
      'CRM data gets stale quickly without fresh sources',
    ],
    howItWorks: [
      'Target specific business categories in your sales territory',
      'Extract leads with full contact details from Google Maps',
      'Enrich with website scraping for direct emails',
      'Export directly to Salesforce, HubSpot, or Pipedrive',
    ],
    results: [
      { value: '3x', label: 'More qualified leads per week' },
      { value: '65%', label: 'Email discovery rate' },
      { value: '1 click', label: 'CRM export' },
    ],
    testimonial: {
      quote: "Our pipeline went from 50 leads per week to 200+. The lead scoring and email verification features mean we only reach out to quality prospects.",
      name: "Aman Gupta",
      title: "CEO, ReachLocal",
    },
    faqs: [
      { q: 'Can I filter leads by rating?', a: 'Yes! Use the "Rating Required" filter in the export dialog to only include businesses with 4+ star ratings in your CSV.' },
      { q: 'Does this work for B2B?', a: 'Absolutely. LeadSpotter extracts business data from Google Maps, which is ideal for B2B sales targeting local businesses, service providers, and companies.' },
      { q: 'How accurate are the phone numbers?', a: 'Phone numbers are pulled directly from Google Maps listings and business websites. They match what businesses publicly list as their contact number.' },
    ],
    relatedFeatures: [
      { name: 'Google Maps Extractor', slug: 'google-maps-extractor' },
      { name: 'Email Enrichment', slug: 'email-enrichment' },
      { name: 'Verified Email Extraction', slug: 'verified-email-extraction' },
    ],
  },
  'real-estate': {
    title: 'Lead Generation for Real Estate Professionals',
    subtitle: 'Find property managers, builders, and local businesses',
    icon: Home,
    heroDescription: 'Real estate agents and property managers use LeadSpotter to identify businesses in specific neighborhoods. Find property management companies, construction firms, interior designers, and other service providers across any city or region.',
    painPoints: [
      'Finding businesses in specific neighborhoods is hard',
      'Property management companies don\'t advertise contact info',
      'Building local business relationships requires leads',
      'Manual research across Google Maps takes days',
    ],
    howItWorks: [
      'Select target neighborhoods or pincodes',
      'Search for real estate-related business categories',
      'Extract contact information including direct phone numbers',
      'Build relationships with local service providers',
    ],
    results: [
      { value: 'Zip-code', label: 'Level targeting precision' },
      { value: '100%', label: 'Public data accuracy' },
      { value: '24/7', label: 'Cloud extraction' },
    ],
    testimonial: {
      quote: "We found 500 property management companies in our target area in one afternoon. This used to take us weeks of manual research.",
      name: "Priya Sharma",
      title: "Head of Sales, MapLeads India",
    },
    faqs: [
      { q: 'Can I target specific pincodes?', a: 'Yes, LeadSpotter supports area-level targeting. You can search for businesses in specific neighborhoods, districts, or zip codes within any city.' },
      { q: 'Is this useful for finding builders and contractors?', a: 'Absolutely. Search for "construction companies", "interior designers", "architects", or any building-related category in your target area.' },
      { q: 'Can I extract data for multiple neighborhoods at once?', a: 'Yes, use the "Target all cities" option with area-wise extraction to cover an entire region automatically.' },
    ],
    relatedFeatures: [
      { name: 'Localized Area Search', slug: 'localized-area-search' },
      { name: 'Bulk Keyword Generation', slug: 'bulk-keyword-generator' },
      { name: 'CRM-Ready Export', slug: 'crm-ready-export' },
    ],
  },
  'freelancers': {
    title: 'Lead Generation for Freelancers & Consultants',
    subtitle: 'Find clients who need your services',
    icon: UserSearch,
    heroDescription: 'Freelance web designers, SEO consultants, and marketing professionals use LeadSpotter to find businesses that need their services. Search for businesses with outdated websites, missing social media presence, or low ratings that could benefit from professional help.',
    painPoints: [
      'Finding new clients consistently is the #1 challenge',
      'Cold outreach requires knowing who to contact',
      'Freelance platforms take 20% commissions',
      'Building a client pipeline from scratch is slow',
    ],
    howItWorks: [
      'Search for businesses in your niche or area',
      'Filter by those without websites or social presence',
      'Extract contact details for personalized outreach',
      'Offer your services to businesses that need help',
    ],
    results: [
      { value: '500', label: 'Free leads per month' },
      { value: '0%', label: 'Platform commission' },
      { value: 'Direct', label: 'Client relationships' },
    ],
    testimonial: {
      quote: "As a freelance web designer, I found 200 local businesses without websites in my city. I closed 15 clients in my first month using LeadSpotter.",
      name: "Sarah Chen",
      title: "Freelance Web Designer",
    },
    faqs: [
      { q: 'Is there a free plan?', a: 'Yes! The Starter plan gives you 500 free leads per month with no credit card required. Perfect for freelancers just getting started.' },
      { q: 'Can I find businesses without websites?', a: 'Yes, use the export filter to require leads that DON\'T have a website — these businesses are prime targets for web design services.' },
      { q: 'How do I use this for local SEO clients?', a: 'Search for businesses in your area with low ratings or missing Google Maps data. These are businesses that need local SEO help.' },
    ],
    relatedFeatures: [
      { name: 'Google Maps Extractor', slug: 'google-maps-extractor' },
      { name: 'Localized Area Search', slug: 'localized-area-search' },
      { name: 'Email Enrichment', slug: 'email-enrichment' },
    ],
  },
  'recruiters': {
    title: 'Lead Generation for Recruiters & Staffing Agencies',
    subtitle: 'Find companies hiring and build employer prospect lists',
    icon: Store,
    heroDescription: 'Recruiters and staffing agencies use LeadSpotter to identify growing companies that are likely hiring. Extract business data to find HR contacts, office managers, and decision-makers at companies across any industry or location.',
    painPoints: [
      'Job boards don\'t show company contact info',
      'LinkedIn InMail credits are expensive',
      'Finding the right person to pitch staffing services is hard',
      'Cold calling reception desks rarely reaches decision-makers',
    ],
    howItWorks: [
      'Search for businesses in high-growth industries',
      'Extract company data including phone and email',
      'Use website enrichment to find HR/office contacts',
      'Reach out with staffing and recruiting proposals',
    ],
    results: [
      { value: '10x', label: 'Faster than LinkedIn search' },
      { value: 'Direct', label: 'Company contact info' },
      { value: 'Bulk', label: 'Extraction for agencies' },
    ],
    testimonial: {
      quote: "We use LeadSpotter to find growing companies in tech hubs. The bulk extraction lets us build massive prospect lists for our staffing outreach campaigns.",
      name: "Vikram Patel",
      title: "Sales Manager, TechBridge",
    },
    faqs: [
      { q: 'Can I find companies by size?', a: 'While Google Maps doesn\'t list company size, you can target business categories that typically match your ideal company profile (e.g., "IT Companies", "Software Companies").' },
      { q: 'Is this useful for executive search?', a: 'Yes, extract company data and use the enrichment feature to find direct contact information for key decision-makers.' },
      { q: 'Can I extract data for multiple industries at once?', a: 'Yes, use the bulk keyword generator to create combinations across multiple business categories and locations.' },
    ],
    relatedFeatures: [
      { name: 'Bulk Keyword Generation', slug: 'bulk-keyword-generator' },
      { name: 'Email Enrichment', slug: 'email-enrichment' },
      { name: 'Cloud Processing', slug: 'cloud-processing' },
    ],
  },
  'home-services': {
    title: 'Lead Generation for Home Service Providers',
    subtitle: 'Find contractors, suppliers, and referral partners',
    icon: Wrench,
    heroDescription: 'Plumbers, electricians, HVAC contractors, and other home service providers use LeadSpotter to find complementary businesses for referral partnerships. Extract data for property managers, real estate agents, and other businesses that regularly need home services.',
    painPoints: [
      'Referral partnerships are hard to build from scratch',
      'Finding property managers who need ongoing services is slow',
      'Competing for the same customers requires better targeting',
      'Local advertising is expensive with uncertain ROI',
    ],
    howItWorks: [
      'Search for property managers, real estate agents, and builders',
      'Extract contact details for partnership outreach',
      'Find other home service providers for referral networks',
      'Target specific neighborhoods where you want to expand',
    ],
    results: [
      { value: 'Local', label: 'Targeting precision' },
      { value: '24/7', label: 'Automated extraction' },
      { value: 'Bulk', label: 'Partner list building' },
    ],
    testimonial: {
      quote: "We built a referral network of 50 real estate agents in our city using LeadSpotter. Each agent now sends us 3-5 plumbing jobs per month.",
      name: "Amit Patel",
      title: "Owner, QuickFix Plumbing",
    },
    faqs: [
      { q: 'Can I find property managers?', a: 'Yes! Search for "property management" in your target area. These businesses regularly need plumbers, electricians, and other home service providers.' },
      { q: 'How do I use this for referral partnerships?', a: 'Extract data for complementary businesses (real estate agents, builders, interior designers) and reach out with partnership proposals.' },
      { q: 'Is this better than Google Ads?', a: 'LeadSpotter gives you direct contact information for businesses, enabling outbound partnerships. Google Ads is inbound marketing. They complement each other.' },
    ],
    relatedFeatures: [
      { name: 'Localized Area Search', slug: 'localized-area-search' },
      { name: 'Google Maps Extractor', slug: 'google-maps-extractor' },
      { name: 'CRM-Ready Export', slug: 'crm-ready-export' },
    ],
  },
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return Object.keys(useCases).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const useCase = useCases[slug];
  if (!useCase) return { title: 'Use Case Not Found' };

  return {
    title: `${useCase.title} | LeadSpotter`,
    description: useCase.heroDescription.slice(0, 160),
    keywords: [useCase.title.toLowerCase(), 'lead generation', 'google maps', 'b2b leads'],
    alternates: { canonical: `https://leadspotter.in/use-cases/${slug}` },
    openGraph: {
      title: `${useCase.title} | LeadSpotter`,
      description: useCase.heroDescription.slice(0, 160),
      url: `https://leadspotter.in/use-cases/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${useCase.title} | LeadSpotter`,
      description: useCase.heroDescription.slice(0, 160),
      images: ['https://leadspotter.in/opengraph-image'],
    },
  };
}

export default async function UseCasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const useCase = useCases[slug];
  if (!useCase) notFound();

  return (
    <div className="bg-white text-gray-900 antialiased">
      <JsonLd type="BreadcrumbList" data={{
        items: [
          { name: "Home", url: "https://leadspotter.in" },
          { name: "Use Cases", url: "https://leadspotter.in/use-cases" },
          { name: useCase.title, url: `https://leadspotter.in/use-cases/${slug}` },
        ],
      }} />
      <JsonLd type="FAQPage" data={{
        faqs: useCase.faqs.map(f => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }} />
      <LandingBanner />
      <LandingHeader />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <useCase.icon size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{useCase.title}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl leading-relaxed">{useCase.subtitle}</p>
          <p className="text-gray-500 max-w-3xl leading-relaxed mb-8">{useCase.heroDescription}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Challenges</p>
            <h2 className="text-3xl font-semibold text-gray-900">Pain points we solve</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {useCase.painPoints.map((p) => (
              <div key={p} className="flex items-start gap-3 p-5 rounded-xl bg-white border border-gray-100">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span className="font-semibold text-gray-800">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Workflow</p>
            <h2 className="text-3xl font-semibold text-gray-900">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {useCase.howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg">{i + 1}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50/40 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6">
            {useCase.results.map((r) => (
              <div key={r.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{r.value}</p>
                <p className="text-sm text-gray-500 mt-1">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
            &ldquo;{useCase.testimonial.quote}&rdquo;
          </blockquote>
          <p className="font-bold text-lg">{useCase.testimonial.name}</p>
          <p className="text-indigo-300">{useCase.testimonial.title}</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-semibold text-gray-900">Common questions</h2>
          </div>
          {useCase.faqs.map((faq, i) => (
            <details key={i} className="group border-b border-gray-100">
              <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
              </summary>
              <p className="text-gray-600 pb-5 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-24 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Related Features</p>
            <h2 className="text-3xl font-semibold text-gray-900">Tools you'll use</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {useCase.relatedFeatures.map((f) => (
              <Link key={f.slug} href={`/features/${f.slug}`} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 mb-2">{f.name}</h3>
                <span className="text-xs font-semibold text-indigo-500 inline-flex items-center gap-1">Learn more <ArrowRight size={11} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl bg-indigo-900 p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start generating leads today</h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">Free plan available. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors">
              Get Started for Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
