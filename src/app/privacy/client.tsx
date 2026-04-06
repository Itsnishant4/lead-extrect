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
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Introduction</h2>
                            <p>This Privacy Policy describes how LeadSpotter ("we," "our," or "us") collects, uses, stores, and shares your personal information when you use our platform at <a href="https://leadspotter.in" className="text-indigo-600 hover:underline">https://leadspotter.in</a>. We only collect the minimum data necessary to provide our services.</p>
                            <p className="mt-3">This policy applies to all users of LeadSpotter, including those who authenticate using Google Sign-In or connect their Google accounts to our platform.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Information We Collect</h2>
                            <p>The data we collected about you is what you have provided to us, including your name, email address, and password (stored as a secure hash). When you use our lead extraction service, we process the search queries and keywords you provide.</p>
                            <p className="mt-3">We also automatically collect usage data such as your IP address, browser type, pages visited, and time spent on our platform. This data helps us improve the user experience and diagnose technical issues.</p>
                            <p className="mt-3"><strong>We do not sell your personal information to third parties.</strong></p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">3. Google User Data We Collect</h2>
                            <p>When you choose to connect your Google account to LeadSpotter (for example, to sign in with Google or sync leads to Google Sheets), we may collect the following Google user data:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li><strong>Google Profile Information:</strong> Your name and email address from your Google Account</li>
                                <li><strong>Google Sheets Data:</strong> Access to create and modify spreadsheets in your Google Drive, only when you explicitly authorize this access</li>
                                <li><strong>Google OAuth Tokens:</strong> Access and refresh tokens necessary to maintain your connection to Google services</li>
                            </ul>
                            <p className="mt-3">We only collect this data when you explicitly authorize it through Google's OAuth consent screen. You can revoke this access at any time through your Google Account settings.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">4. How We Use Google User Data</h2>
                            <p>We will use your data to provide you with the services you requested. Specifically, Google user data is used to:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>Authenticate your identity when you sign in with Google</li>
                                <li>Export your extracted leads to Google Sheets when you authorize this feature</li>
                                <li>Maintain your connection to Google services for ongoing sync functionality</li>
                            </ul>
                            <p className="mt-3"><strong>We do not use Google user data for:</strong></p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>Targeted advertising or personalized advertisements</li>
                                <li>Selling to data brokers or information resellers</li>
                                <li>Determining credit-worthiness or lending purposes</li>
                                <li>Training AI models</li>
                                <li>Creating databases for resale</li>
                                <li>Any purpose other than providing or improving LeadSpotter's functionality</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">5. How We Share, Transfer, or Disclose Google User Data</h2>
                            <p><strong>We do not transfer or disclose your Google user data to third parties for purposes other than the ones provided.</strong> Google user data is used solely to enable the specific features you have authorized within LeadSpotter.</p>
                            <p className="mt-3">We may share non-personal, aggregated, or anonymized data with our service providers for analytics and service improvement purposes. This data does not identify you personally and cannot be used to reconstruct your Google user data.</p>
                            <p className="mt-3"><strong>We do not share, transfer, or disclose Google user data for:</strong></p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>Targeted advertising</li>
                                <li>Selling to data brokers</li>
                                <li>Providing to information resellers</li>
                                <li>Determining credit-worthiness</li>
                                <li>Lending purposes</li>
                                <li>User advertisements, personalized advertisements, retargeted advertisements, or interest-based advertisements</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Data Security</h2>
                            <p>Security procedures are in place to protect the confidentiality of your data. We implement industry-standard security measures including:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li><strong>Encryption:</strong> We use encryption to protect your information during transmission (HTTPS/TLS) and at rest</li>
                                <li><strong>Password Security:</strong> Passwords are hashed using bcrypt, a secure cryptographic hashing algorithm</li>
                                <li><strong>Session Management:</strong> Sessions are managed with JWT tokens with appropriate expiration</li>
                                <li><strong>Secure Infrastructure:</strong> Our database is hosted on secure, SOC 2 compliant infrastructure</li>
                            </ul>
                            <p className="mt-3">However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Data Retention and Deletion</h2>
                            <p>We store your personal information for a period of time that is consistent with our business purposes. Specifically:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>We retain your account information for as long as your account is active</li>
                                <li>Extracted lead data is stored on our servers and can be deleted at your request</li>
                                <li>When the data retention period expires for a given type of data, we will delete or destroy it</li>
                                <li>If you delete your account, we will remove your personal information within 30 days, except where we are required to retain it for legal obligations</li>
                            </ul>
                            <p className="mt-3"><strong>You may request for your data to be deleted by</strong> contacting us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a> or by deleting your account through the LeadSpotter dashboard.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Google API Services User Data Policy Compliance</h2>
                            <p>LeadSpotter's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                            <p className="mt-3">We comply with all applicable Google API Services User Data Policy requirements, including:</p>
                            <ul className="list-disc pl-6 mt-3 space-y-2">
                                <li>We only use Google user data to provide or improve user-facing features of LeadSpotter</li>
                                <li>We do not use Google user data for advertising purposes</li>
                                <li>We do not sell Google user data to third parties</li>
                                <li>We allow users to revoke access to their Google data at any time</li>
                                <li>We do not use Google user data for purposes other than providing or improving our application's functionality</li>
                                <li>We do not transfer Google user data to third parties for reasons other than providing or improving our application's functionality</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">9. Third-Party Services</h2>
                            <p>We use third-party services such as Google Analytics to understand usage patterns. These services may collect anonymized usage data such as IP address, device information, and interaction behavior.</p>
                            <p className="mt-3">We also use third-party services for hosting (Vercel), database (Turso/LibSQL), and email delivery (SMTP). These providers process data only for their specific service purposes and do not receive access to your extracted lead data or Google user data.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">10. Your Rights</h2>
                            <p>Depending on your location, you may have the right to access, correct, delete, or export your personal data. You can manage most of your data directly from your LeadSpotter dashboard. For any data-related requests, contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">11. Changes to This Privacy Policy</h2>
                            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">12. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy or our use of Google user data, please contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
                        </section>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
