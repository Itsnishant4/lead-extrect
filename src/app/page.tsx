"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useInView } from "motion/react";
import { LandingHeader } from "@/components/LandingHeader";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import {
  Search, Zap, Rocket, ArrowRight, PlayCircle, Star, ShieldCheck, TrendingUp,
  CheckCircle, Download, BookmarkPlus, Store, MapPin, Mail, Phone, ExternalLink,
  MoreVertical, CloudCog, Layers, Cloud, Database, Plus,
} from "lucide-react";

const InfiniteMovingCards = dynamic(() => import("@/components/ui/infinite-moving-cards").then(mod => ({ default: mod.InfiniteMovingCards })), { ssr: false });
const LandingFooter = dynamic(() => import("@/components/LandingFooter").then(mod => ({ default: mod.LandingFooter })), { ssr: true });

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

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
  { step: "02", Icon: CloudCog, title: "Extract in the Cloud", description: "Our servers process your keywords 24/7, scraping Google Maps and enriching every lead automatically." },
  { step: "03", Icon: Download, title: "Export & Close", description: "Download CRM-ready CSV files with verified emails, phone numbers, and social profiles." },
];

const benefits = [
  { Icon: Layers, title: "Bulk Keyword Generation", description: "Combine hundreds of niches and locations in one click. Generate 5,000+ keyword combinations for massive search coverage." },
  { Icon: MapPin, title: "Localized Area Search", description: "Pinpoint businesses with surgical precision using zip-code and neighborhood targeting across any global market." },
  { Icon: Cloud, title: "24/7 Cloud Processing", description: "Start your task and walk away. Our servers handle extraction in the background while you sleep or close deals." },
  { Icon: Database, title: "Deep Data Enrichment", description: "Go beyond basic Maps info. We scrape websites to find hidden emails, social profiles, and direct phone numbers." },
];

const comparisonRows = [
  { feature: "Time to get 1,000 leads", us: "Under 5 minutes", them: "20+ hours" },
  { feature: "Email verification", us: "Automatic", them: "Manual, third-party tool" },
  { feature: "Phone number extraction", us: "Included", them: "Not available" },
  { feature: "Bulk keyword combos", us: "One-click generation", them: "Copy-paste, one by one" },
  { feature: "Background processing", us: "24/7 cloud servers", them: "Must stay online" },
  { feature: "Data export", us: "CSV, JSON, CRM-ready", them: "Manual spreadsheets" },
];

const faqs = [
  { q: "What data can LeadSpotter extract?", a: "LeadSpotter extracts business names, addresses, phone numbers, emails, websites, ratings, reviews, social media profiles, and operating hours from Google Maps listings. We also enrich data by scraping business websites for additional contact information." },
  { q: "Is this legal to use?", a: "Yes. LeadSpotter only collects publicly available data from Google Maps and business websites. We are fully GDPR and CCPA compliant. All extracted data is information that businesses have voluntarily published online." },
  { q: "How does cloud processing work?", a: "When you start an extraction task, it runs on our cloud servers. You can close your browser and come back later — your task continues processing in the background. You'll receive a notification when your leads are ready to download." },
  { q: "Can I cancel or upgrade my plan anytime?", a: "Absolutely. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel at any time from your dashboard." },
  { q: "What's the difference between the Starter and Pro plan?", a: "The Starter plan gives you 500 leads per month with basic Google Maps extraction. The Pro plan unlocks 5,000 leads, bulk keyword generation, social media enrichment, and priority support." },
];

const pricingPlans = [
  { name: "Starter", price: "₹0", period: "/month", features: ["500 Leads per month", "Localized search", "Google Maps data scraper"], cta: "Get Started", href: "/signup", popular: false },
  { name: "Pro", price: "₹2,000", period: "/month", features: ["5,000 Leads per month", "Social media enrichment", "Bulk keyword generation", "CSV/JSON data exports", "Priority email support"], cta: "Upgrade to Pro", href: "/signup", popular: true },
  { name: "Premium", price: "Custom", period: "", features: ["Unlimited leads", "Full API access", "Dedicated account manager", "Custom scrapers & workflow", "SLA & On-prem options"], cta: "Contact Sales", href: "mailto:sales@leadspotter.io", popular: false },
];

/* ------------------------------------------------------------------ */
/*  Mockup Data                                                        */
/* ------------------------------------------------------------------ */

const mockLeads = [
  { name: "Skyline Digital Agency", city: "New York, NY", email: "hello@skylinedigital.com", phone: "+1 (212) 555-0147", rating: 4.8, reviews: 124, website: "skylinedigital.com" },
  { name: "Peak Performance Studio", city: "Los Angeles, CA", email: "info@peakstudio.io", phone: "+1 (310) 555-0283", rating: 4.9, reviews: 89, website: "peakstudio.io" },
  { name: "Greenfield Consulting", city: "Chicago, IL", email: "team@greenfieldco.com", phone: "+1 (312) 555-0391", rating: 4.7, reviews: 56, website: "greenfieldco.com" },
  { name: "Nova Marketing Group", city: "Austin, TX", email: "contact@novamarketing.co", phone: "+1 (512) 555-0462", rating: 4.6, reviews: 203, website: "novamarketing.co" },
  { name: "Bright Path Solutions", city: "Seattle, WA", email: "info@brightpath.dev", phone: "+1 (206) 555-0518", rating: 5.0, reviews: 67, website: "brightpath.dev" },
  { name :"Omnetra Infotech", city:"Rajkot", email:"omnetrainfotech@gmail.com", phone: "+919773005701",rating: 5.0, reviews: 67, website: "omntrainfotech.com"  },
  { name: "Nova Marketing Group", city: "Austin, TX", email: "contact@novamarketing.co", phone: "+1 (512) 555-0462", rating: 4.6, reviews: 203, website: "novamarketing.co" },

];

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */

function useAnimatedCounter(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || !inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView, startOnView]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Animated Dashboard Mockup                                          */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  const [typedText, setTypedText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const fullQuery = "Digital marketing agencies in New York";

  // Typing animation
  useEffect(() => {
    let i = 0;
    const typingTimer = setInterval(() => {
      if (i <= fullQuery.length) {
        setTypedText(fullQuery.slice(0, i));
        i++;
      } else {
        clearInterval(typingTimer);
        // After typing, show results
        setTimeout(() => {
          setShowResults(true);
        }, 600);
      }
    }, 55);
    return () => clearInterval(typingTimer);
  }, []);

  // Row reveal animation
  useEffect(() => {
    if (!showResults) return;
    let row = 0;
    const rowTimer = setInterval(() => {
      row++;
      if (row > mockLeads.length) {
        clearInterval(rowTimer);
      } else {
        setVisibleRows(row);
      }
    }, 200);
    return () => clearInterval(rowTimer);
  }, [showResults]);

  // Progress bar animation
  useEffect(() => {
    if (!showResults) return;
    let p = 0;
    const progTimer = setInterval(() => {
      p += 2;
      if (p > 100) {
        clearInterval(progTimer);
        setProgressWidth(100);
      } else {
        setProgressWidth(p);
      }
    }, 40);
    return () => clearInterval(progTimer);
  }, [showResults]);

  return (
    <div className="w-full select-none" style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#1E1B4B" }}>
      {/* Mock header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.8)" }}>
        <div className="flex items-center gap-2.5">
          {/* Mini logo */}
          <svg className="w-6 h-6" viewBox="-50 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <rect x="64" y="64" width="128" height="128" rx="35" stroke="#1F2937" strokeWidth="16" fill="none" />
            <circle cx="160" cy="96" r="20" fill="#1192EC" />
          </svg>
          <span className="text-sm font-bold tracking-tight" style={{ color: "#1e1b4b" }}>LeadSpotter</span>
        </div>
        <div className="hidden sm:flex items-center gap-5">
          {[
            { Icon: Search, label: "Search", active: true },
            { Icon: Zap, label: "Bulk", active: false },
            { Icon: Rocket, label: "Campaigns", active: false },
          ].map((nav) => (
            <div
              key={nav.label}
              className={`flex items-center gap-1.5 text-xs font-medium pb-0.5 ${
                nav.active
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-400"
              }`}
            >
              <nav.Icon size={16} />
              {nav.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600" style={{ background: "#EEF2FF" }}>
            NP
          </div>
        </div>
      </div>

      {/* Mock body */}
      <div
        className="p-4 sm:p-6 h-[620px]  sm:min-h-[380px]"
        style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #F5F3FF 100%)" }}
      >
        <AnimatePresence mode="wait">
          {!showResults ? (
            /* ---------- Search State ---------- */
            <motion.div
              key="search"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full min-h-[280px] sm:min-h-[340px]"
            >
              {/* Decorative blur */}
              <div className="absolute w-48 h-48 rounded-full opacity-30 blur-[80px]" style={{ background: "#c7d2fe", top: "30%", left: "20%" }} />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                className="text-2xl sm:text-3xl font-bold mb-1 text-center"
                style={{ color: "#1e1b4b" }}
              >
                Find your next customer
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3 }}
                className="text-sm italic mb-8 text-slate-500"
              >
                Search any business, anywhere.
              </motion.p>

              {/* Search pill */}
              <div
                className="flex items-center gap-3 w-full max-w-lg rounded-full p-2 pl-5"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 20px 25px -5px rgba(99,102,241,0.04)",
                }}
              >
                <Search size={20} className="text-slate-400" />
                <div className="flex-1 text-sm text-indigo-950 truncate">
                  {typedText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="inline-block w-[2px] h-4 bg-indigo-500 ml-0.5 align-middle"
                  />
                </div>
                <button
                  className="text-white text-xs font-bold px-5 py-2.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)" }}
                >
                  Search
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-5">
                {["Verified Emails", "Worldwide Data", "Direct Export"].map((badge) => (
                  <span key={badge} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} className="text-indigo-400 fill-indigo-400" />
                    <p className="truncate w-[70px] md:w-full">
                    {badge}
                    </p>
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ---------- Results State ---------- */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg sm:text-xl font-bold" style={{ color: "#1e1b4b" }}>
                    Results for &ldquo;{fullQuery}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{mockLeads.length} leads found</span>
                    {/* Animated progress */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)", width: `${progressWidth}%`, willChange: "width" }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600">{progressWidth}%</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-600"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.4)" }}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1, #3B82F6)" }}
                  >
                    <BookmarkPlus size={14} />
                    Save List
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid md:grid-cols-12 grid-cols-3 gap-2 px-4 mb-2">
                <span className="col-span-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Business</span>
                <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">Contact</span>
                <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center hidden sm:block">Rating</span>
                <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</span>
              </div>

              {/* Lead rows */}
              <div className="space-y-2">
                {mockLeads.slice(0, visibleRows).map((lead, i) => (
                  <motion.div
                    key={lead.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 4px 6px -1px rgba(99,102,241,0.02)",
                    }}
                  >
                    {/* Business */}
                    <div className="md:col-span-4 col-span-9 flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EEF2FF" }}>
                        <Store size={16} className="text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1e1b4b" }}>{lead.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                          <MapPin size={10} />
                          {lead.city}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="col-span-3 hidden sm:block min-w-0">
                      <p className="text-[10px] text-slate-600 flex items-center gap-1 truncate">
                        <Mail size={10} className="text-slate-400" />
                        {lead.email}
                      </p>
                      <p className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Phone size={10} className="text-slate-400" />
                        {lead.phone}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="col-span-2 hidden sm:flex flex-col items-center">
                      <div className="flex items-center gap-0.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold" style={{ color: "#1e1b4b" }}>{lead.rating}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{lead.reviews} reviews</span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-1.5">
                      <button
                        className="text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1, #3B82F6)" }}
                      >
                        Visit
                        <ExternalLink size={10} />
                      </button>
                      <MoreVertical size={16} className="text-slate-400 cursor-pointer hover:text-indigo-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable Animation Variants                                        */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  Section Wrapper with Scroll Animation                              */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Item                                                           */
/* ------------------------------------------------------------------ */

function FaqItem({ item, isOpen, toggle }: { item: (typeof faqs)[0]; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-indigo-100 last:border-0">
      <button onClick={toggle} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors pr-4">{item.q}</span>
        <Plus size={24} className={`text-indigo-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 leading-relaxed max-w-3xl">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Particles (decorative)                                    */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-indigo-300/20"
          style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      <LandingHeader />

      {/* ══════════════════════════════════════════════════════════════
          HERO — Olive-style bordered card with animated dashboard mockup
      ══════════════════════════════════════════════════════════════ */}
      <section className="pt-[40%] md:pt-[15%] pb-8 md:pb-12 relative">
        <FloatingParticles />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl md:rounded-[3.5rem] border border-indigo-100 bg-gradient-to-b from-indigo-50/80 via-white to-white overflow-hidden relative">
            {/* Decorative gradient blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-violet-200/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />

            <div className="px-6 sm:px-12 pt-16 md:pt-24 pb-8 text-center relative z-10">
              {/* Social proof avatars */}
              <div className="flex items-center justify-center gap-3 mb-8 hero-fade-in">
                <div className="flex -space-x-2">
                  {["bg-indigo-700", "bg-violet-700", "bg-blue-700", "bg-fuchsia-700", "bg-cyan-700"].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center hero-pop-in`}
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                    >
                      <span className="text-white text-[10px] font-bold">{["RM", "PS", "AG", "SC", "VP"][i]}</span>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Join <span className="font-bold text-indigo-600">2,000+</span> sales teams
                </span>
              </div>

              {/* Heading */}
              <h1
                className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 hero-fade-in-heading"
              >
                <span className="text-gray-900">Turn Google Maps</span>
                <br />
                <span className="text-gray-900">into your </span>
                <FlipWords words={flipWords} className="text-indigo-600" />
              </h1>

              {/* Subtitle */}
              <p
                className="max-w-2xl mx-auto mb-10 text-base font-normal text-gray-500 leading-snug tracking-wide hero-fade-in-sub"
              >
                Extract verified leads from Google Maps while you focus on closing deals.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 hero-fade-in-cta"
              >
                <Link href="/signup">
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 text-base font-bold"
                  >
                    <span>Start for Free (500 Leads)</span>
                    <ArrowRight size={20} />
                  </HoverBorderGradient>
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-3.5 rounded-full text-base font-semibold text-gray-600 border border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors flex items-center gap-2 hover:shadow-md"
                >
                  <PlayCircle size={20} className="text-indigo-400" />
                  How it Works
                </Link>
              </div>
            </div>

            {/* ── Animated Dashboard Mockup ── */}
            <div
              className="px-4 sm:px-8 md:px-12 pb-4 sm:pb-8 relative z-10 hero-fade-in-mockup"
            >
              <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-2xl shadow-indigo-500/5">
                {/* Browser chrome */}
                <div className="h-10 bg-gray-50 flex items-center px-4 gap-2 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 max-w-sm bg-gray-100 h-6 mx-auto rounded-md flex items-center px-3">
                    <span className="text-[10px] text-gray-600 truncate">app.leadspotter.in/leads</span>
                  </div>
                </div>
                {/* Live mockup */}
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 py-8 border-y border-gray-100"
          >
            {[
              { content: <>{[1,2,3,4,5].map((i)=><Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}<span className="text-sm font-bold text-gray-500 ml-1">4.9/5 on G2</span></> },
              { content: <><ShieldCheck size={20} className="text-indigo-500" /><span className="text-sm font-bold text-gray-500">GDPR &amp; CCPA Compliant</span></> },
              { content: <><TrendingUp size={20} className="text-indigo-500" /><span className="text-sm font-bold text-gray-500">1M+ Leads Extracted Daily</span></> },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex items-center gap-2">
                {item.content}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3-step grid
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Simple 3-Step Process</p>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">From keywords to closed deals</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="relative p-8 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-colors group"
              >
                <span className="text-6xl font-black text-indigo-100 group-hover:text-indigo-200 transition-colors absolute top-6 right-6 leading-none font-sans">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all"
                  >
                    <item.Icon size={28} className="text-indigo-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 border-t-2 border-dashed border-indigo-200 z-0" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES — Dark indigo section with overlapping cards
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl md:rounded-[3.5rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 px-4 sm:px-12 pt-12 md:pt-24 pb-24 md:pb-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern-white opacity-[0.03]" />

            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center max-w-2xl mx-auto mb-6 relative z-10"
            >
              <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-4">Lead Generation, Supercharged</p>
              <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Built for High-Volume Prospecting</h2>
              <p className="text-indigo-200/70 text-base sm:text-lg">Everything you need to extract, enrich, and export thousands of verified business leads.</p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.25em" }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center text-indigo-400/60 font-bold text-xs sm:text-sm uppercase mt-8 sm:mt-12 relative z-10"
            >
              100% Cloud-Powered. Always Running.
            </motion.p>
          </div>

          {/* Overlapping feature cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto -mt-16 sm:-mt-24 md:-mt-32 relative z-10"
          >
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="p-5 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/8 hover:border-indigo-200 transition-colors group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-5 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all"
                >
                  <item.Icon size={24} className="text-indigo-600" />
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px]">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          COMPARISON TABLE
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">The Smart Choice</p>
            <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900">LeadSpotter vs. Manual Prospecting</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="max-w-4xl mx-auto rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] sm:grid-cols-[2fr_1.5fr_1.5fr] bg-indigo-50/80">
              <div className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">Feature</div>
              <div className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider text-left">LeadSpotter</div>
              <div className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider text-left">Manual</div>
            </div>
            {/* Table rows */}
            {comparisonRows.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`grid grid-cols-[1.2fr_1fr_1fr] sm:grid-cols-[2fr_1.5fr_1.5fr] items-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} border-t border-gray-100`}
              >
                <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 truncate">{row.feature}</div>
                <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left truncate">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-indigo-600 font-semibold">
                    <CheckCircle size={14} className="text-emerald-500 fill-emerald-500 shrink-0 sm:[&]:w-4 sm:[&]:h-4" />
                    <span className="truncate">{row.us}</span>
                  </span>
                </div>
                <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left text-gray-400 truncate">{row.them}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Testimonials</p>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Loved by sales teams everywhere</h2>
          </motion.div>
        </div>
        <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 text-lg">Choose the plan that fits your growth ambitions.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: plan.popular ? -12 : -6, transition: { duration: 0.25 } }}
                className={`relative flex flex-col p-8 rounded-2xl border transition-colors ${
                  plan.popular
                    ? "border-indigo-300 bg-gradient-to-b from-indigo-50/80 to-white shadow-xl shadow-indigo-500/8 md:-translate-y-4"
                    : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-500 text-white uppercase tracking-wide"
                  >
                    Most Popular
                  </motion.div>
                )}
                <div className="mb-8">
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${plan.popular ? "text-indigo-600" : "text-gray-500"}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle size={16} className={`${plan.popular ? "text-indigo-500 fill-indigo-500" : "text-emerald-500 fill-emerald-500"}`} />
                      {feat}
                    </li>
                  ))}
                </ul>
                {plan.popular ? (
                  <Link href={plan.href}>
                    <HoverBorderGradient containerClassName="rounded-full w-full" className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 text-sm font-bold">{plan.cta}</HoverBorderGradient>
                  </Link>
                ) : (
                  <Link href={plan.href} className="w-full block text-center py-3 rounded-full font-bold text-sm border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">{plan.cta}</Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          FAQ ACCORDION
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="md:sticky md:top-24"
            >
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">FAQ</p>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Common questions, clear answers</h2>
              <p className="text-gray-500 leading-relaxed mb-6">Everything you need to know about LeadSpotter. Can&apos;t find your answer?</p>
              <Link href="mailto:patelnishant2006@gmail.com" className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors group">
                <Mail size={18} className="group-hover:translate-x-0.5 transition-transform" />
                Get in touch
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              {faqs.map((faq, i) => (
                <FaqItem key={i} item={faq} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="rounded-3xl md:rounded-[3.5rem] border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-violet-50/40 to-white px-6 sm:px-12 py-16 md:py-24 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-200/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              >
                Ready to supercharge your prospecting?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto"
              >
                Join thousands of sales teams already using LeadSpotter to extract, enrich, and close — on autopilot.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/signup">
                  <HoverBorderGradient containerClassName="rounded-full mx-auto" className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 text-lg font-bold">
                    <span>Start Extracting Leads</span>
                    <Rocket size={22} />
                  </HoverBorderGradient>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <LandingFooter />
    </div>
  );
}
