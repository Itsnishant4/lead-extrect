import { Organization, WebSite, WithContext, SoftwareApplication } from "schema-dts";

export default function JsonLd() {
    const organizationJsonLd: WithContext<Organization> = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "LeadSpotter",
        url: "https://leadspotter.in",
        logo: "https://leadspotter.in/logo.png", // Assuming logo path
        sameAs: [
            "https://facebook.com/leadspotter",
            "https://twitter.com/leadspotter",
            "https://instagram.com/leadspotter",
            "https://linkedin.com/company/leadspotter", // User has personal linkedin, updating to company if/when avail
            "https://linkedin.com/in/nishantpatel44",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            email: "contact@leadspotter.in", // Placeholder
            contactType: "customer support",
        },
    };

    const websiteJsonLd: WithContext<WebSite> = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "LeadSpotter",
        url: "https://leadspotter.in",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://leadspotter.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    };

    const softwareJsonLd: WithContext<SoftwareApplication> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "LeadSpotter",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Cloud",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "50", // Placeholder based on G2 landing page claim
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />
        </>
    );
}
