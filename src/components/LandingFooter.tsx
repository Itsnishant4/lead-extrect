"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-800 tracking-tight text-slate-900 dark:text-white">
                Lead<span className="text-primary">Spotter</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
              The ultimate data extraction tool for local sales teams and growth
              agencies. Turn maps into profit.
            </p>
            <div className="flex gap-4">
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://github.com/itsnishant4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://www.linkedin.com/in/nishantpatel44"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://facebook.com/leadspotter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://twitter.com/leadspotter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://instagram.com/leadspotter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                href="https://youtube.com/@leadspotter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white mb-6">
              Product
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link className="hover:text-primary" href="/#features">
                  Features
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Bulk Tool
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/#pricing">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white mb-6">
              Company
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link className="hover:text-primary" href="/company">
                  About Us
                </Link>
              </li>

              <li>
                <Link className="hover:text-primary" href="/company">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white mb-6">
              Support
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a
                  className="hover:text-primary"
                  href="mailto:patelnishant2006@gmail.com"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white mb-6">
              Legal
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link className="hover:text-primary" href="/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/terms">
                  Terms
                </Link>
              </li>

            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm mx-auto text-slate-400">
            © {new Date().getFullYear()} LeadSpotter Inc. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
