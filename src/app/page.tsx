import React from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { HomeClient } from "@/components/HomeClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { Search, CloudCog, Download, Layers, MapPin, Cloud, Database } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadSpotter | #1 Google Maps Lead Extractor & B2B Sales Engine",
  description: "Scale your sales with LeadSpotter. Extract thousands of verified B2B leads from Google Maps with emails, phone numbers, and social profiles in minutes. Start for free.",
  keywords: ["google maps scraper", "lead extraction tool", "b2b lead generation", "email extractor", "sales prospecting"],
  alternates: { canonical: "https://leadspotter.in" },
  openGraph: {
    title: "LeadSpotter | Turn Maps into your Lead Machine",
    description: "The most powerful B2B lead extraction tool for Google Maps. Bulk keyword generation and deep data enrichment.",
    url: "https://leadspotter.in",
  }
};

const flipWords = ["Lead Machine", "Sales Engine", "Growth Pipeline", "Revenue Source"];

const testimonials = [
  { quote: "LeadSpotter cut our prospecting time by 80%. We went from 2 hours of manual scraping to getting 5,000 verified leads in minutes.", name: "Rahul Mehta", title: "Founder, GrowthForce Agency" },
  { quote: "The bulk keyword feature is insane. We generated 10,000 keyword combinations and launched campaigns overnight. Game changer.", name: "Priya Sharma", title: "Head of Sales, MapLeads India" },
  { quote: "Finally a tool that actually delivers verified emails and phone numbers. Our cold outreach response rate jumped from 3% to 12%.", name: "Aman Gupta", title: "CEO, ReachLocal" },
  { quote: "We've tried every scraper out there. LeadSpotter is the only one that handles cloud processing properly — set it and forget it.", name: "Sarah Chen", title: "VP Sales, DataDriven Co." },
  { quote: "The campaign management dashboard is beautifully designed and the export options are exactly what our CRM needs.", name: "Vikram Patel", title: "Sales Manager, TechBridge" },
];

const howItWorks = [
  { step: "01", Icon: Search, title: "Generate Keywords", description: "Combine niches and locations to create thousands of targeted search combinations in a single click." },
  { step: "02", Icon: CloudCog, title: "Extract in the Cloud", description: "Our servers process your keywords 24/7, extracting business data and enriching every lead automatically." },
  { step: "03", Icon: Download, title: "Export & Close", description: "Download CRM-ready CSV files with verified emails, phone numbers, and social profiles." },
];

const benefits = [
  { Icon: Layers, title: "Bulk Keyword Generation", slug: "bulk-keyword-generator", description: "Combine hundreds of niches and locations in one click. Generate 5,000+ keyword combinations for massive search coverage." },
  { Icon: MapPin, title: "Localized Area Search", description: "Pinpoint businesses with surgical precision using zip-code and neighborhood targeting." },
  { Icon: Cloud, title: "24/7 Cloud Processing", description: "Start your task and walk away. Our servers handle extraction in the background while you sleep." },
  { Icon: Database, title: "Deep Data Enrichment", slug: "email-enrichment", description: "Go beyond basic Maps info. We scrape websites to find hidden emails and social profiles." },
];

const faqs = [
  { q: "What data can LeadSpotter extract?", a: "LeadSpotter extracts business names, addresses, phone numbers, emails, websites, ratings, reviews, social media profiles, and operating hours." },
  { q: "Is this legal to use?", a: "Yes. LeadSpotter only collects publicly available data. We are fully GDPR and CCPA compliant." },
  { q: "How does cloud processing work?", a: "When you start a task, it runs on our servers. You can close your browser and come back later." },
];

export default function Home() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      <JsonLd />
      <LandingHeader />
      
      <HomeClient 
        flipWords={flipWords} 
        testimonials={testimonials} 
        faqs={faqs} 
      />

      <section className="py-16 md:py-32" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">From keywords to closed deals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item: any) => (
              <div key={item.step} className="p-8 rounded-2xl border border-gray-100 bg-white">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-indigo-100">
                  <item.Icon size={28} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((item: any) => (
              <div key={item.title} className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                <item.Icon size={24} className="text-indigo-600 mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                {item.slug && (
                  <Link href={`/features/${item.slug}`} className="text-xs font-bold text-indigo-600 hover:underline">
                    Learn more about {item.title} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
