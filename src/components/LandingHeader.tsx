"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LandingHeader() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-12 h-12" />
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
            <button className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/25">
              Start for Free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
