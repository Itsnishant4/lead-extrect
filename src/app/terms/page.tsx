import type { Metadata } from "next";
import TermsPageClient from "./client";
import { LandingHeader } from "@/components/LandingHeader";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read LeadSpotter's terms of service. Understand the rules and guidelines for using our B2B lead extraction and business data scraping platform.",
  alternates: { canonical: "https://leadspotter.in/terms" },
  openGraph: {
    title: "Terms of Service | LeadSpotter",
    description:
      "Read LeadSpotter's terms of service for our lead extraction platform.",
    url: "https://leadspotter.in/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | LeadSpotter",
    description: "Read LeadSpotter's terms of service for our lead extraction platform.",
    images: ["https://leadspotter.in/opengraph-image"],
  },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Terms of Service", url: "https://leadspotter.in/terms" },
          ],
        }}
      />
      <LandingHeader />
      <TermsPageClient />
    </>
  );
}
