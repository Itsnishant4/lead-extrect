"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Radar, ArrowRight, PlayCircle, Star, ShieldCheck, TrendingUp, Layers, Map, MapPin, Pin, Cloud, Database, Mail, Phone, Share2, Zap, Wand2, CheckCircle } from 'lucide-react';
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      <LandingHeader />

      {/* Hero Section */}
      <section className=" overflow-hidden h-screen ">
        <div className="absolute inset-0 -z-10  overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#1392ec 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-6 pt-[12%]">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Bulk Keyword Extractions Now Live
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-800 text-slate-900 dark:text-white leading-[1.1] mb-6"
            >
              Turn Google Maps into your{" "}
              <span className="text-primary">Lead Machine</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Automate your prospecting with background extraction and bulk
              keyword generation. Get verified data while you focus on closing
              deals.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/signup">
                <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group">
                  Start for Free (500 Leads)
                  <span className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="text-white h-5 w-5" strokeWidth={3} />
                  </span>
                </button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <PlayCircle className="text-primary h-5 w-5" />
                How it Works
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold text-slate-400 uppercase tracking-[0.2em] mb-12"
          >
            Powering lead generation for the world’s most innovative sales teams
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale dark:invert dark:opacity-40 mb-16"
          >
            <svg
              className="h-8 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 10l-4 8 4 8h10l4-8-4-8H12zm25 0h6v16h-6V10zm12 0h6v6h-6v-6zm0 10h6v6h-6v-6zm12-10h6v16h-6V10zm12 0h6v16h-6V10zm12 0h6v16h-6V10z opacity-20"></path>
            </svg>
            <svg
              className="h-8 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="10"></circle>
              <rect height="20" rx="4" width="60" x="40" y="10"></rect>
            </svg>
            <svg
              className="h-9 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 10h20v20h-20zM40 10h20v20h-20zM70 10h20v20h-20z"></path>
            </svg>
            <svg
              className="h-7 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 20L30 10V30L10 20ZM40 10H100V30H40V10Z"></path>
            </svg>
            <svg
              className="h-8 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 10L10 30H30L20 10Z"></path>
              <rect height="20" width="10" x="45" y="10"></rect>
              <rect height="20" width="10" x="65" y="10"></rect>
              <rect height="20" width="10" x="85" y="10"></rect>
            </svg>
            <svg
              className="h-8 w-auto"
              fill="currentColor"
              viewBox="0 0 120 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="20" cy="20" rx="15" ry="10"></ellipse>
              <rect height="10" rx="2" width="50" x="50" y="15"></rect>
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
          >
            <div className="flex items-center gap-2">
              <Star className="text-amber-400 h-4 w-4 fill-current" />
              <Star className="text-amber-400 h-4 w-4 fill-current" />
              <Star className="text-amber-400 h-4 w-4 fill-current" />
              <Star className="text-amber-400 h-4 w-4 fill-current" />
              <Star className="text-amber-400 h-4 w-4 fill-current" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                4.9/5 Rating on G2
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary h-5 w-5" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                GDPR &amp; CCPA Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                1M+ Leads Extracted Daily
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
              Lead Generation, Supercharged
            </h2>
            <h3 className="text-4xl font-800 text-slate-900 dark:text-white">
              Built for High-Volume Prospecting
            </h3>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-8 pb-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="text-primary h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold mb-3 dark:text-white">
                  Bulk Keyword Generation
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Combine hundreds of niches and locations in one click for
                  massive search coverage. Scale your reach effortlessly.
                </p>
              </div>
              <div className="px-8 pb-8">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                      <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded">
                        NICHE
                      </div>
                      <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="text-primary font-bold text-xs ml-auto">
                        × 50
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                      <div className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded">
                        CITY
                      </div>
                      <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="text-amber-500 font-bold text-xs ml-auto">
                        × 100
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        Total Combinations
                      </span>
                      <span className="text-xl font-800 text-primary">
                        5,000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-8 pb-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Map className="text-primary h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold mb-3 dark:text-white">
                  Localized Area-wise Search
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Pinpoint businesses with surgical precision using zip-code and
                  neighborhood targeting across any global market.
                </p>
              </div>
              <div className="px-8 pb-8 h-48 relative">
                <div className="absolute inset-x-8 bottom-8 top-0 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #1392ec 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute -inset-12 bg-primary/10 rounded-full animate-pulse"></div>
                      <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="text-white h-4 w-4" />
                      </div>
                      <Pin className="absolute -top-12 -right-16 text-primary w-6 h-6 opacity-50" />
                      <Pin className="absolute top-8 -left-20 text-primary w-6 h-6 opacity-50" />
                      <Pin className="absolute -bottom-14 right-4 text-primary w-6 h-6 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-8 pb-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Cloud className="text-primary h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold mb-3 dark:text-white">
                  24/7 Cloud Processing
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Start your task and walk away. Our servers handle the
                  extraction in the background while you sleep or close deals.
                </p>
              </div>
              <div className="px-8 pb-8">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400">
                      Current Campaign:{" "}
                      <span className="text-primary uppercase">
                        NY_Real_Estate
                      </span>
                    </span>
                    <span className="text-xs font-bold text-primary">82%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-4">
                    <div className="bg-primary h-full w-[82%] rounded-full shadow-[0_0_10px_#1392ec]"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-800 dark:text-white">
                        4,281
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                        Leads Extracted
                      </span>
                    </div>
                    <div className="flex flex-col ml-auto text-right">
                      <span className="text-lg font-800 text-green-500">
                        Live
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                        Server Status
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-8 pb-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Database className="text-primary h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold mb-3 dark:text-white">
                  Deep Data Enrichment
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Go beyond basic G-Maps info. We scrape websites to find hidden
                  emails, social profiles, and direct phone numbers.
                </p>
              </div>
              <div className="px-8 pb-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Mail className="text-blue-500 w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      Email
                    </span>
                  </div>
                  <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Phone className="text-green-500 w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      Phone
                    </span>
                  </div>
                  <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Share2 className="text-purple-500 w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      Socials
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="h-10 bg-slate-100 dark:bg-slate-700 flex items-center px-4 gap-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 max-w-md bg-white dark:bg-slate-600 h-6 mx-auto rounded flex items-center px-3">
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px] md:max-w-[200px]">
                    app.leadspotter.io/campaigns/extraction-ny-agencies
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-6 bg-slate-50 dark:bg-slate-900">
                <img
                  alt="LeadSpotter Interactive Dashboard"
                  className="rounded-xl w-full shadow-inner dark:brightness-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASuWXbVXa6QCa3llIQRf7qF-yrJTuI9cpk1IosnoX-JO2tihjcyJkTG0o9otaIxsjqdLcgNXO_1xgtGlEmXXFbjDy93eTZ1QzNtHm21NOClpJ95NtYTJ6b1RHbeZHU0ew8ARoUl7cRqlr1WHud5HxpiDh_xs7hMW28mp0hQvUyGMvLN6Tlps5hAQ0fKpVoVM1e5e7Jx69mgRBS5KeoX7wUTx7bsDPwTp_XQl4GLbYLPN42eyPuVkUTP6k3u3qtBvp1LfBixRUvsPc"
                />
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-slate-500 font-medium">
                Visualizing real-time data extraction from thousands of map pins
                simultaneously.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-32" id="why">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
              Why LeadSpotter
            </h2>
            <h3 className="text-4xl lg:text-5xl font-800 text-slate-900 dark:text-white leading-tight">
              Built for Uncompromising Performance
            </h3>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-16 mb-24"
          >
            <motion.div variants={fadeInUp} className="text-center group">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Zap className="text-primary group-hover:text-white w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold mb-4 dark:text-white">
                Lightning Speed
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Extract thousands of records in minutes. Our distributed cloud
                infrastructure ensures you never have to wait for your leads.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center group">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ShieldCheck className="text-primary group-hover:text-white w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold mb-4 dark:text-white">
                Unmatched Accuracy
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                No more bouncing emails or dead lines. We cross-verify every
                data point across multiple sources to ensure high deliverability.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center group">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Wand2 className="text-primary group-hover:text-white w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold mb-4 dark:text-white">
                Workflow Efficiency
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Automate the boring stuff. From bulk keyword generation to
                CRM-ready exports, save 20+ hours of manual labor every week.
              </p>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-primary rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
            <div className="relative z-10">
              <h4 className="text-3xl md:text-4xl font-800 mb-6">
                Join 2,000+ sales teams closing more deals
              </h4>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Scale your outreach without scaling your overhead. Get access to
                the most powerful Google Maps scraper on the market.
              </p>
              <Link href="/signup">
                <button className="bg-white text-primary hover:bg-slate-100 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-xl inline-flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="pricing">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-800 text-slate-900 dark:text-white mb-4">
              LeadSpotter Pricing
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Choose the plan that fits your growth ambitions.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all hover:shadow-xl">
              <div className="mb-8">
                <h4 className="text-lg font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Starter
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-800 dark:text-white">₹0</span>
                  <span className="text-slate-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  500 Leads per month
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Localized search
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Google Maps data scraper
                </li>
              </ul>
              <Link href="/signup" className="w-full block text-center py-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white">
                Get Started
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-800 p-10 rounded-3xl border-2 border-primary relative shadow-2xl shadow-primary/10 flex flex-col transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase">
                Most Popular
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide">
                  Pro
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-800 dark:text-white">
                    ₹2,000
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-sm lg:text-base">
                <li className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
                  <CheckCircle className="text-primary h-4 w-4" />
                  5,000 Leads per month
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-primary h-4 w-4" />
                  Social media enrichment
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-primary h-4 w-4" />
                  Bulk keyword generation
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-primary h-4 w-4" />
                  CSV/JSON data exports
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-primary h-4 w-4" />
                  Priority email support
                </li>
              </ul>
              <Link href="/signup" className="w-full block text-center py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                Upgrade to Pro
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all hover:shadow-xl">
              <div className="mb-8">
                <h4 className="text-lg font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Premium
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-800 dark:text-white">
                    Custom
                  </span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-sm lg:text-base">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Unlimited leads
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Full API access
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  Custom scrapers &amp; workflow
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  SLA &amp; On-prem options
                </li>
              </ul>
              <a href="mailto:sales@leadspotter.io" className="w-full block text-center py-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white">
                Contact Sales
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}
