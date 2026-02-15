import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AutomationProvider } from "@/context/AutomationContext";
import QueryProvider from "@/components/QueryProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366F1",
};

export const metadata: Metadata = {
  title: {
    default: "LeadSpotter | Google Maps Scraper & B2B Lead Generation",
    template: "%s | LeadSpotter",
  },
  description: "Extract verified business leads from Google Maps in bulk. Automate your prospecting with our powerful, cloud-based scraping tool.",
  keywords: ["google maps scraper", "lead generation", "b2b leads", "email extractor", "business data", "growth hacking", "sales prospecting"],
  authors: [{ name: "LeadSpotter Team" }],
  creator: "LeadSpotter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leadspotter.in",
    siteName: "LeadSpotter",
    title: "LeadSpotter | Turn Google Maps into your Lead Machine",
    description: "Extract verified business leads from Google Maps in bulk. Automate your prospecting with our powerful, cloud-based scraping tool.",
    images: [
      {
        url: "/opengraph-image",
        width: 1920,
        height: 1080,
        alt: "LeadSpotter — Turn Google Maps into your Lead Machine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadSpotter | Google Maps Scraper",
    description: "Extract verified business leads from Google Maps in bulk. Start for free today.",
    images: ["/opengraph-image"],
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
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </head>
      <body className="antialiased min-h-screen">
        <GoogleAnalytics />
        
          <QueryProvider>
            <AutomationProvider>
              <SidebarProvider>
                <main className="flex-1 w-full min-h-screen h-screen">
                  {children}
                </main>
                <Toaster />
              </SidebarProvider>
            </AutomationProvider>
          </QueryProvider>

      </body>
    </html>
  );
}
