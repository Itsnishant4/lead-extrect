"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { motion } from "motion/react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function BlogPageClient({ initialPosts }: { initialPosts: any[] }) {
  const posts = initialPosts;

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 md:pt-40 pb-16 md:pb-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Blog</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Lead Generation<br /><span className="text-indigo-600">Tips & Guides</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-gray-500 text-lg">
            Actionable guides on B2B lead generation, Google Maps data extraction, cold outreach, and sales prospecting best practices.
          </motion.p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <motion.article key={post.slug} variants={fadeUp} custom={i}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">{post.category}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />{post.read_time}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{post.description || post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User size={14} />
                        <span>{post.author}</span>
                        <span className="text-gray-300">|</span>
                        <span>{format(new Date(post.published_at || post.created_at), 'MMMM dd, yyyy')}</span>
                      </div>
                      <span className="text-indigo-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read<ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
