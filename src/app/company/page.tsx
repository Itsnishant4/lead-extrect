"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CompanyPage() {
    return (
        <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
            <LandingHeader />

            <main className="flex-grow">
                <section className="py-20 lg:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(#1392ec 1px, transparent 1px)",
                                backgroundSize: "40px 40px",
                            }}
                        ></div>
                    </div>
                    <div className="container mx-auto px-6 text-center">
                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="text-4xl lg:text-6xl font-800 mb-6"
                        >
                            We Help Businesses <span className="text-primary">Grow</span>
                        </motion.h1>
                        <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12"
                        >
                            LeadSpotter was built to democratize access to public business data.
                            Our mission is to empower sales teams of all sizes with the data they need to succeed.
                            We believe that every business, regardless of size, deserves access to high-quality market intelligence.
                            By leveraging advanced scraping technology and cloud infrastructure, we turn the chaos of public maps data into structured, actionable opportunities.
                        </motion.p>

                    </div>
                </section>

                <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                                <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <p>
                                        Started in 2024, LeadSpotter realized that manual prospecting was the biggest bottleneck for agency owners and freelance marketers.
                                    </p>
                                    <p>
                                        Existing tools were either too expensive for small teams or too complex to set up. We set out to build something different: a tool that is powerful enough for power users but simple enough for anyone to start getting leads in minutes.
                                    </p>
                                    <p>
                                        Today, we process millions of data points daily for thousands of users around the globe.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Mail className="text-primary w-5 h-5" /> Contact Us
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl">
                                            <MapPin className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-1">Headquarters</h4>
                                            <p className="font-medium">Rajkot, Gujrat</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl">
                                            <Mail className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-1">Email</h4>
                                            <a href="mailto:patelnishant2006@gmail.com" className="font-medium hover:text-primary transition-colors">patelnishant2006@gmail.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl">
                                            <Globe className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-1">Socials</h4>
                                            <div className="flex gap-4">
                                                <a href="https://github.com/itsnishant4" className="font-medium hover:text-primary transition-colors">Github</a>
                                                <a href="https://www.linkedin.com/in/nishantpatel44" className="font-medium hover:text-primary transition-colors">LinkedIn</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div >
    );
}
