import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data. GDPR and CCPA compliant lead extraction tool.",
  alternates: { canonical: "https://leadspotter.in/privacy" },
  openGraph: {
    title: "Privacy Policy | LeadSpotter",
    description:
      "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data.",
    url: "https://leadspotter.in/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | LeadSpotter",
    description: "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data.",
    images: ["https://leadspotter.in/opengraph-image"],
  },
};

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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

function SimpleHeader() {
  const navItems = [
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "Blog", link: "/blog" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-[5000]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-indigo-100/60 shadow-[0_8px_32px_rgba(99,102,241,0.08),0_1px_2px_rgba(99,102,241,0.04)] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logo className="w-7 h-7 text-indigo-600 group-hover:scale-105 transition-transform" />
          <span className="text-base font-bold tracking-tight text-indigo-950">LeadSpotter</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.link} className="relative px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>
        <Link href="/signup">
          <button className="text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-indigo-200/50 active:scale-95 transition-colors"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)" }}
          >
            Start Free
          </button>
        </Link>
      </div>
    </header>
  );
}

function SimpleFooter() {
  const socialLinks = [
    { Icon: TwitterIcon, href: "https://x.com/leadspotter_in", label: "Twitter" },
    { Icon: InstagramIcon, href: "https://instagram.com/leadspotter.in", label: "Instagram" },
    { Icon: FacebookIcon, href: "https://www.facebook.com/people/LeadsPotterin/61588329951050/", label: "Facebook" },
    { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/nishantpatel44", label: "LinkedIn" },
  ];

  return (
    <footer className="relative pb-16 md:pb-32">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 lg:p-16 w-full max-w-7xl mx-auto backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
            <div className="max-w-sm shrink-0">
              <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
                <Logo className="w-8 h-8 text-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="text-xl font-bold tracking-tight text-gray-900">LeadSpotter</span>
              </Link>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                LeadSpotter empowers sales teams to transform raw public data into clear, verified B2B leads.
              </p>
              <div className="flex items-center gap-5">
                {socialLinks.map(({ Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-gray-400 hover:text-gray-900 transition-colors duration-200"
                  >
                    <Icon />
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 w-full lg:w-auto lg:min-w-[500px] xl:min-w-[600px] justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm">Product</h3>
                <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><Link className="hover:text-gray-900 transition-colors" href="/features">Features</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/pricing">Pricing</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/use-cases">Use Cases</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/integrations">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm">Resources</h3>
                <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><Link className="hover:text-gray-900 transition-colors" href="/blog">Blog & Tutorials</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/leads/dentists">Dentists Leads</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/leads/real-estate-agents">Real Estate Leads</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/sitemap.xml">Sitemap</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm">Company</h3>
                <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><Link className="hover:text-gray-900 transition-colors" href="/company">About Us</Link></li>
                  <li><a className="hover:text-gray-900 transition-colors" href="mailto:contact@leadspotter.in">Support & Contact</a></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-apollo">vs Apollo.io</Link></li>
                  <li><Link className="hover:text-gray-900 transition-colors" href="/compare/leadspotter-vs-zoominfo">vs ZoomInfo</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} LeadSpotter. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-gray-500 font-medium">
              <Link className="hover:text-gray-900 hover:underline transition-colors" href="/privacy">Privacy Policy</Link>
              <Link className="hover:text-gray-900 hover:underline transition-colors" href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-white text-slate-900 antialiased min-h-screen flex flex-col">
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Privacy Policy", url: "https://leadspotter.in/privacy" },
          ],
        }}
      />
      <SimpleHeader />
      <main className="flex-grow py-12 lg:py-20 pt-28 md:pt-36">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-slate-500 mb-10 text-sm">Last updated: April 6, 2026</p>

          <div className="prose max-w-none space-y-10 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Introduction</h2>
              <p>This Privacy Policy describes how LeadSpotter (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, stores, and shares your personal information when you use our platform at <a href="https://leadspotter.in" className="text-indigo-600 hover:underline">https://leadspotter.in</a>. We only collect the minimum data necessary to provide our services.</p>
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
              <p className="mt-3">We only collect this data when you explicitly authorize it through Google&apos;s OAuth consent screen. You can revoke this access at any time through your Google Account settings.</p>
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
                <li>Any purpose other than providing or improving LeadSpotter&apos;s functionality</li>
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
              <p>LeadSpotter&apos;s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
              <p className="mt-3">We comply with all applicable Google API Services User Data Policy requirements, including:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>We only use Google user data to provide or improve user-facing features of LeadSpotter</li>
                <li>We do not use Google user data for advertising purposes</li>
                <li>We do not sell Google user data to third parties</li>
                <li>We allow users to revoke access to their Google data at any time</li>
                <li>We do not use Google user data for purposes other than providing or improving our application&apos;s functionality</li>
                <li>We do not transfer Google user data to third parties for reasons other than providing or improving our application&apos;s functionality</li>
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
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">12. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our use of Google user data, please contact us at <a href="mailto:contact@leadspotter.in" className="text-indigo-600 hover:underline">contact@leadspotter.in</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
}
