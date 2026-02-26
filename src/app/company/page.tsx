import type { Metadata } from "next";
import CompanyPageClient from "./client";

export const metadata: Metadata = {
  title: "About LeadSpotter - Our Story & Mission",
  description:
    "Learn about LeadSpotter, the lead extraction tool trusted by 5,000+ sales teams worldwide. Built in India, serving 150+ countries with cloud-powered B2B lead generation.",
  alternates: { canonical: "/company" },
  openGraph: {
    title: "About LeadSpotter - Our Story & Mission",
    description:
      "Learn about LeadSpotter, the lead extraction tool trusted by 5,000+ sales teams worldwide.",
    url: "https://leadspotter.in/company",
  },
};

export default function CompanyPage() {
  return <CompanyPageClient />;
}
