import type { Metadata } from "next";
import UseCasesPageClient from "./client";

export const metadata: Metadata = {
  title: "Use Cases - Lead Generation for Agencies, Freelancers & Sales Teams",
  description:
    "Discover how marketing agencies, freelancers, real estate agents, recruiters, and sales teams use LeadSpotter to extract verified B2B leads from Google Maps and grow their business.",
  alternates: { canonical: "/use-cases" },
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
};

export default function UseCasesPage() {
  return <UseCasesPageClient />;
}
