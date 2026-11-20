"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight, Mail, MapPin, Globe, Target, Users, Zap, Heart, Shield, Rocket, TrendingUp, Clock, CheckCircle,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { LandingFooter } from "@/components/LandingFooter";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return { count, ref };
}

function AnimatedSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section id={id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } }}
      className={className}>{children}</motion.section>
  );
}

const stats = [
  { value: 2, suffix: "M+", label: "Data points processed daily" },
  { value: 5000, suffix: "+", label: "Active users worldwide" },
  { value: 99, suffix: "%", label: "Uptime reliability" },
  { value: 150, suffix: "+", label: "Countries served" },
];
const values = [
  { Icon: Target, title: "Mission-Driven", description: "Every feature we build starts with one question: does this help our users close more deals?" },
  { Icon: Zap, title: "Speed First", description: "We obsess over performance. From cloud extraction to data delivery, every millisecond counts." },
  { Icon: Shield, title: "Privacy & Compliance", description: "We only collect publicly available data. Fully GDPR and CCPA compliant, always." },
  { Icon: Heart, title: "Customer Obsessed", description: "Our support team responds in minutes, not days. Your success is our success." },
  { Icon: Users, title: "Built for Teams", description: "From solo freelancers to enterprise sales floors, we scale with your needs." },
  { Icon: Rocket, title: "Always Shipping", description: "Weekly releases, monthly major features. We never stop improving." },
];
const timeline = [
  { year: "2024", title: "The Spark", description: "Frustrated with manual prospecting, we built the first version of LeadSpotter in a weekend." },
  { year: "2024", title: "First 1,000 Users", description: "Word spread fast. Agency owners and freelancers found us through communities and referrals." },
  { year: "2025", title: "Cloud Processing", description: "Launched background extraction so users could set tasks and walk away." },
  { year: "2025", title: "Bulk Keywords & Enrichment", description: "One-click keyword generation and deep website scraping for emails, phones, and socials." },
  { year: "2026", title: "Global Scale", description: "Processing millions of data points daily for thousands of users across 150+ countries." },
];

export default function CompanyPageClient() {
  const stat1 = useAnimatedCounter(stats[0].value, 1500);
  const stat2 = useAnimatedCounter(stats[1].value, 2000);
  const stat3 = useAnimatedCounter(stats[2].value, 1500);
  const stat4 = useAnimatedCounter(stats[3].value, 1800);
  const statCounters = [stat1, stat2, stat3, stat4];

  return (
    <div className="bg-white text-slate-900 antialiased h-screen min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="w-full bg-gray-50 md:pt-44 pt-28 h-screen">
          <div className="mx-auto grid max-h-[50rem] max-w-5xl grid-cols-1 items-start gap-10 overflow-hidden sm:grid-cols-2 md:max-h-[40rem] md:pt-10 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" as const }} className="px-6 py-10 md:px-10 md:py-10 lg:col-span-2">
              <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-left sm:text-4xl lg:text-7xl">
                Your tool for{" "}
                <FlipWords words={["lead generation", "smart prospecting", "market research", "sales growth"]} className="text-indigo-600" />{" "}
                <br className="hidden sm:block" />built with passion
              </h1>
              <p className="mt-4 max-w-2xl text-center text-sm text-gray-500 sm:text-left md:mt-10 md:text-lg">
                We believe every business deserves access to high-quality market intelligence. LeadSpotter turns public maps data into structured, actionable opportunities — helping thousands of sales teams worldwide close deals faster.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Link href="/signup"><motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-700 sm:w-auto">Get Started Free</motion.button></Link>
                <a href="#timeline" className="rounded-lg border border-transparent px-4 py-2 text-base text-gray-700 transition-colors hover:border-indigo-300 hover:text-indigo-600">Read our story</a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" as const }} className="relative flex h-full w-full flex-shrink-0 justify-end overflow-hidden">
              <div className="relative m-auto w-full max-w-[340px] pt-10 md:pt-16">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-indigo-500/10">
                  <div className="mb-4 flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" /><div className="ml-2 h-5 flex-1 rounded bg-gray-100" /></div>
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>Restaurants in San Francisco...</div>
                  {[
                    { name: "Blue Bottle Coffee", rating: "4.8", type: "Cafe", color: "bg-blue-50 text-blue-700" },
                    { name: "Tartine Bakery", rating: "4.7", type: "Bakery", color: "bg-amber-50 text-amber-700" },
                    { name: "Nopa Restaurant", rating: "4.6", type: "Restaurant", color: "bg-emerald-50 text-emerald-700" },
                  ].map((lead, i) => (
                    <motion.div key={lead.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }} className="mb-2 flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 last:mb-0">
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-900">{lead.name}</p><div className="mt-1 flex items-center gap-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${lead.color}`}>{lead.type}</span><span className="text-[10px] text-gray-400">★ {lead.rating}</span></div></div>
                      <div className="ml-2 flex gap-1"><div className="h-6 w-6 rounded bg-indigo-50 p-1"><Mail size={14} className="text-indigo-500" /></div><div className="h-6 w-6 rounded bg-indigo-50 p-1"><Globe size={14} className="text-indigo-500" /></div></div>
                    </motion.div>
                  ))}
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2"><div className="text-center"><p className="text-sm font-bold text-indigo-700">847</p><p className="text-[10px] text-indigo-500">Leads</p></div><div className="h-6 w-px bg-indigo-200" /><div className="text-center"><p className="text-sm font-bold text-indigo-700">92%</p><p className="text-[10px] text-indigo-500">Emails</p></div><div className="h-6 w-px bg-indigo-200" /><div className="text-center"><p className="text-sm font-bold text-indigo-700">3.2s</p><p className="text-[10px] text-indigo-500">Avg Time</p></div></div>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 200 }} className="absolute -left-4 bottom-16 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /><span className="text-xs font-medium text-gray-700">Export ready</span></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <AnimatedSection className="py-12 sm:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, i) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 mb-2"><span ref={statCounters[i].ref}>{statCounters[i].count.toLocaleString()}</span><span>{stat.suffix}</span></div>
                  <p className="text-sm sm:text-base text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="timeline" className="py-16 sm:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Our Journey</p>
              <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">From Side Project to Global Platform</h2>
              <p className="text-gray-500 text-base sm:text-lg">What started as a weekend hack to solve our own prospecting pain has grown into a tool used by thousands worldwide.</p>
            </motion.div>
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-indigo-400 to-indigo-200 sm:-translate-x-px" />
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative flex items-start gap-6 mb-10 sm:mb-12 ${i % 2 === 0 ? "sm:flex-row sm:text-right" : "sm:flex-row-reverse sm:text-left"} flex-row text-left`}>
                  <div className="absolute left-4 sm:left-1/2 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-md -translate-x-1.5 sm:-translate-x-1.5 z-10" />
                  <div className={`pl-10 sm:pl-0 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12" : "sm:pl-12"}`}>
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-2">{item.year}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-16 sm:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="rounded-3xl md:rounded-[3.5rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 px-4 sm:px-12 pt-12 md:pt-24 pb-24 md:pb-40 relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern-white opacity-[0.03]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-6 relative z-10">
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-4">What Drives Us</p>
                <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Our Core Values</h2>
                <p className="text-indigo-200/70 text-base sm:text-lg">The principles that guide every decision we make.</p>
              </motion.div>
              <motion.p initial={{ opacity: 0, letterSpacing: "0.15em" }} whileInView={{ opacity: 1, letterSpacing: "0.25em" }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }} className="text-center text-indigo-400/60 font-bold text-xs sm:text-sm uppercase mt-8 sm:mt-12 relative z-10">People First. Always.</motion.p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto -mt-16 sm:-mt-24 md:-mt-32 relative z-10">
              {values.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i} whileHover={{ y: -8, transition: { duration: 0.25 } }} className="p-5 sm:p-7 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/8 hover:border-indigo-200 transition-colors group">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all">
                    <item.Icon size={20} className="text-indigo-600" />
                  </motion.div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{item.title}</h4>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-16 sm:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Get in Touch</p>
              <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">We&apos;d Love to Hear from You</h2>
              <p className="text-gray-500 text-base sm:text-lg">Whether you have a question, feedback, or just want to say hello.</p>
            </motion.div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <motion.div variants={scaleIn} whileHover={{ y: -6, transition: { duration: 0.25 } }} className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:border-indigo-200 transition-all text-center group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all"><MapPin size={22} className="text-indigo-600" /></div>
                <h3 className="font-bold text-gray-900 mb-1">Headquarters</h3><p className="text-gray-500 text-sm">Rajkot, Gujarat</p><p className="text-gray-400 text-sm">India</p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ y: -6, transition: { duration: 0.25 } }} className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:border-indigo-200 transition-all text-center group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all"><Mail size={22} className="text-indigo-600" /></div>
                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3><a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">contact@leadspotter.in</a>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ y: -6, transition: { duration: 0.25 } }} className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:border-indigo-200 transition-all text-center group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all"><Globe size={22} className="text-indigo-600" /></div>
                <h3 className="font-bold text-gray-900 mb-1">Socials</h3>
                <div className="flex items-center justify-center gap-4"><a href="https://github.com/itsnishant4" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">GitHub</a><span className="text-gray-300">|</span><a href="https://www.linkedin.com/in/nishantpatel44" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">LinkedIn</a></div>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>
      <LandingFooter />
    </div>
  );
}
