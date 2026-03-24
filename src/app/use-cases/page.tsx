import type { Metadata } from "next";
import UseCasesPageClient from "./client";
import { LandingBanner } from "@/components/LandingBanner";
import { LandingHeader } from "@/components/LandingHeader";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Use Cases - Lead Generation for Agencies, Freelancers & Sales Teams",
  description:
    "Discover how marketing agencies, freelancers, real estate agents, recruiters, and sales teams use LeadSpotter to extract verified B2B leads from Google Maps and grow their business.",
  alternates: { canonical: "https://leadspotter.in/use-cases" },
  keywords: [
    "lead generation for agencies",
    "freelancer lead generation",
    "real estate lead generation tool",
    "sales team prospecting",
    "local business lead generation",
    "b2b lead generation use cases",
    "google maps leads for agencies",
  ],
  openGraph: {
    title: "Use Cases - Lead Generation for Every Industry",
    description: "See how agencies, freelancers, and sales teams use LeadSpotter to find verified leads.",
    url: "https://leadspotter.in/use-cases",
  },
  twitter: {
    card: "summary_large_image",
    title: "Use Cases - Lead Generation for Every Industry",
    description: "See how agencies, freelancers, and sales teams use LeadSpotter to find verified leads.",
    images: ["https://leadspotter.in/opengraph-image"],
  },
};

export default function UseCasesPage() {
  return (
    <>
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Use Cases", url: "https://leadspotter.in/use-cases" },
          ],
        }}
      />
      <LandingBanner />
      <LandingHeader />
      <UseCasesPageClient />
    </>
  );
}
