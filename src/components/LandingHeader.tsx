"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FloatingNav } from "@/components/ui/floating-navbar";

interface LandingHeaderProps {
  hasBanner?: boolean;
}

export function LandingHeader({ hasBanner = false }: LandingHeaderProps) {
  const navItems = [
    { name: "Features", link: "/features" },
    { name: "Use Cases", link: "/use-cases" },
    { name: "Pricing", link: "/pricing" },
    { name: "Blog", link: "/blog" },
    { name: "Company", link: "/company" },
  ];

  return (
    <>
      <FloatingNav
        hasBanner={hasBanner}
        navItems={navItems}
        logo={
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-base font-bold tracking-tight text-indigo-950">
              LeadSpotter
            </span>
          </Link>
        }
        rightContent={
          <Link href="/signup">
            <button className="text-white  px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-indigo-200/50 active:scale-95 transition-colors"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)" }}
            >
              Start Free
            </button>
          </Link>
        }
      />
    </>
  );
}
