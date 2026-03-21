"use client";

import React from "react";
import { LandingFooter } from "@/components/LandingFooter";

export default function TermsPageClient() {
    return (
        <div className="bg-white text-slate-900 antialiased min-h-screen flex flex-col">
            <main className="flex-grow py-12 lg:py-20 pt-28 md:pt-36">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h1 className="text-4xl font-extrabold mb-4">Terms of Service</h1>
                    <p className="text-slate-500 mb-10 text-sm">Last updated: February 25, 2026</p>

                    <div className="prose max-w-none space-y-10 text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Acceptance of Terms</h2>
                            <p>By accessing or using LeadSpotter (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service. These terms apply to all visitors, users, and others who access LeadSpotter.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Description of Service</h2>
                            <p>LeadSpotter is a cloud-based lead extraction and data enrichment platform. The Service allows users to extract publicly available business information from maps and business websites, including business names, addresses, phone numbers, emails, websites, ratings, reviews, and social media profiles.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">3. User Accounts</h2>
                            <p>To use certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account and keep it up to date.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Acceptable Use</h2>
                            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>Use the Service to violate any applicable law, regulation, or third-party rights</li>
                                <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
                                <li>Use extracted data for spamming, harassment, or any unlawful purpose</li>
                                <li>Share your account credentials with unauthorized third parties</li>
                                <li>Resell or redistribute the Service without written permission</li>
                                <li>Overload the Service infrastructure with excessive automated requests beyond your plan limits</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Subscription Plans & Billing</h2>
                            <p>LeadSpotter offers free and paid subscription plans. Paid plans are billed monthly and can be cancelled at any time. Lead extraction credits reset at the beginning of each billing cycle. Unused credits do not carry over to the next month. Refunds are handled on a case-by-case basis.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Data & Compliance</h2>
                            <p>LeadSpotter only extracts publicly available data. Users are responsible for ensuring their use of extracted data complies with applicable laws, including GDPR, CCPA, and CAN-SPAM. LeadSpotter is not responsible for how users utilize the data obtained through our Service.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Intellectual Property</h2>
                            <p>The Service, including its design, code, features, and documentation, is owned by LeadSpotter and protected by intellectual property laws. You retain ownership of any data you extract using the Service, subject to applicable third-party rights.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Limitation of Liability</h2>
                            <p>The Service is provided &quot;as is&quot; without warranties of any kind. LeadSpotter shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of data, revenue, or business opportunities.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">9. Termination</h2>
                            <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. Upon termination, your right to use the Service will cease immediately. You may also delete your account at any time from your dashboard.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">10. Governing Law</h2>
                            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Rajkot, Gujarat, India.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">11. Contact</h2>
                            <p>For questions about these Terms, contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
                        </section>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
