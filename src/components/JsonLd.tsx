import { Organization, WebSite, WithContext, SoftwareApplication, FAQPage, Product } from "schema-dts";

interface JsonLdProps {
    type?: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'FAQPage' | 'Product' | 'BreadcrumbList' | 'HowTo' | 'ItemList' | 'Review';
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
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://leadspotter.in/leads?search={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        } as any,
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
            ratingValue: 4.9,
            ratingCount: 50,
            bestRating: 5,
        },
        featureList: data?.featureList || "Bulk keyword generation, Google Maps data extraction, Email finder, Phone number extractor, Cloud processing, CSV export, Social media discovery, Lead scoring",
    };

    const faqJsonLd: WithContext<FAQPage> = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data?.faqs || [
            {
                "@type": "Question",
                name: "What data can LeadSpotter extract?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Business names, addresses, phone numbers, emails, websites, ratings, reviews, social media profiles, and operating hours from Google Maps and business websites.",
                },
            },
            {
                "@type": "Question",
                name: "Is this legal to use?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. LeadSpotter only collects publicly available data. We are fully GDPR and CCPA compliant.",
                },
            },
            {
                "@type": "Question",
                name: "How does cloud processing work?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Tasks run on our cloud servers 24/7. Close your browser, turn off your computer, and come back later to download results.",
                },
            },
            {
                "@type": "Question",
                name: "How many leads can I extract per month?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Free plan: 500 leads/month. Paid plans: 5,000 to unlimited. All plans include full data enrichment.",
                },
            },
            {
                "@type": "Question",
                name: "Can I export directly to my CRM?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes — CSV with custom columns, compatible with HubSpot, Salesforce, Pipedrive. Direct Telegram delivery available.",
                },
            },
            {
                "@type": "Question",
                name: "Do you offer a free trial?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our Free plan is always free — no credit card required. 500 leads/month and 1 concurrent task to test everything.",
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
            ratingValue: 4.9,
            ratingCount: 50,
            bestRating: 5,
        },
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: (data?.items || []).map((item: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: data?.name || "How to use LeadSpotter",
        description: data?.description || "Step-by-step guide to extracting leads",
        step: (data?.steps || []).map((step: any, i: number) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: step.name,
            text: step.text,
        })),
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
            {(type === 'BreadcrumbList' && data?.items) && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
                />
            )}
            {(type === 'HowTo' && data?.steps) && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
                />
            )}
            {(type === 'ItemList' && data?.itemListElement) && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        name: data.name,
                        description: data.description,
                        itemListElement: data.itemListElement,
                    }) }}
                />
            )}
            {(type === 'Review') && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Review",
                        itemReviewed: data.itemReviewed || {
                            "@type": "SoftwareApplication",
                            name: "LeadSpotter",
                        },
                        reviewRating: data.reviewRating || {
                            "@type": "Rating",
                            ratingValue: "5",
                            bestRating: "5",
                        },
                        author: data.author || {
                            "@type": "Person",
                            name: "User",
                        },
                        reviewBody: data.reviewBody,
                    }) }}
                />
            )}
        </>
    );
}
