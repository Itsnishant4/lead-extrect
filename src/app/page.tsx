import React from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingBanner } from "@/components/LandingBanner";
import { LandingFooter } from "@/components/LandingFooter";
import { HomeClient } from "@/components/HomeClient";
import JsonLd from "@/components/JsonLd";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadSpotter | #1 Google Maps Lead Extractor & B2B Sales Engine",
  description: "Scale your sales with LeadSpotter. Extract thousands of verified B2B leads from Google Maps with emails, phone numbers, and social profiles in minutes. Start for free.",
  keywords: ["google maps scraper", "lead extraction tool", "b2b lead generation", "email extractor", "sales prospecting"],
  alternates: { canonical: "https://leadspotter.in" },
  openGraph: {
    title: "LeadSpotter | Turn Maps into your Lead Machine",
    description: "The most powerful B2B lead extraction tool for Google Maps. Bulk keyword generation and deep data enrichment.",
    url: "https://leadspotter.in",
  }
};


export default function Home() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      <JsonLd />
      <LandingBanner />
      <LandingHeader />
      <HomeClient />
      <LandingFooter />
    </div>
  );
}
