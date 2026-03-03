"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {motion} from 'motion/react'
import { ArrowRight } from "phosphor-react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { Facebook } from "lucide-react";

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export function LandingFooter() {
  const socialLinks = [
    { Icon: TwitterIcon, href: "https://x.com/leadspotter_in", label: "Twitter" },
    { Icon: InstagramIcon, href: "https://instagram.com/leadspotter.in", label: "Instagram" },
    {Icon: Facebook, href: "https://www.facebook.com/people/LeadsPotterin/61588329951050/", label: "Facebook"},
    { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/nishantpatel44", label: "LinkedIn" },
  ];

  return (
    <div className="">
      {/* Black CTA Section */}
      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="py-16 sm:py-28">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 sm:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-white/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl  font-bold tracking-tight mb-6">
                Ready to transform your data?
              </h2>
              <p className="text-gray-400 text-md md:text-lg mb-10 max-w-xl font-medium">
                Join thousands of data-driven professionals who are extracting beautiful, verified leads in minutes.
              </p>
                <Link href="/signup" className="cursor-pointer"><HoverBorderGradient containerClassName="rounded-full mx-auto" className="flex  items-center gap-2 bg-white text-indigo-700 px-8 py-3 text-sm font-bold">Get Started Free<ArrowRight size={16} /></HoverBorderGradient></Link>
             
            </div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* Footer Section */}
      <footer className="relative pb-32 md:pb-52 overflow-hidden">
        {/* Massive Background Text - placed behind everything but inside the footer wrapper */}
        <div className="absolute bottom-10 md:-bottom-0 left-0 w-full overflow-hidden flex justify-center pointer-events-none z-0">
          <span className="text-[17vw] font-black text-gray-200/40 leading-[0.8] tracking-tighter translate-y-[-10%] md:translate-y-[40%] select-none">
            LeadSpotter
          </span>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 lg:p-16 w-full max-w-7xl mx-auto backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
              
              {/* Brand Column */}
              <div className="max-w-sm shrink-0">
                <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
                  <Logo className="w-8 h-8 text-indigo-600 group-hover:scale-105 transition-transform" />
                  <span className="text-xl font-bold tracking-tight text-gray-900">LeadSpotter</span>
                </Link>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  LeadSpotter empowers sales teams to transform raw public data into clear, verified B2B leads — making outreach easier to scale, understand, and act on.
                </p>
                <div className="flex items-center gap-5">
                  {socialLinks.map(({ Icon, href, label }) => (
                    <Link 
                      key={label} 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={label}
                      className="text-gray-400 hover:text-gray-900 transition-colors duration-200"
                    >
                      <Icon size={20}/>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 w-full lg:w-auto lg:min-w-[500px] xl:min-w-[600px] justify-between">
                
                {/* Product Col */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 text-sm">Product</h3>
                  <ul className="space-y-4 text-sm text-gray-500 font-medium">
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features">Features</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/pricing">Pricing</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/use-cases">Use Cases</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features/google-maps-extractor">Maps Extractor</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features/email-enrichment">Email Enrichment</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features/bulk-keyword-generator">Keyword Generator</Link></li>
                  </ul>
                </div>

                {/* Resources Col */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 text-sm">Resources</h3>
                  <ul className="space-y-4 text-sm text-gray-500 font-medium">
                    <li><Link className="hover:text-gray-900 transition-colors" href="/blog">Blog & Tutorials</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/dentists">Dentists Leads</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/real-estate-agents">Real Estate Leads</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/in/mumbai">Mumbai Directory</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/in/delhi">Delhi Directory</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/sitemap.xml">Sitemap</Link></li>
                  </ul>
                </div>

                {/* Company Col */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 text-sm">Company & Compare</h3>
                  <ul className="space-y-4 text-sm text-gray-500 font-medium">
                    <li><Link className="hover:text-gray-900 transition-colors" href="/company">About Us</Link></li>
                    <li><a className="hover:text-gray-900 transition-colors" href="mailto:patelnishant2006@gmail.com">Support & Contact</a></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-apollo">vs Apollo.io</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-zoominfo">vs ZoomInfo</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-lusha">vs Lusha</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-hunter">vs Hunter</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-snov">vs Snov.io</Link></li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-gray-500 font-medium">
                &copy; {new Date().getFullYear()} LeadSpotter. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-gray-500 font-medium">
                <Link className="hover:text-gray-900 hover:underline transition-colors" href="/privacy">Privacy Policy</Link>
                <Link className="hover:text-gray-900 hover:underline transition-colors" href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}