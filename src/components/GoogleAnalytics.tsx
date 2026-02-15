"use client";

import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
    // Use provided ID or fallback to environment variable or placeholder
    const GOOGLE_ANALYTICS_ID = gaId || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-XXXXXXXXXX";

    if (!GOOGLE_ANALYTICS_ID) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GOOGLE_ANALYTICS_ID}');
        `}
            </Script>
        </>
    );
}
