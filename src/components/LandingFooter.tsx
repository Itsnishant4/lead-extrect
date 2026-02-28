"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function GithubIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function LandingFooter() {
  const socialLinks = [
    { Icon: GithubIcon, href: "https://github.com/itsnishant4", label: "GitHub" },
    { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/nishantpatel44", label: "LinkedIn" },
    { Icon: FacebookIcon, href: "https://facebook.com/leadspotter", label: "Facebook" },
    { Icon: TwitterIcon, href: "https://twitter.com/leadspotter", label: "Twitter" },
    { Icon: InstagramIcon, href: "https://instagram.com/leadspotter", label: "Instagram" },
    { Icon: YoutubeIcon, href: "https://youtube.com/@leadspotter", label: "YouTube" },
  ];

  return (
    <footer className="bg-gradient-to-b from-transparent to-indigo-50/50 border-t border-indigo-100/50 pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Logo className="w-9 h-9" />
              <span className="text-xl font-bold tracking-tight text-indigo-950">LeadSpotter</span>
            </div>
            <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
              The ultimate data extraction tool for local sales teams and growth agencies. Turn maps into profit.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link key={label} className="w-9 h-9 rounded-lg bg-white/60 backdrop-blur-sm border border-indigo-100/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors duration-200" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 mb-6 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-indigo-600 transition-colors" href="/features">Features</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/use-cases">Use Cases</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/subscription">Pricing</Link></li>
            </ul>

            <h3 className="font-bold text-indigo-950 mb-6 mt-8 text-sm uppercase tracking-wider">Top Industries</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/dentists">Dentists</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/real-estate-agents">Real Estate</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/restaurants">Restaurants</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-indigo-600 transition-colors" href="/company">About Us</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/company">Contact</Link></li>
            </ul>

            <h3 className="font-bold text-indigo-950 mb-6 mt-8 text-sm uppercase tracking-wider">Top Cities</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/in/mumbai">Mumbai</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/in/delhi">Delhi</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/leads/in/bangalore">Bangalore</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 mb-6 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a className="hover:text-indigo-600 transition-colors" href="mailto:patelnishant2006@gmail.com">Email</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 mb-6 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-indigo-600 transition-colors" href="/privacy">Privacy</Link></li>
              <li><Link className="hover:text-indigo-600 transition-colors" href="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm mx-auto text-slate-400">&copy; {new Date().getFullYear()} LeadSpotter Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
