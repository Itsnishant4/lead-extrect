import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AutomationProvider } from "@/context/AutomationContext";
import QueryProvider from "@/components/QueryProvider";

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
        width: 1200,
        height: 630,
        alt: "LeadSpotter - Google Maps Lead Extraction Tool",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>

      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AutomationProvider>
              <SidebarProvider>
                <div className="flex-1 w-full min-h-screen">
                  {children}
                </div>
                <Toaster />
              </SidebarProvider>
            </AutomationProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
