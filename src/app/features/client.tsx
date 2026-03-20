"use client";

import React from "react";
import Link from "next/link";
import {
  Search, Layers, Cloud, Database, Download, MapPin, Mail, Phone,
  Globe, Zap, Shield, BarChart3, ArrowRight, CheckCircle, Clock, Users,
} from "lucide-react";
import { motion } from "motion/react";
import { LandingFooter } from "@/components/LandingFooter";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

function AnimatedSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section id={id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } }}
      className={className}>{children}</motion.section>
  );
}

const coreFeatures = [
  {
    Icon: Layers,
    title: "Bulk Keyword Generation",
    slug: "bulk-keyword-generator",
    description: "Combine hundreds of niches with locations in one click. Generate 5,000+ keyword combinations like \"dentists in Mumbai\" or \"plumbers in Chicago\" to maximize your search coverage across any market.",
    bullets: ["Combine multiple niches and cities automatically", "Generate thousands of keyword combos in seconds", "Save and reuse keyword sets for future campaigns"],
  },
  {
    Icon: Search,
    title: "Google Maps Data Extraction",
    slug: "google-maps-extractor",
    description: "Extract comprehensive business data from Google Maps results including business names, addresses, phone numbers, websites, ratings, review counts, categories, and operating hours.",
    bullets: ["Extract up to 400 results per keyword search", "Automatic pagination across multiple result pages", "Proxy rotation for uninterrupted large-scale extraction"],
  },
  {
    Icon: Database,
    title: "Deep Website Enrichment",
    slug: "email-enrichment",
    description: "Go beyond basic Maps data. LeadSpotter crawls business websites to find hidden email addresses, direct phone numbers, and social media profiles that aren't listed on maps.",
    bullets: ["Extract emails from contact pages and footers", "Find Facebook, Instagram, LinkedIn, Twitter profiles", "Discover direct phone numbers from business websites"],
  },
  {
    Icon: Cloud,
    title: "24/7 Cloud Processing",
    description: "Start your extraction task and close your browser. Our cloud servers process keywords around the clock, so you can sleep while LeadSpotter works. No need to keep your computer running.",
    bullets: ["Background processing on cloud infrastructure", "Resume tasks anytime from any device", "Real-time progress tracking and status updates"],
  },
  {
    Icon: Download,
    title: "CRM-Ready CSV Export",
    description: "Export your leads in clean, structured CSV format ready for import into any CRM like HubSpot, Salesforce, or Pipedrive. Choose exactly which columns to include with custom export templates.",
    bullets: ["Custom column selection and export templates", "Export filtered subsets of your lead database", "Direct Telegram delivery for instant access"],
  },
  {
    Icon: MapPin,
    title: "Localized Area Targeting",
    description: "Target businesses with pinpoint precision using zip codes, neighborhoods, and city-level targeting. Perfect for local service businesses and agencies focused on specific geographic markets.",
    bullets: ["Pincode and neighborhood-level targeting", "Country, state, and city selection", "Built-in geocoding for precise location data"],
  },
];

const additionalFeatures = [
  { Icon: Mail, title: "Email Finder", description: "Automatically extract business emails from websites and contact pages." },
  { Icon: Phone, title: "Phone Extractor", description: "Find direct phone numbers from business listings and websites." },
  { Icon: Globe, title: "Social Media Discovery", description: "Detect Facebook, Instagram, LinkedIn, Twitter, YouTube, and TikTok links." },
  { Icon: Shield, title: "GDPR & CCPA Compliant", description: "Only publicly available data is collected. Fully compliant with privacy regulations." },
  { Icon: BarChart3, title: "Lead Scoring", description: "Automatic lead scoring based on data completeness, ratings, and review counts." },
  { Icon: Users, title: "Saved Lists", description: "Organize leads into custom lists for different campaigns or clients." },
  { Icon: Clock, title: "Task Automation", description: "Queue multiple extraction tasks and process them sequentially in the cloud." },
  { Icon: Zap, title: "Bulk Operations", description: "Process thousands of keywords in a single campaign with batch extraction." },
];

export default function FeaturesPageClient() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* Hero */}
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">All Features</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Everything You Need to<br /><span className="text-indigo-600">Extract & Enrich Leads</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-gray-500 text-lg mb-10">
            From Google Maps data extraction to deep website enrichment, LeadSpotter gives you a complete B2B lead generation toolkit that runs in the cloud 24/7.
          </motion.p>
          <motion.div className="flex justify-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/signup">
              <HoverBorderGradient containerClassName="rounded-full" className="flex items-center gap-2 bg-gradient-to-r  from-indigo-600 to-violet-600 text-white px-8 py-3.5 text-base font-bold">
                Start For Free <ArrowRight size={20} />
              </HoverBorderGradient>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Features - Detailed */}
      {coreFeatures.map((feature, i) => (
        <AnimatedSection key={feature.title} className={`py-16 md:py-24 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-100 to-violet-100">
                  <feature.Icon size={28} className="text-indigo-600" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">{feature.description}</p>
                {feature.slug && (
                  <Link href={`/features/${feature.slug}`} className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:gap-3 transition-all">
                    Learn more about {feature.title} <ArrowRight size={18} />
                  </Link>
                )}
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle size={20} className="text-indigo-500 fill-indigo-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${i % 2 === 1 ? "md:order-1" : ""} rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 p-8 md:p-12 flex items-center justify-center min-h-[280px] h-full `}>
                <feature.Icon size={120} className="text-indigo-200" strokeWidth={0.8} />
              </div>
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* Additional Features Grid */}
      <AnimatedSection className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">And Much More</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Additional Capabilities</h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feat, i) => (
              <motion.div key={feat.title} variants={fadeUp} custom={i}
                className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all">
                  <feat.Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50 p-8 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ready to Extract Your First Leads?</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Start with free leads. No credit card required. Upgrade anytime as you grow.</p>
              <Link href="/signup">
                <HoverBorderGradient containerClassName="rounded-full mx-auto" className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 text-lg font-bold">
                  Get Started Free<ArrowRight size={20} />
                </HoverBorderGradient>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <LandingFooter />
    </div>
  );
}
