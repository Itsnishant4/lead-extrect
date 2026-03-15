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
          
          // Track conversion events
          window.trackEvent = function(eventName, params) {
            gtag('event', eventName, params);
          };
          
          // Track signup starts
          window.trackSignupStart = function(method) {
            gtag('event', 'sign_up', { method: method });
          };
          
          // Track first lead extracted
          window.trackFirstLead = function(leadSource) {
            gtag('event', 'first_lead_extracted', { source: leadSource });
          };
          
          // Track upgrade clicks
          window.trackUpgradeClick = function(planType) {
            gtag('event', 'begin_checkout', { plan_type: planType });
          };
        `}
            </Script>
        </>
    );
}
