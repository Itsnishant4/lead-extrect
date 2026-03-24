import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import LeadsForm from './LeadsForm';

export const metadata: Metadata = {
  title: 'Lead Generation Tool — Extract B2B Leads from Google Maps',
  description: 'Generate thousands of targeted keywords and extract verified business leads from Google Maps. Cloud-powered, CRM-ready exports. Start free today.',
  alternates: { canonical: 'https://leadspotter.in/leads' },
  keywords: ['lead generation', 'google maps extractor', 'b2b leads', 'keyword generator', 'business database'],
  openGraph: {
    title: 'Lead Generation Tool — Extract B2B Leads from Google Maps | LeadSpotter',
    description: 'Generate thousands of targeted keywords and extract verified business leads from Google Maps.',
    url: 'https://leadspotter.in/leads',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lead Generation Tool — Extract B2B Leads | LeadSpotter',
    description: 'Generate thousands of targeted keywords and extract verified business leads from Google Maps.',
    images: ['https://leadspotter.in/opengraph-image'],
  },
};

export default function LeadsPage() {
  return (
    <>
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Leads", url: "https://leadspotter.in/leads" },
          ],
        }}
      />
      <LeadsForm />
    </>
  );
}
