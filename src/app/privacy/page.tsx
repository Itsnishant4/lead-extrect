import type { Metadata } from "next";
import PrivacyPageClient from "./client";
import { LandingBanner } from "@/components/LandingBanner";
import { LandingHeader } from "@/components/LandingHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data. GDPR and CCPA compliant lead extraction tool.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | LeadSpotter",
    description:
      "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data.",
    url: "https://leadspotter.in/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <LandingBanner />
      <LandingHeader />
      <PrivacyPageClient />
    </>
  );
}
