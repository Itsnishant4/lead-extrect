"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, PlayCircle, Plus, Search, Star, MapPin, Mail, Phone, ExternalLink, MoreVertical, Store, CheckCircle, Download, BookmarkPlus
} from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const InfiniteMovingCards = dynamic(() => import("@/components/ui/infinite-moving-cards").then(mod => ({ default: mod.InfiniteMovingCards })), { ssr: false });

const flipWords = ["Lead Machine", "Sales Engine", "Growth Pipeline", "Revenue Source"];

const mockLeads = [
  { name: "Skyline Digital Agency", city: "New York, NY", email: "hello@skylinedigital.com", phone: "+1 (212) 555-0147", rating: 4.8, reviews: 124, website: "skylinedigital.com" },
  { name: "Peak Performance Studio", city: "Los Angeles, CA", email: "info@peakstudio.io", phone: "+1 (310) 555-0283", rating: 4.9, reviews: 89, website: "peakstudio.io" },
  { name: "Greenfield Consulting", city: "Chicago, IL", email: "team@greenfieldco.com", phone: "+1 (312) 555-0391", rating: 4.7, reviews: 56, website: "greenfieldco.com" },
  { name: "Nova Marketing Group", city: "Austin, TX", email: "contact@novamarketing.co", phone: "+1 (512) 555-0462", rating: 4.6, reviews: 203, website: "novamarketing.co" },
  { name: "Bright Path Solutions", city: "Seattle, WA", email: "info@brightpath.dev", phone: "+1 (206) 555-0518", rating: 5.0, reviews: 67, website: "brightpath.dev" },
  { name: "Omnetra Infotech", city: "Rajkot", email: "omnetrainfotech@gmail.com", phone: "+919773005701", rating: 5.0, reviews: 67, website: "omntrainfotech.com" },
];

function DashboardMockup() {
  const [typedText, setTypedText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const fullQuery = "Digital marketing agencies in New York";

  useEffect(() => {
    let i = 0;
    const typingTimer = setInterval(() => {
      if (i <= fullQuery.length) {
        setTypedText(fullQuery.slice(0, i));
        i++;
      } else {
        clearInterval(typingTimer);
        setTimeout(() => setShowResults(true), 600);
      }
    }, 55);
    return () => clearInterval(typingTimer);
  }, []);

  useEffect(() => {
    if (!showResults) return;
    let row = 0;
    const rowTimer = setInterval(() => {
      row++;
      if (row > mockLeads.length) clearInterval(rowTimer);
      else setVisibleRows(row);
    }, 200);
    return () => clearInterval(rowTimer);
  }, [showResults]);

  useEffect(() => {
    if (!showResults) return;
    let p = 0;
    const progTimer = setInterval(() => {
      p += 2;
      if (p > 100) {
        clearInterval(progTimer);
        setProgressWidth(100);
      } else setProgressWidth(p);
    }, 40);
    return () => clearInterval(progTimer);
  }, [showResults]);

  return (
    <div className="w-full select-none" style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#1E1B4B" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.8)" }}>
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" viewBox="-50 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <rect x="64" y="64" width="128" height="128" rx="35" stroke="#1F2937" strokeWidth="16" fill="none" />
            <circle cx="160" cy="96" r="20" fill="#1192EC" />
          </svg>
          <span className="text-sm font-bold tracking-tight" style={{ color: "#1e1b4b" }}>LeadSpotter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600" style={{ background: "#EEF2FF" }}>NP</div>
        </div>
      </div>

      <div className="p-4 sm:p-6 h-[620px] sm:min-h-[380px]" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #F5F3FF 100%)" }}>
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="search" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center h-full">
              <p className="serif-font text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: "#1e1b4b" }}>Find your next customer</p>
              <div className="flex items-center gap-3 w-full max-w-lg rounded-full p-2 pl-5 bg-white/70 backdrop-blur-xl border border-white/40">
                <Search size={20} className="text-slate-400" />
                <div className="flex-1 text-sm text-indigo-950 truncate">{typedText}<span className="inline-block w-[2px] h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse" /></div>
                <button className="text-white text-xs font-bold px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">Search</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold" style={{ color: "#1e1b4b" }}>Results for "{fullQuery}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-1.5 rounded-full bg-white/60 overflow-hidden">
                      <motion.div className="h-full bg-indigo-600" style={{ width: `${progressWidth}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {mockLeads.slice(0, visibleRows).map((lead, i) => (
                  <motion.div key={lead.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm">
                    <Store size={16} className="text-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{lead.name}</p>
                      <p className="text-[10px] text-slate-400">{lead.city}</p>
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

function FaqItem({ item, isOpen, toggle }: { item: any; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-indigo-100 last:border-0">
      <button onClick={toggle} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors pr-4">{item.q}</span>
        <Plus size={24} className={`text-indigo-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-6 text-gray-500 leading-relaxed max-w-3xl">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomeClient({ flipWords, testimonials, faqs }: any) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <section className="pt-[40%] md:pt-[15%] pb-8 md:pb-12 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl md:rounded-[3.5rem] border border-indigo-100 bg-gradient-to-b from-indigo-50/80 via-white to-white overflow-hidden relative">
            <div className="px-6 sm:px-12 pt-16 md:pt-24 pb-8 text-center relative z-10">
              <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Turn Maps into your <FlipWords words={flipWords} className="text-indigo-600" />
              </h1>
              <p className="max-w-2xl mx-auto mb-10 text-base font-normal text-gray-500 leading-snug tracking-wide">
                Extract verified leads from maps while you focus on closing deals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/signup">
                  <HoverBorderGradient containerClassName="rounded-full" className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 text-base font-bold">
                    <span>Start for Free</span>
                    <ArrowRight size={20} />
                  </HoverBorderGradient>
                </Link>
                <Link href="#how-it-works" className="px-8 py-3.5 rounded-full text-base font-semibold text-gray-600 border border-gray-200 bg-white hover:border-indigo-200 flex items-center gap-2">
                  <PlayCircle size={20} className="text-indigo-400" />
                  How it Works
                </Link>
              </div>
            </div>
            <div className="px-4 sm:px-8 md:px-12 pb-4 sm:pb-8 relative z-10">
              <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-2xl shadow-indigo-500/5">
                <div className="h-10 bg-gray-50 flex items-center px-4 gap-2 border-b border-gray-100">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80" /><div className="w-3 h-3 rounded-full bg-amber-400/80" /><div className="w-3 h-3 rounded-full bg-green-400/80" /></div>
                </div>
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center mb-12">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Loved by sales teams everywhere</h2>
        </div>
        <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
              <p className="text-gray-500 mb-6">Everything you need to know about LeadSpotter.</p>
            </div>
            <div>
              {faqs.map((faq: any, i: number) => (
                <FaqItem key={i} item={faq} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
