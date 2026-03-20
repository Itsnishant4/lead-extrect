"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Plus, CheckCircle, Search, CloudCog, Download,
  Layers, MapPin, Cloud, Database, Zap, Shield, BarChart3,
  Headphones, RefreshCw, BadgeCheck, Star, Mail,
  Globe as GlobeIcon, Users,
} from "lucide-react";
import dynamic from "next/dynamic";

const InfiniteMovingCards = dynamic(
  () => import("@/components/ui/infinite-moving-cards").then((m) => ({ default: m.InfiniteMovingCards })),
  { ssr: false }
);
const Globe = dynamic(
  () => import("@/components/magicui/globe").then((m) => ({ default: m.Globe })),
  { ssr: false }
);

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */

const testimonials = [
  { quote: "LeadSpotter cut our prospecting time by 80%. We went from 2 hours of manual scraping to getting 5,000 verified leads in minutes.", name: "Rahul Mehta", title: "Founder, GrowthForce Agency" },
  { quote: "The bulk keyword feature is insane. We generated 10,000 keyword combinations and launched campaigns overnight. Game changer.", name: "Priya Sharma", title: "Head of Sales, MapLeads India" },
  { quote: "Finally a tool that actually delivers verified emails and phone numbers. Our cold outreach response rate jumped from 3% to 12%.", name: "Aman Gupta", title: "CEO, ReachLocal" },
  { quote: "We've tried every scraper out there. LeadSpotter is the only one that handles cloud processing properly — set it and forget it.", name: "Sarah Chen", title: "VP Sales, DataDriven Co." },
  { quote: "The campaign management dashboard is beautifully designed and the export options are exactly what our CRM needs.", name: "Vikram Patel", title: "Sales Manager, TechBridge" },
];

const faqs = [
  { q: "What data can LeadSpotter extract?", a: "Business names, addresses, phone numbers, emails, websites, ratings, reviews, social media profiles, and operating hours from Google Maps and business websites." },
  { q: "Is this legal to use?", a: "Yes. LeadSpotter only collects publicly available data. We are fully GDPR and CCPA compliant." },
  { q: "How does cloud processing work?", a: "Tasks run on our cloud servers 24/7. Close your browser, turn off your computer, and come back later to download results." },
  { q: "How many leads can I extract per month?", a: "Free plan: 500 leads/month. Paid plans: 5,000 to unlimited. All plans include full data enrichment." },
  { q: "Can I export directly to my CRM?", a: "Yes — CSV with custom columns, compatible with HubSpot, Salesforce, Pipedrive. Direct Telegram delivery available." },
  { q: "Do you offer a free trial?", a: "Our Free plan is always free — no credit card required. 500 leads/month and 1 concurrent task to test everything." },
];

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function FaqItem({ item, isOpen, toggle }: { item: { q: string; a: string }; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-indigo-50 last:border-0">
      <button onClick={toggle} className="w-full flex items-center justify-between py-5 text-left group cursor-pointer">
        <span className="text-[15px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors pr-4">{item.q}</span>
        <Plus size={18} className={`text-indigo-300 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-5 text-gray-500 text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════ */

export function HomeClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white">

      {/* ━━━━━━ HERO — clean white + AI card, w-full ━━━━━━ */}
      <section className="relative bg-gradient-to-t from-white to-[#5c49ee]/10 border-b h-screen flex items-center px-6 md:px-16 overflow-hidden bg-white">

        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />

        {/* Subtle wave overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg viewBox="0 0 1440 600" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,300 C360,150 720,450 1080,250 C1260,180 1380,350 1440,300" stroke="#6366f1" strokeWidth="1.5" fill="none" />
            <path d="M0,350 C360,200 720,500 1080,300 C1260,230 1380,400 1440,350" stroke="#a78bfa" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center w-full relative z-10 pt-28 md:pt-20 pb-16">

          {/* ── LEFT: Text ── */}
          <div className="space-y-6">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl font-sans font-medium md:text-6xl ">
              Find, Analyze, and Convert High-Quality Leads
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-gray-600 max-w-lg text-base">
              Discover real-time leads, identify opportunities, and automate outreach with AI precision.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/signup"
                className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition text-sm font-medium flex items-center gap-2">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link href="/pricing"
                className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white/60 hover:bg-white flex items-center gap-2 transition-all shadow-sm">
                Request Demo
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT: Floating AI Card ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center">

            {/* Question bubble */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 right-4 md:right-10 z-10"
            >
              <div className="bg-white px-4 py-2 rounded-xl shadow text-sm font-medium text-gray-700">
                What&apos;s the conversion rate?
              </div>
            </motion.div>

            {/* Main insight card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-[320px] mt-8"
            >
              <p className="text-emerald-600 font-semibold text-lg">
                Conversion rate is 18.4%
              </p>
              <p className="text-orange-500 font-medium mt-3 text-[15px]">
                Top 20% leads generate 65% revenue
              </p>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Focus on high-intent leads to maximize ROI and reduce wasted outreach.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ━━━━━━ HOW IT WORKS ━━━━━━ */}
      <section className="py-24 md:py-32" id="how-it-works">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">Three steps. That&apos;s it.</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">No complex setup. Enter keywords and let the cloud handle everything.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "1", icon: Search, title: "Generate Keywords", desc: "Combine hundreds of niches with locations to create thousands of targeted search combinations in one click.", color: "bg-violet-500", shadow: "shadow-violet-500/20" },
              { n: "2", icon: CloudCog, title: "Extract in the Cloud", desc: "Our servers process your keywords 24/7, extracting business data and enriching every lead automatically.", color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
              { n: "3", icon: Download, title: "Export & Close", desc: "Download CRM-ready CSV files with verified emails, phone numbers, and social profiles.", color: "bg-blue-500", shadow: "shadow-blue-500/20" },
            ].map((item, i) => (
              <motion.div key={item.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="group text-center">
                <div className={`inline-flex w-14 h-14 rounded-2xl ${item.color} ${item.shadow} shadow-lg items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[260px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ FEATURES ━━━━━━ */}
      <section className="py-24 md:py-32 bg-gray-50/40" id="features">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">Built for serious lead gen</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">A complete B2B toolkit that runs 24/7 in the cloud.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Layers, title: "Bulk Keyword Generation", desc: "Generate 5,000+ keyword combos from hundreds of niches and locations in one click.", accent: "bg-violet-50", slug: "bulk-keyword-generator" },
              { icon: MapPin, title: "Localized Area Search", desc: "Pinpoint businesses with zip-code, neighborhood, and city-level precision targeting.", accent: "bg-rose-50" },
              { icon: Cloud, title: "24/7 Cloud Processing", desc: "Start a task and walk away. Our servers extract while you sleep or focus on closing.", accent: "bg-sky-50" },
              { icon: Database, title: "Deep Data Enrichment", desc: "Scrape websites for hidden emails, phones, and social profiles beyond Maps data.", accent: "bg-amber-50", slug: "email-enrichment" },
              { icon: Mail, title: "Verified Email Extraction", desc: "Real business emails from contact pages with automatic validation built right in.", accent: "bg-emerald-50" },
              { icon: Zap, title: "CRM-Ready Export", desc: "Clean CSV with custom columns for HubSpot, Salesforce, Pipedrive. Telegram delivery too.", accent: "bg-indigo-50" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                <div className={`w-10 h-10 rounded-xl ${item.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} className="text-gray-700" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{item.desc}</p>
                {item.slug && (
                  <Link href={`/features/${item.slug}`} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1 transition-all">
                    Learn more <ArrowRight size={11} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/features" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1.5 transition-colors">
              View all features <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━ STATS ━━━━━━ */}
      <section className="py-16 md:py-20 border-y border-indigo-50/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { val: "2M+", label: "Data points processed daily", icon: BarChart3 },
              { val: "5,000+", label: "Active users worldwide", icon: Users },
              { val: "99%", label: "Uptime reliability", icon: Shield },
              { val: "150+", label: "Countries served", icon: GlobeIcon },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center md:text-left">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 mx-auto md:mx-0">
                  <s.icon size={16} className="text-indigo-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ GLOBE ━━━━━━ */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Global Reach</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">Extract from anywhere on the planet</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Millions of data points daily across 150+ countries. Whether you target businesses in Mumbai, New York, London, or Tokyo — our cloud handles it all seamlessly.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Start extracting free <ArrowRight size={15} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex items-center justify-center">
              <div className="relative w-full max-w-[340px] aspect-square">
                <Globe className="opacity-80" />
                <div className="absolute inset-0 bg-indigo-300/10 rounded-full blur-[60px] pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━ TESTIMONIALS ━━━━━━ */}
      <section className="py-24 md:py-32 bg-indigo-50/30 overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">Loved by sales teams everywhere</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">Join thousands who trust LeadSpotter for lead generation.</p>
          </motion.div>
        </div>
        <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />

        <div className="max-w-4xl mx-auto px-5 sm:px-8 mt-14">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { val: "4.9/5", sub: "from 500+ reviews", stars: true },
              { val: "80%", sub: "less prospecting time" },
              { val: "12%", sub: "email response rate" },
              { val: "3x", sub: "more qualified leads" },
            ].map((s) => (
              <div key={s.sub} className="text-center">
                <p className="text-xl font-bold text-gray-900 flex items-center gap-1 justify-center">
                  {s.val}
                  {s.stars && (
                    <span className="flex ml-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ WHY US ━━━━━━ */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Why LeadSpotter</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">Not just another scraper</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "10x Faster", desc: "5,000+ leads in minutes with parallel cloud processing.", tint: "bg-amber-50", iconColor: "text-amber-600" },
              { icon: Shield, title: "GDPR Compliant", desc: "Only publicly available data. Fully GDPR & CCPA compliant.", tint: "bg-emerald-50", iconColor: "text-emerald-600" },
              { icon: RefreshCw, title: "Always Fresh", desc: "Real-time extraction means no stale databases ever.", tint: "bg-sky-50", iconColor: "text-sky-600" },
              { icon: BadgeCheck, title: "Verified Data", desc: "Every email and phone number validated before delivery.", tint: "bg-violet-50", iconColor: "text-violet-600" },
              { icon: Headphones, title: "24/7 Support", desc: "Minutes, not days. Chat, email, or call whenever you need.", tint: "bg-rose-50", iconColor: "text-rose-600" },
              { icon: BarChart3, title: "Analytics", desc: "Track exports, quality, and campaign performance metrics.", tint: "bg-indigo-50", iconColor: "text-indigo-600" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                <div className={`w-9 h-9 rounded-lg ${item.tint} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon size={17} className={item.iconColor} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ FAQ ━━━━━━ */}
      <section className="py-24 md:py-32 bg-gray-50/40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2 md:sticky md:top-32 md:self-start">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">FAQ</p>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Questions?</h2>
                <p className="text-gray-400 text-sm mb-5">Everything you need to know about LeadSpotter.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:gap-3 transition-all">
                  View pricing <ArrowRight size={15} />
                </Link>
              </motion.div>
            </div>
            <div className="md:col-span-3">
              {faqs.map((faq, i) => (
                <FaqItem key={i} item={faq} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

    
      

    </div>
  );
}
