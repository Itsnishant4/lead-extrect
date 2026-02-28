"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
  logo,
  rightContent,
  alwaysVisible = false,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
    active?: boolean;
  }[];
  className?: string;
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  alwaysVisible?: boolean;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof window !== "undefined") {
      setIsAtTop(window.scrollY < 40);
    }
    
    if (alwaysVisible) {
      setVisible(true);
      return;
    }
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        // At the top of the page — always show
        setVisible(true);
      } else {
        // Scrolling up — show, scrolling down — hide
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex fixed mx-auto inset-x-0 rounded-full bg-white/80 backdrop-blur-xl border border-indigo-100/60 shadow-[0_8px_32px_rgba(99,102,241,0.08),0_1px_2px_rgba(99,102,241,0.04)] z-[5000] px-4 py-2.5 items-center justify-between gap-4 max-w-3xl transition-all duration-300",
          isAtTop ? "top-14 sm:top-12" : "top-6",
          className
        )}
      >
        {/* Logo */}
        {logo && <div className="shrink-0">{logo}</div>}

        {/* Nav Links */}
        <nav className="flex items-center gap-1 md:flex hidden">
          {navItems.map((navItem, idx) => (
            <Link
              key={`nav-${idx}`}
              href={navItem.link}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                navItem.active
                  ? "text-indigo-600 bg-indigo-50/80"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
              )}
            >
              {navItem.icon && (
                <span className="block">{navItem.icon}</span>
              )}
              <span className="hidden sm:block">{navItem.name}</span>
            </Link>
          ))}
        </nav>

        {/* Right content */}
        {rightContent && <div className="shrink-0">{rightContent}</div>}
      </motion.div>
    </AnimatePresence>
  );
};
