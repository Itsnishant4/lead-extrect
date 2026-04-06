import type { Metadata } from "next";
import PrivacyPageClient from "./client";
import { LandingHeader } from "@/components/LandingHeader";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data. GDPR and CCPA compliant lead extraction tool.",
  alternates: { canonical: "https://leadspotter.in/privacy" },
  openGraph: {
    title: "Privacy Policy | LeadSpotter",
    description:
      "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data.",
    url: "https://leadspotter.in/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | LeadSpotter",
    description: "Read LeadSpotter's privacy policy. Learn how we collect, use, and protect your data.",
    images: ["https://leadspotter.in/opengraph-image"],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Privacy Policy", url: "https://leadspotter.in/privacy" },
          ],
        }}
      />
      <LandingHeader hasBanner={false} />
      <PrivacyPageClient />
    </>
  );
}
