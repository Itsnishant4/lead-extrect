import type { Metadata } from "next";
import CompanyPageClient from "./client";
import { LandingBanner } from "@/components/LandingBanner";
import { LandingHeader } from "@/components/LandingHeader";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "About LeadSpotter - Our Story & Mission",
  description:
    "Learn about LeadSpotter, the lead extraction tool trusted by 5,000+ sales teams worldwide. Built in India, serving 150+ countries with cloud-powered B2B lead generation.",
  alternates: { canonical: "https://leadspotter.in/company" },
  openGraph: {
    title: "About LeadSpotter - Our Story & Mission",
    description:
      "Learn about LeadSpotter, the lead extraction tool trusted by 5,000+ sales teams worldwide.",
    url: "https://leadspotter.in/company",
  },
  twitter: {
    card: "summary_large_image",
    title: "About LeadSpotter - Our Story & Mission",
    description: "Learn about LeadSpotter, trusted by 5,000+ sales teams worldwide.",
    images: ["https://leadspotter.in/opengraph-image"],
  },
};

export default function CompanyPage() {
  return (
    <>
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Company", url: "https://leadspotter.in/company" },
          ],
        }}
      />
      <LandingBanner />
      <LandingHeader />
      <CompanyPageClient />
    </>
  );
}
