"use client";

import React from "react";
import { LandingFooter } from "@/components/LandingFooter";

export default function PrivacyPageClient() {
    return (
        <div className="bg-white text-slate-900 antialiased min-h-screen flex flex-col">
            <main className="flex-grow py-12 lg:py-20 pt-28 md:pt-36">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
                    <p className="text-slate-500 mb-10 text-sm">Last updated: April 6, 2026</p>

                    <div className="prose max-w-none space-y-10 text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Information We Collect</h2>
                            <p>We only collect the minimum data necessary to provide our services. When you create an account on LeadSpotter, we collect your name, email address, and password (stored as a secure hash). When you use our lead extraction service, we process the search queries and keywords you provide. We do not sell your personal information to third parties.</p>
                            <p className="mt-3">We also automatically collect usage data such as your IP address, browser type, pages visited, and time spent on our platform. This data helps us improve the user experience and diagnose technical issues.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">2. How We Use Your Information</h2>
                            <p>We use collected data strictly to operate, maintain, and improve our services. Data is processed only for specific purposes such as executing user-requested lead extraction, improving system performance, and ensuring platform security. We do not use personal data for unrelated purposes.</p>
                            <p className="mt-3">Specifically, we use the information we collect to:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>Provide, maintain, and improve our lead extraction and data enrichment services</li>
                                <li>Process your extraction tasks and deliver results</li>
                                <li>Send you technical notices, security alerts, and support messages</li>
                                <li>Respond to your comments, questions, and customer service requests</li>
                                <li>Monitor and analyze trends, usage, and activities to improve LeadSpotter</li>
                                <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">3. Data Extracted by Our Service</h2>
                            <p>LeadSpotter extracts publicly available business information from maps and business websites. This includes business names, addresses, phone numbers, emails, websites, ratings, reviews, operating hours, and social media profiles. All extracted data is information that businesses have voluntarily published online.</p>
                            <p className="mt-3">We are committed to GDPR and CCPA compliance. We only collect data that is publicly accessible and do not scrape private or protected information.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Google API Services Usage</h2>
                            <p>LeadSpotter uses Google APIs, including Google OAuth and Google Maps, to enhance functionality. If you choose to connect your Google account (for example, to sync leads to Google Sheets), we may access limited user data such as your Google profile information, email address, and Google Sheets data strictly necessary to provide our services.</p>
                            <p className="mt-3">We do not use Google user data for advertising purposes, and we do not sell or share this data with third parties. Google user data is used solely to enable the specific features you have authorized, such as exporting leads to your Google Sheets.</p>
                            <p className="mt-3"><strong>Limited Use Compliance:</strong> LeadSpotter's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Data Security</h2>
                            <p>We implement industry-standard security measures to protect your personal information. Passwords are hashed using bcrypt, sessions are managed with JWT tokens, and all data is transmitted over HTTPS. Our database is hosted on secure infrastructure.</p>
                            <p className="mt-3">However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Data Retention</h2>
                            <p>We retain your account information for as long as your account is active. Extracted lead data is stored on our servers and can be deleted at your request. If you delete your account, we will remove your personal information within 30 days, except where we are required to retain it for legal obligations.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Third-Party Services</h2>
                            <p>We use third-party services such as Google Analytics to understand usage patterns. These services may collect anonymized usage data such as IP address, device information, and interaction behavior.</p>
                            <p className="mt-3">We also use third-party services for hosting (Vercel), database (Turso/LibSQL), and email delivery (SMTP). These providers process data only for their specific service purposes and do not receive access to your extracted lead data.</p>
                            <p className="mt-3">These providers process data only for analytics and service improvement purposes and do not receive access to your extracted lead data.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Your Rights</h2>
                            <p>Depending on your location, you may have the right to access, correct, delete, or export your personal data. You can manage most of your data directly from your LeadSpotter dashboard. For any data-related requests, contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">9. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy or our use of Google user data, please contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
                        </section>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
