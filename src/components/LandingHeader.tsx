"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LandingHeader() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 dark:border-white/5 bg-white/70 dark:bg-background-dark/70 backdrop-blur-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-800 tracking-tight text-slate-900 dark:text-white">
            Lead<span className="text-primary">Spotter</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <Link
            className="hover:text-primary transition-colors"
            href="/#features"
          >
            Features
          </Link>
          <Link className="hover:text-primary transition-colors" href="/#why">
            Why Us
          </Link>
          <Link className="hover:text-primary transition-colors" href="/#pricing">
            Pricing
          </Link>
          <Link className="hover:text-primary transition-colors" href="/company">
            Company
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-all hover:-translate-y-0.5">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95">
              Start for Free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
