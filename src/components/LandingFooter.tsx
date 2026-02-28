"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

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
    { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/nishantpatel44", label: "LinkedIn" },
  ];

  return (
    <div className="bg-[#f8f9fc]">
      {/* Black CTA Section */}
      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center">
            
            {/* Subtle top glow effect to match the image */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-white/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Ready to transform your data?
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl font-medium">
                Join thousands of data-driven professionals who are extracting beautiful, verified leads in minutes.
              </p>
              <Link 
                href="/signup" 
                className="bg-white text-black hover:bg-gray-100 transition-colors px-8 py-3.5 rounded-full font-bold text-[15px] inline-flex items-center gap-2"
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative pt-12 pb-12 overflow-hidden">
        {/* Massive Background Text - placed behind everything but inside the footer wrapper */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden flex justify-center pointer-events-none z-0">
          <span className="text-[17vw] font-black text-gray-200/40 leading-[0.8] tracking-tighter translate-y-[20%] select-none">
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
                      <Icon />
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
                    <li><Link className="hover:text-gray-900 transition-colors" href="/subscription">Pricing</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/use-cases">Use Cases</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features/google-maps-extractor">Maps Extractor</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features/email-enrichment">Email Enrichment</Link></li>
                  </ul>
                </div>

                {/* Resources Col */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 text-sm">Resources</h3>
                  <ul className="space-y-4 text-sm text-gray-500 font-medium">
                    <li><Link className="hover:text-gray-900 transition-colors" href="/blog">Blog & Tutorials</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/dentists">Dentists Leads</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/leads/in/mumbai">Mumbai Directory</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-phantombuster">vs PhantomBuster</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-apollo">vs Apollo.io</Link></li>
                  </ul>
                </div>

                {/* Company Col */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 text-sm">Company</h3>
                  <ul className="space-y-4 text-sm text-gray-500 font-medium">
                    <li><Link className="hover:text-gray-900 transition-colors" href="/company">About</Link></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/company">Contact</Link></li>
                    <li><a className="hover:text-gray-900 transition-colors" href="mailto:patelnishant2006@gmail.com">Support</a></li>
                    <li><Link className="hover:text-gray-900 transition-colors" href="/features">Changelog</Link></li>
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
                <Link className="hover:text-gray-900 hover:underline transition-colors" href="/company">Cookies Settings</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}