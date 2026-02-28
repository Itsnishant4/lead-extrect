import type { Metadata } from "next";
import FeaturesPageClient from "./client";
import { LandingBanner } from "@/components/LandingBanner";
import { LandingHeader } from "@/components/LandingHeader";

export const metadata: Metadata = {
  title: "Features - Google Maps Lead Extractor & Business Data Scraper",
  description:
    "Explore LeadSpotter's powerful features: bulk keyword generation, Google Maps data extraction, email & phone number finder, cloud processing, CSV export, and deep website enrichment for B2B leads.",
  alternates: { canonical: "/features" },
  keywords: [
    "google maps lead extractor features",
    "bulk lead extraction tool",
    "business email finder",
    "phone number extractor",
    "cloud lead generation",
    "CSV lead export",
    "b2b data enrichment",
    "google maps scraper features",
  ],
  openGraph: {
    title: "Features - Google Maps Lead Extractor & Business Data Scraper",
    description:
      "Bulk keyword generation, cloud extraction, email & phone finder, CSV export, and more. See all LeadSpotter features.",
    url: "https://leadspotter.in/features",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <LandingBanner />
      <LandingHeader />
      <FeaturesPageClient />
    </>
  );
}
