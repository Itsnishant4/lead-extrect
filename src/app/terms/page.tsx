"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export default function TermsPage() {
    return (
        <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
            <LandingHeader />

            <main className="flex-grow py-12 lg:py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-800 mb-8">Terms of Service</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                By accessing or using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Permission is granted to temporarily download one copy of the materials (information or software) on LeadSpotter's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                The materials on LeadSpotter's website are provided on an 'as is' basis. LeadSpotter makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                In no event shall LeadSpotter or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LeadSpotter's website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Governing Law</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
