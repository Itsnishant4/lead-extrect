"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone, Briefcase, Home, UserSearch, Store, Wrench,
  ArrowRight, CheckCircle, TrendingUp, Target,
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
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } }}
      className={className}>{children}</motion.section>
  );
}

const useCases = [
  {
    Icon: Megaphone,
    title: "Digital Marketing Agencies",
    subtitle: "Build client prospect lists in minutes, not hours",
    description: "Marketing agencies use LeadSpotter to build massive prospect lists for cold outreach campaigns. Instead of manually searching Google Maps for potential clients, generate thousands of targeted keywords like \"restaurants in Delhi\" or \"salons in Bangalore\" and extract complete business data in bulk.",
    results: ["80% reduction in prospecting time", "5,000+ leads per campaign", "12% cold email response rate"],
    workflow: "Generate keywords by combining service niches with target cities. Run cloud extraction overnight. Export CSV with emails and phone numbers. Import into your CRM and launch outreach campaigns.",
  },
  {
    Icon: Briefcase,
    title: "B2B Sales Teams",
    subtitle: "Fill your pipeline with verified business contacts",
    description: "Sales teams use LeadSpotter to find decision-makers at local businesses. Extract business data from Google Maps, then use our deep enrichment to find direct email addresses and phone numbers from company websites. Build targeted lists segmented by location, category, and rating.",
    results: ["3x more qualified leads per week", "Direct emails from company websites", "CRM-ready export in one click"],
    workflow: "Target specific business categories in your territory. Extract leads with full contact details. Score leads by rating and review count. Export directly to Salesforce, HubSpot, or Pipedrive.",
  },
  {
    Icon: Home,
    title: "Real Estate Professionals",
    subtitle: "Find property managers, builders, and local businesses",
    description: "Real estate agents and property managers use LeadSpotter to identify businesses in specific neighborhoods. Find property management companies, construction firms, interior designers, and other real estate service providers across any city or region.",
    results: ["Neighborhood-level targeting", "Find businesses by exact pincode", "Extract reviews and ratings for qualification"],
    workflow: "Select target neighborhoods or pincodes. Search for real estate-related business categories. Extract contact information including direct phone numbers. Build relationships with local service providers.",
  },
  {
    Icon: UserSearch,
    title: "Freelancers & Consultants",
    subtitle: "Find clients who need your services",
    description: "Freelance web designers, SEO consultants, and marketing professionals use LeadSpotter to find businesses that need their services. Search for businesses with outdated websites, missing social media presence, or low ratings that could benefit from professional help.",
    results: ["Find businesses without websites", "Identify businesses with low online presence", "500 free leads per month on starter plan"],
    workflow: "Search for business types that typically need your services. Filter by businesses lacking websites or social profiles. Extract email addresses for personalized outreach. Offer your services to businesses that need them most.",
  },
  {
    Icon: Store,
    title: "Local Service Businesses",
    subtitle: "Identify partnership and referral opportunities",
    description: "Plumbers, electricians, contractors, and other local service providers use LeadSpotter to find complementary businesses for referral partnerships. Build a network of related businesses in your service area and create mutually beneficial referral arrangements.",
    results: ["Map your entire local market", "Find complementary businesses nearby", "Build referral networks efficiently"],
    workflow: "Search for complementary business categories in your area. Extract contact details of nearby service providers. Reach out to propose partnership arrangements. Track your referral network growth.",
  },
  {
    Icon: Wrench,
    title: "SaaS & Software Companies",
    subtitle: "Build targeted prospect lists for your ideal customer profile",
    description: "SaaS companies use LeadSpotter to build lists of businesses matching their ideal customer profile. Whether you're selling POS systems to restaurants, booking software to salons, or inventory management to retail stores, find your exact target audience by category and location.",
    results: ["Target businesses by exact category", "Scale outreach across multiple cities", "Enrich leads with website and social data"],
    workflow: "Define your ICP by business category. Generate keywords across target markets. Extract and enrich leads with full contact data. Import into your sales engagement platform and start outreach.",
  },
];

export default function UseCasesPageClient() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* Hero */}
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full -translate-y-1/2 -translate-x-1/4 blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Use Cases</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Lead Generation for<br /><span className="text-indigo-600">Every Industry</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-gray-500 text-lg">
            See how agencies, freelancers, sales teams, and businesses across industries use LeadSpotter to find verified leads and grow revenue.
          </motion.p>
        </div>
      </section>

      {/* Use Case Sections */}
      {useCases.map((uc, i) => (
        <AnimatedSection key={uc.title} className={`py-16 md:py-20 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                    <uc.Icon size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{uc.title}</h2>
                    <p className="text-indigo-600 text-sm font-semibold">{uc.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-base leading-relaxed mb-6">{uc.description}</p>
                <div className="space-y-2 mb-6">
                  {uc.results.map((result) => (
                    <div key={result} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-emerald-500 fill-emerald-500 shrink-0" />
                      <span className="text-gray-700 font-medium text-sm">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${i % 2 === 1 ? "md:order-1" : ""} rounded-2xl border border-gray-200 bg-white p-6 md:p-8`}>
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-gray-900">How It Works</h3>
                </div>
                <div className="space-y-4">
                  {uc.workflow.split(". ").filter(Boolean).map((step, si) => (
                    <div key={si} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">{si + 1}</span>
                      <p className="text-gray-600 text-sm">{step.endsWith(".") ? step : `${step}.`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      ))}



      <LandingFooter />
    </div>
  );
}
