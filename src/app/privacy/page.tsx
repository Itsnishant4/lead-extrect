"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export default function PrivacyPage() {
    return (
        <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
            <LandingHeader />

            <main className="flex-grow py-12 lg:py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-800 mb-8">Privacy Policy</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Information Collection</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We collect information you provide directly to us when you create an account, subscribe to our service, or communicate with us. This may include your name, email address, payment information, and any other information you choose to provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. Use of Information</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We use the information we collect to provide, maintain, and improve our services, verify your identity, process transactions, sending you technical notices and support messages, and respond to your comments and questions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf, subject to confidentiality agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@leadspotter.io" className="text-primary hover:underline">support@leadspotter.io</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
