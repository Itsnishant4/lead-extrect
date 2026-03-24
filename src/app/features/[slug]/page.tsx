import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Search, Mail, Layers, MapPin, Cloud, Zap, Database,
  Users, BarChart3, Shield, Clock, Globe, Download, Star, ChevronRight,
  TrendingUp, Target, Repeat, Sparkles, Phone, FileText, Settings,
} from 'lucide-react';

/* ────────────────────────────────
   FEATURE DATA
   ──────────────────────────────── */

interface FeatureData {
  title: string;
  description: string;
  icon: any;
  heroSubtitle: string;
  longDescription: string;
  benefits: string[];
  stats: { value: string; label: string; icon: any }[];
  steps: { title: string; desc: string; icon: any }[];
  comparison: { before: string; after: string }[];
  faqs: { q: string; a: string }[];
  testimonial: { quote: string; name: string; title: string };
  relatedFeatures: string[];
}

const features: Record<string, FeatureData> = {
  'google-maps-extractor': {
    title: 'Google Maps Lead Extractor',
    description: 'Extract business data from Google Maps in bulk. Get names, addresses, ratings, and more automatically.',
    icon: Search,
    heroSubtitle: 'Extract thousands of verified business leads from Google Maps in minutes, not hours.',
    longDescription: 'Our Google Maps Extractor is designed for high-volume lead generation. It simulates human behavior to navigate through map results and capture every detail about local businesses — names, addresses, phone numbers, emails, ratings, reviews, social profiles, and operating hours.',
    benefits: [
      'Extract business names, addresses, phone numbers, and emails',
      'Capture ratings, review counts, and operating hours',
      'Discover social media profiles (Facebook, Instagram, LinkedIn)',
      'Get website URLs and scraped contact information',
      'GPS coordinates and Google Maps direction links',
      'Business category and service classifications',
    ],
    stats: [
      { value: '10M+', label: 'Leads Extracted', icon: Users },
      { value: '98%', label: 'Data Accuracy', icon: Shield },
      { value: '50+', label: 'Countries Covered', icon: Globe },
      { value: '2min', label: 'Avg. Extraction Time', icon: Clock },
    ],
    steps: [
      { title: 'Enter your niche', desc: 'Type a business category like "Dentist", "Restaurant", or "Digital Marketing Agency".', icon: Target },
      { title: 'Select location', desc: 'Choose a country, state, and city — or target all cities in a state at once.', icon: MapPin },
      { title: 'Generate keywords', desc: 'Our system creates thousands of search combinations automatically.', icon: Sparkles },
      { title: 'Start extraction', desc: 'Cloud servers run 24/7 to extract and enrich every lead.', icon: Cloud },
      { title: 'Download results', desc: 'Export clean, CRM-ready CSV files with all the data you need.', icon: Download },
    ],
    comparison: [
      { before: 'Manual Google Maps search: 2-3 leads per minute', after: 'Automated extraction: 50-100 leads per minute' },
      { before: 'Copy-paste data into spreadsheets', after: 'Auto-export to CSV with all fields populated' },
      { before: 'No email or phone data from Maps alone', after: 'Website scraping finds hidden contact info' },
      { before: 'Can only search one area at a time', after: 'Bulk extraction across hundreds of locations' },
    ],
    faqs: [
      { q: 'How many leads can I extract at once?', a: 'There\'s no limit per extraction task. You can run multiple tasks simultaneously depending on your plan — Free: 1 task, Pro: 3 tasks, Enterprise: 10 tasks.' },
      { q: 'Is the data always up to date?', a: 'Yes. Every extraction pulls live data from Google Maps at the moment of the search. We don\'t use cached or stale databases.' },
      { q: 'Can I extract leads from any country?', a: 'Yes, LeadSpotter works globally. We support all countries where Google Maps has business listings.' },
      { q: 'What happens if Google Maps blocks the extraction?', a: 'Our cloud infrastructure uses rotating proxies and human-like behavior patterns to avoid detection. Failed requests are automatically retried with different parameters.' },
    ],
    testimonial: {
      quote: "We extracted 15,000 restaurant leads across 50 cities in India in a single weekend. This tool saved us months of manual work.",
      name: "Rajesh Kumar",
      title: "CEO, FoodBiz Connect",
    },
    relatedFeatures: ['bulk-keyword-generator', 'email-enrichment', 'crm-ready-export'],
  },
  'email-enrichment': {
    title: 'B2B Email Finder & Enrichment',
    description: 'Find verified business emails and social profiles by automatically crawling business websites.',
    icon: Mail,
    heroSubtitle: 'Go beyond Google Maps data. Find hidden emails, phones, and social profiles from business websites.',
    longDescription: 'Our enrichment engine visits every business website to discover hidden contact information. While Google Maps gives you the basics, we dig deeper — crawling contact pages, about pages, and footer sections to extract direct emails, phone numbers, and social media links that businesses don\'t always list on Maps.',
    benefits: [
      'Direct email extraction from business websites',
      'Phone number discovery from contact pages',
      'Social media profile detection (Facebook, Instagram, LinkedIn, Twitter)',
      'Automatic email format validation',
      'Deduplication across multiple data sources',
      'Business website technology detection',
    ],
    stats: [
      { value: '65%', label: 'Email Discovery Rate', icon: Mail },
      { value: '3M+', label: 'Emails Enriched', icon: Database },
      { value: '99.2%', label: 'Validation Accuracy', icon: Shield },
      { value: '<2s', label: 'Per Website Crawl', icon: Clock },
    ],
    steps: [
      { title: 'Run an extraction', desc: 'Start with our Google Maps extractor to get base lead data.', icon: Search },
      { title: 'Auto-enrichment begins', desc: 'Our engine visits each business website automatically.', icon: Globe },
      { title: 'Contact discovery', desc: 'We scan contact pages, about pages, and footers for emails and phones.', icon: Mail },
      { title: 'Validation', desc: 'Every email is checked for format validity and domain existence.', icon: Shield },
      { title: 'Export enriched data', desc: 'Download your leads with all enriched fields included.', icon: Download },
    ],
    comparison: [
      { before: 'Google Maps shows only basic info', after: 'Website scraping finds direct emails and phones' },
      { before: 'Manually visiting each website takes hours', after: 'Automated crawling processes thousands per hour' },
      { before: 'No way to verify email validity', after: 'Automatic format and domain validation built-in' },
      { before: 'Social profiles require separate searches', after: 'All social links detected automatically' },
    ],
    faqs: [
      { q: 'How does email enrichment work?', a: 'After extracting leads from Google Maps, our system automatically visits each business\'s website and scans for contact information — emails, phone numbers, and social media links.' },
      { q: 'What is the email discovery rate?', a: 'On average, we find valid emails for 60-70% of businesses. This varies by industry — professional services tend to have higher rates than retail.' },
      { q: 'Are the emails verified?', a: 'Yes, every email goes through format validation and domain checking. We verify that the email address follows valid formatting rules and that the domain exists.' },
      { q: 'Can I enrich leads I already have?', a: 'Yes! You can import existing lead lists and run them through our enrichment engine to add missing emails, phones, and social profiles.' },
    ],
    testimonial: {
      quote: "The enrichment feature alone is worth the subscription. We went from 20% email coverage to 65% overnight. Our cold outreach campaigns finally have enough volume.",
      name: "Sarah Chen",
      title: "Head of Growth, DataDriven Co.",
    },
    relatedFeatures: ['google-maps-extractor', 'verified-email-extraction', 'crm-ready-export'],
  },
  'bulk-keyword-generator': {
    title: 'Bulk Keyword Combination Generator',
    description: 'Generate thousands of targeted keywords by combining niches and locations in one click.',
    icon: Layers,
    heroSubtitle: 'Generate 5,000+ keyword combinations from hundreds of niches and cities in one click.',
    longDescription: 'Manually typing search queries one by one is a waste of time. Our keyword generator lets you select multiple business niches and locations, then automatically creates every possible combination — giving you thousands of targeted search queries to extract leads from.',
    benefits: [
      'One-click keyword generation from niches + locations',
      '100+ preset business niches to choose from',
      'Custom niche input for any business type',
      'City, state, and country-level targeting',
      'Area-wise keyword generation for deeper extraction',
      'Export keyword lists for external use',
    ],
    stats: [
      { value: '5,000+', label: 'Keywords per Generation', icon: Layers },
      { value: '100+', label: 'Preset Niches', icon: Target },
      { value: '50+', label: 'Countries Supported', icon: Globe },
      { value: '10x', label: 'Faster Than Manual', icon: TrendingUp },
    ],
    steps: [
      { title: 'Select niche', desc: 'Pick from 100+ presets like "Dentist", "Real Estate Agency", or type your own.', icon: Target },
      { title: 'Choose location', desc: 'Select country, state, and city — or target all cities in a state.', icon: MapPin },
      { title: 'Generate', desc: 'Click generate and get thousands of keyword combinations instantly.', icon: Sparkles },
      { title: 'Review & edit', desc: 'Preview your keywords, remove any you don\'t want, or copy them.', icon: FileText },
      { title: 'Start extraction', desc: 'Use the keywords directly to start a bulk extraction task.', icon: Zap },
    ],
    comparison: [
      { before: 'Manually typing 50 search queries', after: 'Auto-generate 5,000 combinations in seconds' },
      { before: 'Searching one city at a time', after: 'Bulk targeting across hundreds of cities' },
      { before: 'No area-level targeting', after: 'Zip-code and neighborhood precision' },
      { before: 'Forgetting which queries you\'ve tried', after: 'Saved keyword history for reuse' },
    ],
    faqs: [
      { q: 'How many keywords can I generate?', a: 'You can generate up to 10,000 keyword combinations in a single batch. For larger needs, split across multiple batches.' },
      { q: 'Can I use my own custom niches?', a: 'Yes! While we offer 100+ preset niches, you can type any business type as a custom niche for maximum flexibility.' },
      { q: 'What is area-wise extraction?', a: 'Instead of just "Dentist in Mumbai", we generate keywords for every area/neighborhood: "Dentist in Andheri", "Dentist in Bandra", etc. This finds leads that broad searches miss.' },
      { q: 'Can I export the keyword list?', a: 'Yes, you can copy keywords to clipboard or export them. You can also save keyword sessions and reload them later.' },
    ],
    testimonial: {
      quote: "The bulk keyword generator is a game-changer. We used to spend hours creating search queries manually. Now we generate thousands in seconds and launch campaigns immediately.",
      name: "Priya Sharma",
      title: "Head of Sales, MapLeads India",
    },
    relatedFeatures: ['google-maps-extractor', 'localized-area-search', 'cloud-processing'],
  },
  'localized-area-search': {
    title: 'Localized Area Search',
    description: 'Pinpoint businesses with zip-code, neighborhood, and city-level precision targeting.',
    icon: MapPin,
    heroSubtitle: 'Go beyond city-level search. Target specific neighborhoods, zip codes, and districts.',
    longDescription: 'Most lead extraction tools only let you search by city name. LeadSpotter goes deeper — letting you target specific neighborhoods, zip codes, and districts within a city. This hyper-local precision finds businesses that broader searches miss, giving you a competitive edge in local markets.',
    benefits: [
      'Zip-code level business targeting',
      'Neighborhood and district filtering',
      'City + area-level keyword combinations',
      'GPS coordinate-based precision',
      'Multi-area batch extraction',
      'Area-specific lead deduplication',
    ],
    stats: [
      { value: '3x', label: 'More Leads Found', icon: TrendingUp },
      { value: '10K+', label: 'Areas Supported', icon: MapPin },
      { value: '95%', label: 'Location Accuracy', icon: Shield },
      { value: '500+', label: 'Cities with Area Data', icon: Globe },
    ],
    steps: [
      { title: 'Select your city', desc: 'Choose the city you want to target from our database.', icon: MapPin },
      { title: 'Pick specific areas', desc: 'Select neighborhoods, districts, or zip codes within the city.', icon: Target },
      { title: 'Combine with niche', desc: 'Enter your business niche to create area-specific search queries.', icon: Layers },
      { title: 'Extract leads', desc: 'Our system searches each area separately for deeper results.', icon: Search },
      { title: 'Get consolidated results', desc: 'All area results are merged and deduplicated automatically.', icon: Download },
    ],
    comparison: [
      { before: 'Search "Dentist in Mumbai" — get surface-level results', after: 'Search "Dentist in Andheri" — find hidden local practices' },
      { before: 'Missing businesses in smaller neighborhoods', after: 'Coverage across every area and district' },
      { before: 'Duplicate leads from overlapping searches', after: 'Smart deduplication across all areas' },
      { before: 'One search per city', after: 'Hundreds of area searches per city' },
    ],
    faqs: [
      { q: 'How many areas can I target at once?', a: 'You can target all areas in a city at once. Our system automatically generates area-specific keywords and extracts leads from each one.' },
      { q: 'Do you have area data for all cities?', a: 'We have area data for 500+ major cities globally. For cities without area data, you can still search by city name.' },
      { q: 'Will I get duplicate leads across areas?', a: 'No. Our system automatically deduplicates leads based on business name, address, and phone number across all areas.' },
      { q: 'Is area search slower than city search?', a: 'It takes longer because we\'re searching more locations, but our cloud infrastructure runs all area searches in parallel. A full city area search typically completes in 1-3 hours.' },
    ],
    testimonial: {
      quote: "We were missing 40% of leads by only searching at the city level. Area search found thousands of hidden businesses in neighborhoods we never thought to search.",
      name: "Amit Patel",
      title: "Sales Director, LocalReach",
    },
    relatedFeatures: ['bulk-keyword-generator', 'google-maps-extractor', 'cloud-processing'],
  },
  'cloud-processing': {
    title: '24/7 Cloud Processing',
    description: 'Start a task and walk away. Our servers extract while you sleep or focus on closing.',
    icon: Cloud,
    heroSubtitle: 'Your extraction tasks run on our cloud infrastructure around the clock.',
    longDescription: 'Stop wasting time watching progress bars. LeadSpotter runs your extraction tasks on powerful cloud servers 24/7. Start a campaign, close your browser, shut down your computer — your task keeps running. Come back anytime to download thousands of enriched leads that were extracted while you were doing other things.',
    benefits: [
      '24/7 background extraction on cloud servers',
      'No browser or computer needed',
      'Real-time progress tracking from any device',
      'Automatic retry on failures or timeouts',
      'Multiple tasks running simultaneously',
      'Pause, resume, or cancel tasks anytime',
    ],
    stats: [
      { value: '99.9%', label: 'Uptime', icon: Shield },
      { value: '10', label: 'Concurrent Tasks', icon: Repeat },
      { value: '24/7', label: 'Processing', icon: Clock },
      { value: '0', label: 'Browser Needed', icon: Cloud },
    ],
    steps: [
      { title: 'Configure your task', desc: 'Set your niche, location, and extraction preferences.', icon: Settings },
      { title: 'Start the task', desc: 'Click "Start" and our cloud takes over immediately.', icon: Zap },
      { title: 'Close your browser', desc: 'Walk away. Your task runs on our servers, not your computer.', icon: Cloud },
      { title: 'Track progress', desc: 'Check in anytime from any device — phone, tablet, or laptop.', icon: BarChart3 },
      { title: 'Download when ready', desc: 'Get notified when extraction completes. Download your leads.', icon: Download },
    ],
    comparison: [
      { before: 'Browser must stay open for hours', after: 'Start task, close browser, come back later' },
      { before: 'Computer slows down during extraction', after: 'Zero impact on your device performance' },
      { before: 'One task at a time', after: 'Run up to 10 tasks simultaneously' },
      { before: 'Lost progress if browser crashes', after: 'Cloud-based with auto-retry on failures' },
    ],
    faqs: [
      { q: 'Do I need to keep my browser open?', a: 'No! That\'s the whole point. Our cloud servers handle the extraction. You can close your browser, shut down your computer, and come back later to find your leads ready.' },
      { q: 'How many tasks can I run at once?', a: 'Free plan: 1 concurrent task. Pro plan: 3 concurrent tasks. Enterprise: 10 concurrent tasks.' },
      { q: 'What happens if a task fails?', a: 'Our system automatically retries failed extractions up to 3 times with different parameters. If it still fails, you\'ll be notified with details about what went wrong.' },
      { q: 'Can I pause a running task?', a: 'Yes, you can pause any task from the Campaigns page. You can resume it later — it picks up where it left off.' },
    ],
    testimonial: {
      quote: "I start 5 extraction tasks before going to bed and wake up to 25,000 leads ready to download. The cloud processing is the reason I chose LeadSpotter over every other tool.",
      name: "Vikram Patel",
      title: "Sales Manager, TechBridge",
    },
    relatedFeatures: ['bulk-keyword-generator', 'google-maps-extractor', 'crm-ready-export'],
  },
  'verified-email-extraction': {
    title: 'Verified Email Extraction',
    description: 'Real business emails from contact pages with automatic validation built right in.',
    icon: Database,
    heroSubtitle: 'Every email is automatically validated before it hits your export file.',
    longDescription: 'Don\'t waste time on bounced emails. Our extraction engine doesn\'t just find emails — it validates them. Every email goes through format checking, domain verification, and suspicious pattern detection. Only structurally verified emails make it into your export, so your outreach campaigns have higher deliverability from day one.',
    benefits: [
      'Automatic email format validation',
      'Domain existence verification',
      'Suspicious pattern detection (fake/test emails)',
      'Email verification status in every export',
      'Filter exports to "verified emails only"',
      'No third-party API costs — built-in validation',
    ],
    stats: [
      { value: '99.2%', label: 'Format Accuracy', icon: Shield },
      { value: '65%', label: 'Discovery Rate', icon: Mail },
      { value: '0', label: 'Third-Party APIs', icon: Zap },
      { value: '<1s', label: 'Validation Time', icon: Clock },
    ],
    steps: [
      { title: 'Extract leads', desc: 'Run a standard extraction to collect business data.', icon: Search },
      { title: 'Auto-validation runs', desc: 'Every found email is automatically validated in real-time.', icon: Shield },
      { title: 'Check verification status', desc: 'See "Verified" or "Unverified" status for every email in your export.', icon: CheckCircle },
      { title: 'Filter if needed', desc: 'Use the "Verified Email Required" filter to export only verified emails.', icon: Target },
      { title: 'Export clean data', desc: 'Download your leads with email verification status included.', icon: Download },
    ],
    comparison: [
      { before: 'Export all emails, sort through bounces later', after: 'Pre-validated emails reduce bounce rate by 80%' },
      { before: 'No way to know if an email is real', after: 'Every email has a verification status' },
      { before: 'Pay for third-party email verification', after: 'Built-in validation at no extra cost' },
      { before: 'Test/fake emails mixed in with real ones', after: 'Suspicious patterns automatically flagged' },
    ],
    faqs: [
      { q: 'How does email verification work?', a: 'We validate emails through format checking (must follow RFC standards), domain verification (MX record existence), and suspicious pattern detection (filters out test@, example@, etc.).' },
      { q: 'Is this the same as email deliverability checking?', a: 'Not exactly. We do structural validation — checking that the email looks real and the domain exists. For actual inbox verification (checking if the mailbox exists), you would need a third-party service.' },
      { q: 'Can I export only verified emails?', a: 'Yes! In the export dialog, check the "Verified Email Required" filter. This ensures only leads with verified emails are included in your export file.' },
      { q: 'Does this cost extra?', a: 'No, email verification is included in all plans that have the "Email Verification" feature enabled. It\'s part of the standard extraction pipeline.' },
    ],
    testimonial: {
      quote: "Our email bounce rate dropped from 25% to under 5% after switching to LeadSpotter. The built-in verification saves us money on third-party tools and protects our sender reputation.",
      name: "Ankit Mehta",
      title: "Marketing Director, GrowthLab",
    },
    relatedFeatures: ['email-enrichment', 'google-maps-extractor', 'crm-ready-export'],
  },
  'crm-ready-export': {
    title: 'CRM-Ready Export',
    description: 'Clean CSV with custom columns for HubSpot, Salesforce, Pipedrive. Telegram delivery too.',
    icon: Zap,
    heroSubtitle: 'Export in any format — CSV, Excel, JSON, or PDF. Ready for your CRM from day one.',
    longDescription: 'Stop reformatting spreadsheets. LeadSpotter exports are designed for direct CRM import. Choose from multiple formats (CSV, Excel, JSON, PDF), select which columns you need, and filter by data quality. Every export is clean, consistent, and ready to import into HubSpot, Salesforce, Pipedrive, or any other CRM — no manual cleanup required.',
    benefits: [
      'Multiple export formats: CSV, Excel, JSON, PDF',
      'Custom column selection for your CRM',
      'Filter by email, phone, rating, or social presence',
      'Lead Score column for prioritization',
      'Email verification status included',
      'Direct Telegram file delivery',
    ],
    stats: [
      { value: '4', label: 'Export Formats', icon: FileText },
      { value: '25+', label: 'Data Columns', icon: Database },
      { value: '100%', label: 'CRM Compatible', icon: CheckCircle },
      { value: '<5s', label: 'Export Time', icon: Clock },
    ],
    steps: [
      { title: 'Complete extraction', desc: 'Finish your extraction task — or use partial results.', icon: CheckCircle },
      { title: 'Open export dialog', desc: 'Click the Export button on any completed task.', icon: FileText },
      { title: 'Choose format', desc: 'Select CSV, Excel, JSON, or PDF based on your needs.', icon: Settings },
      { title: 'Set filters', desc: 'Require email, phone, verified email, or specific ratings.', icon: Target },
      { title: 'Download or deliver', desc: 'Download instantly or receive via Telegram automatically.', icon: Download },
    ],
    comparison: [
      { before: 'Export raw data, reformat manually for CRM', after: 'CRM-ready format — import directly with no cleanup' },
      { before: 'Only CSV export available', after: 'CSV, Excel, JSON, PDF — choose what works for you' },
      { before: 'No filtering before export', after: 'Filter by email, phone, rating, verification status' },
      { before: 'Download and then upload to CRM', after: 'Telegram delivery + CRM field mapping' },
    ],
    faqs: [
      { q: 'Which export formats are available?', a: 'CSV is available on all plans. JSON, Excel, and PDF are available on Pro plans and above. Admin can configure format access per plan.' },
      { q: 'Can I choose which columns to export?', a: 'Yes, the export includes all available data columns — name, address, phone, email, website, rating, reviews, social profiles, operating hours, GPS coordinates, and more.' },
      { q: 'How does Telegram delivery work?', a: 'Connect your Telegram bot in settings. When an export is ready, the file is automatically sent to your Telegram chat — no download needed.' },
      { q: 'Is the export compatible with HubSpot/Salesforce?', a: 'Yes! Our CSV format uses standard column headers that map directly to HubSpot, Salesforce, Pipedrive, and most other CRMs. Just import the CSV and the fields auto-map.' },
    ],
    testimonial: {
      quote: "We used to spend 2 hours reformatting every export for Salesforce. Now we download the CSV and import it directly. Zero manual work. The Telegram delivery is the cherry on top.",
      name: "Sarah Chen",
      title: "VP Sales, DataDriven Co.",
    },
    relatedFeatures: ['google-maps-extractor', 'email-enrichment', 'verified-email-extraction'],
  },
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return Object.keys(features).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug];
  if (!feature) return { title: 'Feature Not Found' };

  return {
    title: `${feature.title} | LeadSpotter`,
    description: feature.description,
    keywords: [feature.title.toLowerCase(), 'lead generation', 'google maps', 'b2b leads', 'lead extraction'],
    alternates: { canonical: `https://leadspotter.in/features/${slug}` },
    openGraph: {
      title: `${feature.title} | LeadSpotter`,
      description: feature.description,
      url: `https://leadspotter.in/features/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${feature.title} | LeadSpotter`,
      description: feature.description,
      images: ['https://leadspotter.in/opengraph-image'],
    },
  };
}

export default async function FeaturePage({ params }: { params: Params }) {
  const { slug } = await params;
  const feature = features[slug];
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
      <JsonLd
        type="FAQPage"
        data={{
          faqs: feature.faqs.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Features", url: "https://leadspotter.in/features" },
            { name: feature.title, url: `https://leadspotter.in/features/${slug}` },
          ],
        }}
      />
      <JsonLd
        type="HowTo"
        data={{
          name: `How to use ${feature.title}`,
          description: feature.description,
          steps: feature.steps.map(s => ({ name: s.title, text: s.desc })),
        }}
      />
      <LandingBanner />
      <LandingHeader />

      {/* ━━━━━━ HERO ━━━━━━ */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <feature.icon size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{feature.title}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl leading-relaxed">
            {feature.heroSubtitle}
          </p>
          <p className="text-gray-500 max-w-3xl leading-relaxed mb-8">
            {feature.longDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━ STATS ━━━━━━ */}
      <section className="py-16 bg-gray-50/40 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {feature.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon size={20} className="text-indigo-600" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ HOW IT WORKS ━━━━━━ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">How It Works</p>
            <h2 className="text-3xl font-semibold text-gray-900">Simple steps to get started</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {feature.steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ BENEFITS ━━━━━━ */}
      <section className="py-24 bg-gray-50/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Benefits</p>
            <h2 className="text-3xl font-semibold text-gray-900">Everything you need</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {feature.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-5 rounded-xl bg-white border border-gray-100">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span className="font-semibold text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ BEFORE / AFTER ━━━━━━ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Comparison</p>
            <h2 className="text-3xl font-semibold text-gray-900">Before vs After</h2>
          </div>
          <div className="space-y-4">
            {feature.comparison.map((item, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">Without</p>
                  <p className="text-gray-700">{item.before}</p>
                </div>
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">With LeadSpotter</p>
                  <p className="text-gray-700">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ TESTIMONIAL ━━━━━━ */}
      <section className="py-24 bg-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
            &ldquo;{feature.testimonial.quote}&rdquo;
          </blockquote>
          <p className="font-bold text-lg">{feature.testimonial.name}</p>
          <p className="text-indigo-300">{feature.testimonial.title}</p>
        </div>
      </section>

      {/* ━━━━━━ FAQ ━━━━━━ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-semibold text-gray-900">Common questions</h2>
          </div>
          <div className="space-y-0">
            {feature.faqs.map((faq, i) => (
              <details key={i} className="group border-b border-gray-100">
                <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronRight size={18} className="text-gray-400 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <p className="text-gray-600 pb-5 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ RELATED FEATURES ━━━━━━ */}
      <section className="py-24 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Related</p>
            <h2 className="text-3xl font-semibold text-gray-900">Works great with</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {feature.relatedFeatures.map((relSlug) => {
              const rel = features[relSlug];
              if (!rel) return null;
              return (
                <Link key={relSlug} href={`/features/${relSlug}`}
                  className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <rel.icon size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{rel.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{rel.description}</p>
                  <span className="text-xs font-semibold text-indigo-500 mt-3 inline-flex items-center gap-1">
                    Learn more <ArrowRight size={11} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━ COMPARE ━━━━━━ */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Compare</p>
            <h2 className="text-2xl font-semibold text-gray-900">See how we stack up</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/compare/leadspotter-vs-phantombuster" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
              vs PhantomBuster
            </Link>
            <Link href="/compare/leadspotter-vs-outscraper" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
              vs Outscraper
            </Link>
            <Link href="/compare/leadspotter-vs-apollo" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
              vs Apollo
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
              All Comparisons →
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━ CTA ━━━━━━ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl bg-indigo-900 p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start using {feature.title} today</h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">Get free leads every month with our starter plan. No credit card required.</p>
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
