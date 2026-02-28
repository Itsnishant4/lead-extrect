import { Organization, WebSite, WithContext, SoftwareApplication, FAQPage, Product } from "schema-dts";

interface JsonLdProps {
    type?: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'FAQPage' | 'Product';
    data?: any;
}

export default function JsonLd({ type, data }: JsonLdProps) {
    const organizationJsonLd: WithContext<Organization> = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "LeadSpotter",
        url: "https://leadspotter.in",
        logo: "https://leadspotter.in/logo.png",
        description: "LeadSpotter is a cloud-based B2B lead extraction tool that helps sales teams extract verified business leads from Google Maps with bulk keyword generation, email enrichment, and CSV export.",
        sameAs: [
            "https://www.facebook.com/share/1Hr3qboz8F/",
            "https://x.com/leadspotter_in",
            "https://www.instagram.com/leadspotter.in/",
            "https://linkedin.com/in/nishantpatel44",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            email: "contact@leadspotter.in",
            contactType: "customer support",
        },
        founder: {
            "@type": "Person",
            name: "Nishant Patel",
        },
        foundingDate: "2024",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Rajkot",
            addressRegion: "Gujarat",
            addressCountry: "IN",
        },
    };

    const websiteJsonLd: WithContext<WebSite> = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "LeadSpotter",
        url: "https://leadspotter.in",
        description: "Extract verified business leads from Google Maps. Bulk keyword generation, cloud processing, email enrichment, and CRM-ready CSV export.",
    };

    const softwareJsonLd: WithContext<SoftwareApplication> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: data?.name || "LeadSpotter",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Cloud",
        description: data?.description || "Cloud-based lead extraction tool for B2B sales teams. Extract business data from Google Maps with bulk keyword generation, email finder, phone extractor, and CSV export.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            description: "Free plan with free leads ",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "50",
            bestRating: "5",
        },
        featureList: data?.featureList || "Bulk keyword generation, Google Maps data extraction, Email finder, Phone number extractor, Cloud processing, CSV export, Social media discovery, Lead scoring",
    };

    const faqJsonLd: WithContext<FAQPage> = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data?.faqs || [
            {
                "@type": "Question",
                name: "What data can LeadSpotter extract from Google Maps?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "LeadSpotter extracts business names, addresses, phone numbers, emails, websites, ratings, reviews, social media profiles, and operating hours from Google Maps business listings. We also enrich data by scraping business websites for additional contact information including direct emails and phone numbers.",
                },
            },
            {
                "@type": "Question",
                name: "Is it legal to scrape data from Google Maps?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. LeadSpotter only collects publicly available data from Google Maps and business websites. This is information that businesses have voluntarily published online. We are fully GDPR and CCPA compliant. All extracted data is public business information, not private or protected data.",
                },
            },
            {
                "@type": "Question",
                name: "How does cloud processing work in LeadSpotter?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "When you start an extraction task, it runs on our cloud servers 24/7. You can close your browser and come back later — your task continues processing in the background. You'll see real-time progress updates and can download your leads when the extraction is complete.",
                },
            },
            {
                "@type": "Question",
                name: "Can I cancel or upgrade my LeadSpotter plan anytime?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel at any time from your dashboard. The free plan gives you some free leads per month with no credit card required.",
                },
            },
            {
                "@type": "Question",
                name: "What is the difference between the Starter and Pro plan?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The Starter plan gives you some free leads to test the platform. Paid plans unlock high-volume lead extraction, bulk keyword generation, social media enrichment, CSV/JSON data exports, and priority support.",
                },
            },
            {
                "@type": "Question",
                name: "How many leads can I extract with LeadSpotter?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Lead generation limits depend on your selected plan. The free Starter plan includes a limited number of leads, while higher tiers offer large monthly allocations or unlimited leads for enterprise teams.",
                },
            },
        ],
    };

    const productJsonLd: WithContext<Product> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data?.name || "LeadSpotter",
        description: data?.description || "Extract verified business leads from Google Maps.",
        brand: {
            "@type": "Brand",
            name: "LeadSpotter",
        },
        offers: {
            "@type": "Offer",
            url: "https://leadspotter.in/pricing",
            priceCurrency: "INR",
            price: "0",
            availability: "https://schema.org/InStock",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "50",
        },
    };

    return (
        <>
            {(!type || type === 'Organization') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
            )}
            {(!type || type === 'WebSite') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
            )}
            {(type === 'SoftwareApplication') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
                />
            )}
            {(type === 'FAQPage') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}
            {(type === 'Product') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
                />
            )}
            {/* If no type is provided, we include all standard ones for the home page */}
            {!type && (
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
                    />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                    />
                </>
            )}
        </>
    );
}
