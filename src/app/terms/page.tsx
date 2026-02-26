import type { Metadata } from "next";
import TermsPageClient from "./client";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read LeadSpotter's terms of service. Understand the rules and guidelines for using our B2B lead extraction and business data scraping platform.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | LeadSpotter",
    description:
      "Read LeadSpotter's terms of service for our lead extraction platform.",
    url: "https://leadspotter.in/terms",
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
