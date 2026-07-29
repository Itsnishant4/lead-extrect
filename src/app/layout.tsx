import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AutomationProvider } from "@/context/AutomationContext";
import QueryProvider from "@/components/QueryProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";
import { NotificationProvider } from "@/components/NotificationProvider";
import { WhiteLabelBanner } from "@/components/WhiteLabelBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366F1",
};

export const metadata: Metadata = {
  title: {
    default: "LeadSpotter | #1 Google Maps Lead Extractor & B2B Sales Engine",
    template: "%s | LeadSpotter",
  },
  description: "Extract verified business leads in bulk. Automate your prospecting with our powerful, cloud-based extraction tool.",
  keywords: [
    "lead generation tool",
    "b2b lead generation",
    "google maps scraper",
    "google maps lead extractor",
    "business email extractor",
    "bulk lead extraction",
    "sales prospecting tool",
    "local business scraper",
    "business data extraction",
    "email finder tool",
    "phone number extractor",
    "lead generation software",
    "cold outreach tool",
    "google maps data scraper",
    "extract business leads",
    "b2b prospecting",
    "lead scraper",
    "maps lead generation",
    "business contact finder",
    "growth hacking tools",
  ],
  authors: [{ name: "LeadSpotter Team" }],
  creator: "LeadSpotter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leadspotter.in",
    siteName: "LeadSpotter",
    title: "LeadSpotter | #1 Google Maps Lead Extractor & B2B Sales Engine",
    description: "Extract verified business leads in bulk. Automate your prospecting with our powerful, cloud-based extraction tool.",
    images: [
      {
        url: "https://leadspotter.in/opengraph-image",
        width: 1920,
        height: 1080,
        alt: "LeadSpotter — Turn Maps into your Lead Machine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadSpotter | Lead Extraction Tool",
    description: "Extract verified business leads in bulk. Start for free today.",
    images: ["https://leadspotter.in/opengraph-image"],
    creator: "@LeadSpotter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://leadspotter.in"),
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  verification: {
    google: "googleb9ce8135773393a8",
  },
  category: "Business",
  classification: "SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen font-sans">
        <noscript>
          <style>{`
            .noscript-fallback {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
            }
            .noscript-fallback h1 {
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 1rem;
              color: #1e1b4b;
            }
            .noscript-fallback p {
              color: #64748b;
              max-width: 500px;
              line-height: 1.6;
            }
            .noscript-fallback a {
              color: #6366f1;
              text-decoration: underline;
            }
          `}</style>
          <div className="noscript-fallback">
            <h1>JavaScript Required</h1>
            <p>LeadSpotter requires JavaScript to function. Please enable JavaScript in your browser settings and reload the page.</p>
            <p style={{ marginTop: '1rem' }}>If you are trying to access our <a href="/privacy">Privacy Policy</a> or <a href="/terms">Terms of Service</a>, these pages should work without JavaScript.</p>
          </div>
        </noscript>
        <GoogleAnalytics />

        <QueryProvider>
          <AutomationProvider>
            <NotificationProvider>
              <SidebarProvider>
                <main className="flex-1 w-full min-h-screen h-screen">
                  {children}
                </main>
                <WhiteLabelBanner />
                <Toaster position="top-right" />
              </SidebarProvider>
            </NotificationProvider>
          </AutomationProvider>
        </QueryProvider>

      </body>
    </html>
  );
}
