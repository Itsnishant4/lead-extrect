// ─── Types ───────────────────────────────────────────────────────────────────

export interface CompetitorData {
  name: string;
  slug: string;
  tagline: string;
  heroDescription: string;
  verdict: string;
  verdictDetail: string;
  quickVerdicts: {
    category: string;
    winner: 'us' | 'them' | 'tie';
    reason: string;
  }[];
  features: {
    category: string;
    items: {
      label: string;
      us: boolean | string;
      them: boolean | string;
    }[];
  }[];
  theirPricing: { plan: string; price: string; note: string }[];
  useCases: {
    scenario: string;
    best: 'leadspotter' | 'them';
    reason: string;
  }[];
  switchReasons: string[];
  faqs: { question: string; answer: string }[];
}

// ─── LeadSpotter Pricing (constant across all pages) ─────────────────────────

export const OUR_PRICING = [
  { plan: 'Starter', price: 'Free', note: 'No credit card required' },
  { plan: 'Pro', price: '₹2,000/mo', note: '5,000 leads, full enrichment' },
  { plan: 'One-Time', price: '₹5,000', note: 'Pay once, no subscription' },
];

// ─── LeadSpotter Features (reused in every comparison) ───────────────────────

function buildFeatures(overrides: Record<string, boolean | string>): CompetitorData['features'] {
  return [
    {
      category: 'Data Collection',
      items: [
        { label: 'Google Maps Extraction', us: true, them: overrides['mapsExtraction'] ?? false },
        { label: 'Website Deep Crawling', us: true, them: overrides['websiteCrawling'] ?? false },
        { label: 'LinkedIn Prospecting', us: false, them: overrides['linkedin'] ?? false },
        { label: 'Multi-Platform Scraping', us: 'Google Maps focused', them: overrides['multiPlatform'] ?? false },
      ],
    },
    {
      category: 'Contact Enrichment',
      items: [
        { label: 'Email Discovery', us: true, them: overrides['emailDiscovery'] ?? false },
        { label: 'Phone Number Extraction', us: true, them: overrides['phoneExtraction'] ?? false },
        { label: 'Social Media Profiles', us: true, them: overrides['socialProfiles'] ?? false },
        { label: 'Email Verification', us: 'Included', them: overrides['emailVerification'] ?? false },
      ],
    },
    {
      category: 'Automation & Workflow',
      items: [
        { label: 'Bulk Keyword Generation', us: true, them: overrides['bulkKeywords'] ?? false },
        { label: 'Cloud Processing 24/7', us: true, them: overrides['cloudProcessing'] ?? false },
        { label: 'Real-Time Progress Tracking', us: true, them: overrides['realTimeTracking'] ?? false },
        { label: 'Email Sequences / Drip Campaigns', us: false, them: overrides['dripCampaigns'] ?? false },
      ],
    },
    {
      category: 'Pricing & Accessibility',
      items: [
        { label: 'Free Plan Available', us: true, them: overrides['freePlan'] ?? false },
        { label: 'One-Time Payment Option', us: true, them: overrides['oneTimePayment'] ?? false },
        { label: 'No Proxy / Technical Setup', us: true, them: overrides['noProxy'] ?? true },
        { label: 'No Coding Required', us: true, them: overrides['noCoding'] ?? true },
      ],
    },
  ];
}

// ─── Competitor Data ─────────────────────────────────────────────────────────

export const competitors: Record<string, CompetitorData> = {

  // ── Apollo.io ────────────────────────────────────────────────────────────
  apollo: {
    name: 'Apollo.io',
    slug: 'apollo',
    tagline: 'Full-stack B2B sales intelligence platform',
    heroDescription:
      'Apollo.io is a popular B2B sales platform with a massive contact database and built-in email sequences. But if your primary lead source is Google Maps — local businesses, service providers, restaurants, clinics — Apollo simply doesn\'t extract that data. LeadSpotter was purpose-built for this exact workflow.',
    verdict: 'LeadSpotter wins for Google Maps lead generation',
    verdictDetail:
      'Apollo excels at LinkedIn-based prospecting and email sequences. But for teams that need high-volume, enriched local business data from Google Maps, LeadSpotter delivers superior results at a fraction of the cost — without per-user pricing.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'Apollo has no Maps extraction — LeadSpotter is purpose-built for it' },
      { category: 'Best Value', winner: 'us', reason: 'No per-user fees. One-time payment available vs $49+/user/mo' },
      { category: 'Sales Sequences', winner: 'them', reason: 'Apollo has built-in email sequences and CRM — LeadSpotter focuses on data' },
    ],
    features: buildFeatures({
      mapsExtraction: false,
      websiteCrawling: false,
      linkedin: true,
      multiPlatform: 'Own B2B database',
      emailDiscovery: true,
      phoneExtraction: true,
      socialProfiles: true,
      emailVerification: true,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: true,
      freePlan: 'Limited',
      oneTimePayment: false,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Free', price: '$0/mo', note: '60 mobile credits, limited features' },
      { plan: 'Basic', price: '$49/user/mo', note: 'Per-user pricing adds up quickly' },
      { plan: 'Professional', price: '$79/user/mo', note: 'Advanced features, per-seat billing' },
    ],
    useCases: [
      { scenario: 'Extracting local business leads from Google Maps', best: 'leadspotter', reason: 'Apollo has no Google Maps scraping. LeadSpotter extracts names, emails, phones, and ratings directly.' },
      { scenario: 'LinkedIn prospecting and cold outreach sequences', best: 'them', reason: 'Apollo\'s B2B database and sequencing tools are built for LinkedIn-first workflows.' },
      { scenario: 'Building lead lists for a specific city or niche', best: 'leadspotter', reason: 'Bulk keyword generation lets you blanket an entire metro area in minutes.' },
      { scenario: 'Enterprise sales with CRM integration', best: 'them', reason: 'Apollo integrates natively with Salesforce, HubSpot, and other CRMs.' },
    ],
    switchReasons: [
      'You need Google Maps data — Apollo doesn\'t extract it at all.',
      'Per-user pricing ($49–$119/seat) makes Apollo expensive for growing teams.',
      'LeadSpotter\'s one-time payment option eliminates recurring subscription pressure.',
      'Zero setup required — no integrations, no onboarding, just enter a keyword and extract.',
    ],
    faqs: [
      { question: 'Can Apollo.io extract data from Google Maps?', answer: 'No. Apollo.io is a B2B database and sales engagement platform. It does not scrape or extract data from Google Maps. LeadSpotter is specifically designed for deep Google Maps extraction with built-in email and phone enrichment.' },
      { question: 'Is LeadSpotter cheaper than Apollo.io?', answer: 'Yes, significantly. Apollo charges $49–$119 per user per month. LeadSpotter offers a free tier, a Pro plan at ₹2,000/mo (approximately $24) with no per-user fees, and a one-time payment option for teams that prefer to avoid subscriptions.' },
      { question: 'Does LeadSpotter have email sequences like Apollo?', answer: 'No. LeadSpotter focuses exclusively on lead extraction and data enrichment. For email sequences, you can export LeadSpotter data as CSV and import it into Apollo, Instantly, or any outreach tool of your choice.' },
    ],
  },

  // ── ZoomInfo ─────────────────────────────────────────────────────────────
  zoominfo: {
    name: 'ZoomInfo',
    slug: 'zoominfo',
    tagline: 'Enterprise B2B contact and company data provider',
    heroDescription:
      'ZoomInfo is the go-to enterprise data provider with intent signals, org charts, and massive B2B databases. But at $15,000+/year with annual contracts, it\'s built for large sales orgs — not agencies or solo founders who need fast, affordable Google Maps leads. LeadSpotter gives you that data instantly, starting free.',
    verdict: 'LeadSpotter wins for affordability and Maps-specific data',
    verdictDetail:
      'ZoomInfo is an enterprise powerhouse for B2B intelligence and intent data. But if your workflow centers on extracting local business leads from Google Maps, LeadSpotter delivers equivalent — and often better — results for local data at 1/100th the cost.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'ZoomInfo doesn\'t scrape Google Maps — LeadSpotter is built for it' },
      { category: 'Best Value', winner: 'us', reason: 'Free to start vs $15,000+/year contracts' },
      { category: 'Enterprise Features', winner: 'them', reason: 'ZoomInfo offers intent data, org charts, and deep B2B firmographics' },
    ],
    features: buildFeatures({
      mapsExtraction: false,
      websiteCrawling: false,
      linkedin: 'Integration',
      multiPlatform: 'Own proprietary database',
      emailDiscovery: true,
      phoneExtraction: 'Direct dials included',
      socialProfiles: true,
      emailVerification: true,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: 'Limited',
      dripCampaigns: 'Via SalesOS',
      freePlan: false,
      oneTimePayment: false,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Professional', price: '~$15,000/yr', note: 'Annual contract required' },
      { plan: 'Advanced', price: '~$25,000/yr', note: 'Adds intent data and automation' },
      { plan: 'Elite', price: '~$40,000/yr', note: 'Full platform, custom integrations' },
    ],
    useCases: [
      { scenario: 'Scraping Google Maps for local service businesses', best: 'leadspotter', reason: 'ZoomInfo doesn\'t cover Google Maps. LeadSpotter extracts and enriches this data natively.' },
      { scenario: 'Enterprise account-based marketing (ABM)', best: 'them', reason: 'ZoomInfo\'s intent signals and firmographic data are industry-leading for ABM.' },
      { scenario: 'Budget-conscious teams needing verified local leads', best: 'leadspotter', reason: 'LeadSpotter starts free. ZoomInfo requires $15K+ annual commitments.' },
      { scenario: 'Large sales teams with Salesforce workflows', best: 'them', reason: 'ZoomInfo\'s native CRM integrations and org chart data support complex enterprise selling.' },
    ],
    switchReasons: [
      'ZoomInfo doesn\'t scrape Google Maps — your local lead pipeline has a gap.',
      'Annual contracts starting at $15,000+ are prohibitive for SMBs and agencies.',
      'LeadSpotter delivers verified emails and phones from Maps in minutes, not days.',
      'No sales calls or demos required — sign up and start extracting immediately.',
    ],
    faqs: [
      { question: 'Does ZoomInfo have Google Maps data?', answer: 'No. ZoomInfo\'s database is built from web crawling, partnerships, and community contributions — but it does not extract live data from Google Maps listings. LeadSpotter is purpose-built for this, pulling real-time business data including ratings, reviews, hours, and website-crawled contact info.' },
      { question: 'How much does ZoomInfo cost compared to LeadSpotter?', answer: 'ZoomInfo typically requires annual contracts starting around $15,000/year. LeadSpotter starts completely free, with a Pro plan at ₹2,000/month and a one-time payment option at ₹5,000 — making it accessible to freelancers, agencies, and small teams.' },
      { question: 'Can LeadSpotter replace ZoomInfo?', answer: 'It depends on your use case. If you primarily need Google Maps business data with enriched emails and phones, LeadSpotter is a superior and more affordable choice. If you need enterprise intent data, org charts, and deep firmographic intelligence, ZoomInfo remains the leader in that space.' },
    ],
  },

  // ── Lusha ─────────────────────────────────────────────────────────────────
  lusha: {
    name: 'Lusha',
    slug: 'lusha',
    tagline: 'B2B contact enrichment and prospecting platform',
    heroDescription:
      'Lusha is well-known for its Chrome extension that reveals contact details on LinkedIn profiles. It\'s quick and convenient for one-off lookups. But when you need hundreds or thousands of local business leads from Google Maps with deep email enrichment, Lusha\'s credit-based model gets expensive fast — and it doesn\'t touch Maps data at all.',
    verdict: 'LeadSpotter wins for volume-based local lead generation',
    verdictDetail:
      'Lusha is excellent for quick LinkedIn contact lookups. But it operates on a credit-per-contact model that becomes costly at scale, and it has zero Google Maps extraction capability. LeadSpotter lets you extract thousands of enriched leads from Maps without per-contact fees.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'Lusha is LinkedIn-focused — no Maps extraction at all' },
      { category: 'Best Value at Scale', winner: 'us', reason: 'No per-contact credits vs Lusha\'s credit-gated model' },
      { category: 'Quick LinkedIn Lookups', winner: 'them', reason: 'Lusha\'s Chrome extension is fast for individual LinkedIn profiles' },
    ],
    features: buildFeatures({
      mapsExtraction: false,
      websiteCrawling: false,
      linkedin: true,
      multiPlatform: false,
      emailDiscovery: 'Credit-based',
      phoneExtraction: 'Credit-based',
      socialProfiles: 'Limited',
      emailVerification: 'Basic',
      bulkKeywords: false,
      cloudProcessing: false,
      realTimeTracking: false,
      dripCampaigns: false,
      freePlan: '5 credits/mo',
      oneTimePayment: false,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Free', price: '$0/mo', note: 'Only 5 credits per month' },
      { plan: 'Pro', price: '$29/user/mo', note: '480 credits/year, per-user pricing' },
      { plan: 'Premium', price: '$51/user/mo', note: '960 credits/year, more features' },
    ],
    useCases: [
      { scenario: 'Extracting bulk leads from Google Maps for outreach', best: 'leadspotter', reason: 'Lusha doesn\'t access Google Maps. LeadSpotter extracts thousands of leads in a single run.' },
      { scenario: 'Finding a specific person\'s email on LinkedIn', best: 'them', reason: 'Lusha\'s Chrome extension reveals contact info directly on LinkedIn profiles.' },
      { scenario: 'Building city-wide or niche-specific lead lists', best: 'leadspotter', reason: 'Bulk keyword generation + cloud processing lets you blanket entire markets.' },
      { scenario: 'Enriching existing CRM contacts with direct dials', best: 'them', reason: 'Lusha integrates with CRMs to enrich existing records with phone numbers.' },
    ],
    switchReasons: [
      'Lusha\'s credit system means every contact costs you — LeadSpotter gives you thousands per run.',
      'No Google Maps extraction in Lusha. If Maps is your lead source, it simply doesn\'t work.',
      'Per-user pricing ($29–$51/seat) multiplies costs as your team grows.',
      'LeadSpotter includes email, phone, and social enrichment without separate credit charges.',
    ],
    faqs: [
      { question: 'Can Lusha extract leads from Google Maps?', answer: 'No. Lusha is a contact enrichment platform focused on LinkedIn profiles and company databases. It does not have any Google Maps scraping capability. LeadSpotter is specifically built to extract and enrich business data from Google Maps listings.' },
      { question: 'Why is LeadSpotter better than Lusha for bulk lead generation?', answer: 'Lusha uses a credit-per-contact model — each reveal costs a credit. LeadSpotter lets you extract thousands of leads per keyword search without per-contact charges, making it dramatically more cost-effective for volume-based prospecting.' },
      { question: 'Does LeadSpotter have a Chrome extension like Lusha?', answer: 'LeadSpotter is a cloud-based platform, not a browser extension. Instead of one-at-a-time lookups, you enter keywords and let the cloud extract hundreds of enriched leads automatically — a fundamentally different and more efficient workflow for bulk lead generation.' },
    ],
  },

  // ── Hunter.io ─────────────────────────────────────────────────────────────
  hunter: {
    name: 'Hunter.io',
    slug: 'hunter',
    tagline: 'Email finder and verification platform',
    heroDescription:
      'Hunter.io is a focused email-finding tool that excels at domain-based email search and verification. It\'s a great utility for finding email addresses associated with a specific company domain. But it doesn\'t extract business data from Google Maps, doesn\'t find phone numbers, and doesn\'t crawl websites for hidden contact details the way LeadSpotter does.',
    verdict: 'LeadSpotter wins for complete lead data from Google Maps',
    verdictDetail:
      'Hunter.io does one thing well: finding and verifying email addresses by domain. But modern lead generation requires more — phone numbers, social profiles, ratings, addresses, and the ability to bulk-generate leads from Google Maps. LeadSpotter delivers the full picture.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'Hunter has zero Maps functionality — it\'s domain-search only' },
      { category: 'Complete Contact Data', winner: 'us', reason: 'LeadSpotter extracts emails, phones, socials, ratings — Hunter only does email' },
      { category: 'Email Verification', winner: 'them', reason: 'Hunter\'s email verifier is industry-leading for deliverability' },
    ],
    features: buildFeatures({
      mapsExtraction: false,
      websiteCrawling: 'Domain search only',
      linkedin: false,
      multiPlatform: false,
      emailDiscovery: true,
      phoneExtraction: false,
      socialProfiles: false,
      emailVerification: true,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: 'Cold email campaigns',
      freePlan: '25 searches/mo',
      oneTimePayment: false,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Free', price: '$0/mo', note: '25 searches per month' },
      { plan: 'Starter', price: '$34/mo', note: '500 searches per month' },
      { plan: 'Growth', price: '$104/mo', note: '5,000 searches per month' },
    ],
    useCases: [
      { scenario: 'Finding emails for businesses discovered on Google Maps', best: 'leadspotter', reason: 'LeadSpotter extracts businesses AND finds their emails in one step. Hunter can\'t find the businesses.' },
      { scenario: 'Verifying a list of email addresses for deliverability', best: 'them', reason: 'Hunter\'s email verification is purpose-built and highly accurate.' },
      { scenario: 'Building a lead list for local businesses in a city', best: 'leadspotter', reason: 'Hunter requires you to already have domains. LeadSpotter discovers businesses from scratch via Maps.' },
      { scenario: 'Finding all email addresses at a known company domain', best: 'them', reason: 'Hunter\'s domain search reveals email patterns and known addresses at a given company.' },
    ],
    switchReasons: [
      'Hunter only finds emails — no phone numbers, addresses, ratings, or social profiles.',
      'You need to already know the domain to use Hunter. LeadSpotter discovers businesses from scratch.',
      'LeadSpotter combines business discovery and email enrichment in a single workflow.',
      'Bulk keyword generation lets you target entire markets — Hunter has no equivalent.',
    ],
    faqs: [
      { question: 'Is LeadSpotter better than Hunter.io for finding emails?', answer: 'For finding emails associated with Google Maps businesses, yes. LeadSpotter discovers businesses via Maps and then crawls their websites to extract emails, phones, and social profiles. Hunter requires you to already have a domain name, making it a verification/lookup tool rather than a discovery tool.' },
      { question: 'Can I use Hunter.io and LeadSpotter together?', answer: 'Absolutely. A powerful workflow is to use LeadSpotter to extract businesses and their websites from Google Maps, then run those domains through Hunter.io for additional email verification and pattern matching. They complement each other well.' },
      { question: 'Does Hunter.io extract data from Google Maps?', answer: 'No. Hunter.io is a domain-based email finder. It searches for email addresses associated with a specific website domain. It has no Google Maps integration or business directory scraping capability.' },
    ],
  },

  // ── Snov.io ───────────────────────────────────────────────────────────────
  snov: {
    name: 'Snov.io',
    slug: 'snov',
    tagline: 'Email finder, verifier, and outreach automation platform',
    heroDescription:
      'Snov.io combines email finding, verification, and drip campaign automation in one platform. It\'s a solid choice for cold email outreach pipelines. But like most email-focused tools, it doesn\'t touch Google Maps data — and its credit-based pricing can burn through budget quickly when you need volume.',
    verdict: 'LeadSpotter wins for Maps-based lead discovery at scale',
    verdictDetail:
      'Snov.io is a capable email outreach platform with verification and drip campaigns. But if your lead source is Google Maps — agencies prospecting local businesses, sales teams targeting service providers — LeadSpotter\'s purpose-built extraction delivers more data, faster, without per-credit costs.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'Snov.io has no Maps extraction — relies on domain/LinkedIn search' },
      { category: 'Cost at Volume', winner: 'us', reason: 'No per-credit charges vs Snov\'s credit-gated model' },
      { category: 'Email Outreach', winner: 'them', reason: 'Snov.io has built-in drip campaigns and email warmup' },
    ],
    features: buildFeatures({
      mapsExtraction: false,
      websiteCrawling: 'Domain search',
      linkedin: true,
      multiPlatform: false,
      emailDiscovery: true,
      phoneExtraction: false,
      socialProfiles: 'LinkedIn only',
      emailVerification: true,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: true,
      freePlan: '50 credits',
      oneTimePayment: false,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Trial', price: '$0/mo', note: '50 credits, limited features' },
      { plan: 'Starter', price: '$30/mo', note: '1,000 credits per month' },
      { plan: 'Pro', price: '$75/mo', note: '5,000 credits per month' },
    ],
    useCases: [
      { scenario: 'Extracting local businesses from Google Maps for cold outreach', best: 'leadspotter', reason: 'Snov.io can\'t find businesses on Maps. LeadSpotter discovers and enriches them automatically.' },
      { scenario: 'Running automated cold email drip campaigns', best: 'them', reason: 'Snov.io has native drip sequences, email warmup, and deliverability tools.' },
      { scenario: 'Building niche-specific lead lists from public business data', best: 'leadspotter', reason: 'Bulk keyword generation creates targeted lists from Maps data — no domains required.' },
      { scenario: 'Verifying emails and managing sender reputation', best: 'them', reason: 'Snov.io\'s verification and warmup tools are designed for outreach deliverability.' },
    ],
    switchReasons: [
      'Snov.io can\'t extract data from Google Maps — your local lead pipeline is missing.',
      'Credit-based pricing ($30/mo for just 1,000 credits) limits your extraction volume.',
      'LeadSpotter finds emails, phones, AND social profiles — Snov.io focuses only on email.',
      'One-time payment option means no recurring costs for teams with periodic extraction needs.',
    ],
    faqs: [
      { question: 'Can Snov.io scrape Google Maps?', answer: 'No. Snov.io is an email finder and outreach tool. It finds emails via domain search and LinkedIn, but has no Google Maps scraping capability. LeadSpotter is specifically designed for high-volume Google Maps extraction with built-in contact enrichment.' },
      { question: 'Should I use Snov.io or LeadSpotter for cold outreach?', answer: 'Use both. LeadSpotter is the ideal tool for building your lead list from Google Maps (discovery phase). Then export your enriched leads to Snov.io for email verification, drip campaigns, and outreach automation (engagement phase). They work well together.' },
      { question: 'How does LeadSpotter pricing compare to Snov.io?', answer: 'Snov.io charges $30–$75/month with credit limits. LeadSpotter\'s Pro plan is ₹2,000/mo (~$24) with 5,000 leads and no per-contact credits, plus a one-time payment option. For volume-based lead extraction, LeadSpotter is significantly more cost-effective.' },
    ],
  },

  // ── PhantomBuster ─────────────────────────────────────────────────────────
  phantombuster: {
    name: 'PhantomBuster',
    slug: 'phantombuster',
    tagline: 'Cloud-based automation and scraping platform',
    heroDescription:
      'PhantomBuster is a powerful automation platform that can scrape LinkedIn, Google Maps, Instagram, and more through pre-built "Phantoms." It offers flexibility — but at the cost of complexity. Each Phantom requires configuration, proxies can be finicky, and email enrichment is a separate add-on. LeadSpotter gives you the same Google Maps data in a fraction of the time.',
    verdict: 'LeadSpotter wins for simplicity and Maps-specific extraction',
    verdictDetail:
      'PhantomBuster is versatile — it can scrape many platforms. But for Google Maps specifically, LeadSpotter offers a simpler, faster, and more cost-effective experience. No Phantom configuration, no proxy management, no separate enrichment add-ons.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'us', reason: 'Both extract Maps data, but LeadSpotter includes enrichment natively' },
      { category: 'Ease of Use', winner: 'us', reason: 'No Phantom setup, no proxy config — just enter a keyword' },
      { category: 'Platform Versatility', winner: 'them', reason: 'PhantomBuster covers LinkedIn, Instagram, Facebook, and more' },
    ],
    features: buildFeatures({
      mapsExtraction: 'Via Google Maps Phantom',
      websiteCrawling: 'Via custom Phantom',
      linkedin: true,
      multiPlatform: true,
      emailDiscovery: 'Separate add-on',
      phoneExtraction: 'Separate add-on',
      socialProfiles: true,
      emailVerification: false,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: false,
      freePlan: '14-day trial',
      oneTimePayment: false,
      noProxy: 'Included but limited',
      noCoding: 'Some config required',
    }),
    theirPricing: [
      { plan: 'Starter', price: '$56/mo', note: '20 hr/mo execution, 5 Phantom slots' },
      { plan: 'Pro', price: '$128/mo', note: '80 hr/mo execution, 15 slots' },
      { plan: 'Team', price: '$352/mo', note: '300 hr/mo execution, 50 slots' },
    ],
    useCases: [
      { scenario: 'Simple, fast Google Maps lead extraction', best: 'leadspotter', reason: 'LeadSpotter is one keyword away from enriched leads. PhantomBuster requires Phantom setup and configuration.' },
      { scenario: 'Scraping LinkedIn profiles and company pages', best: 'them', reason: 'PhantomBuster\'s LinkedIn Phantoms are mature and handle pagination, connection requests, and more.' },
      { scenario: 'Bulk Google Maps extraction with email enrichment', best: 'leadspotter', reason: 'Email discovery is built into LeadSpotter. PhantomBuster charges extra for enrichment add-ons.' },
      { scenario: 'Multi-platform automation workflows', best: 'them', reason: 'PhantomBuster chains Phantoms across LinkedIn, Instagram, Google Maps, and more.' },
    ],
    switchReasons: [
      'Email and phone enrichment is built-in with LeadSpotter — not a paid add-on.',
      'No Phantom configuration or proxy management needed. Just type and extract.',
      'PhantomBuster\'s $56–$352/mo pricing adds up — LeadSpotter starts free with a one-time option.',
      'Bulk keyword generation automates the "what to search" problem PhantomBuster can\'t solve.',
    ],
    faqs: [
      { question: 'Is LeadSpotter easier to use than PhantomBuster?', answer: 'Yes, significantly. PhantomBuster requires selecting a Phantom, configuring inputs, managing execution time, and often setting up proxies. LeadSpotter takes a single keyword input and handles everything automatically — extraction, website crawling, email discovery, and export.' },
      { question: 'Does PhantomBuster include email enrichment?', answer: 'Not natively. PhantomBuster\'s Google Maps Phantom extracts business listings, but email discovery requires a separate enrichment add-on or third-party integration. LeadSpotter includes deep website crawling and email discovery as part of every extraction at no extra cost.' },
      { question: 'Can PhantomBuster do everything LeadSpotter does?', answer: 'Partially. PhantomBuster can scrape Google Maps via its dedicated Phantom, but it doesn\'t include built-in email enrichment, bulk keyword generation, or the same depth of website crawling. For Google Maps specifically, LeadSpotter is more complete and easier to use.' },
    ],
  },

  // ── D7 Lead Finder ────────────────────────────────────────────────────────
  d7leadfinder: {
    name: 'D7 Lead Finder',
    slug: 'd7leadfinder',
    tagline: 'B2B lead finder from Google Maps and business directories',
    heroDescription:
      'D7 Lead Finder is a straightforward tool for finding business leads from Google Maps and other directories. It shares some DNA with LeadSpotter, but LeadSpotter takes it further with deep website crawling, cloud-based 24/7 processing, social media discovery, and a modern bulk keyword engine.',
    verdict: 'LeadSpotter wins for depth of enrichment and automation',
    verdictDetail:
      'D7 Lead Finder handles basic Google Maps extraction well. But LeadSpotter\'s cloud processing, deep website crawling for hidden emails, social media profile discovery, and bulk keyword generation deliver a more complete dataset with less manual effort.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'tie', reason: 'Both extract from Google Maps — LeadSpotter adds deeper website crawling' },
      { category: 'Data Enrichment', winner: 'us', reason: 'LeadSpotter crawls websites for hidden emails and finds social profiles' },
      { category: 'Ease of Setup', winner: 'tie', reason: 'Both are simple to use with minimal configuration' },
    ],
    features: buildFeatures({
      mapsExtraction: true,
      websiteCrawling: 'Basic',
      linkedin: false,
      multiPlatform: 'Google + Bing + Yellow Pages',
      emailDiscovery: true,
      phoneExtraction: true,
      socialProfiles: 'Basic',
      emailVerification: 'Basic',
      bulkKeywords: false,
      cloudProcessing: false,
      realTimeTracking: true,
      dripCampaigns: false,
      freePlan: 'Limited trial',
      oneTimePayment: true,
      noProxy: true,
      noCoding: true,
    }),
    theirPricing: [
      { plan: 'Starter', price: '$26.90/mo', note: 'Basic extraction features' },
      { plan: 'Professional', price: '$44.90/mo', note: 'Advanced features and filters' },
      { plan: 'Lifetime', price: '$269', note: 'One-time payment, limited updates' },
    ],
    useCases: [
      { scenario: 'Deep email enrichment via website crawling', best: 'leadspotter', reason: 'LeadSpotter crawls business websites to find emails not listed on Google Maps.' },
      { scenario: 'Basic Google Maps lead extraction', best: 'them', reason: 'D7 Lead Finder is simple and handles basic Maps extraction effectively.' },
      { scenario: 'High-volume extraction with bulk keywords', best: 'leadspotter', reason: 'LeadSpotter generates hundreds of keyword variations automatically. D7 requires manual keyword entry.' },
      { scenario: 'Multi-directory search (Bing, Yellow Pages)', best: 'them', reason: 'D7 Lead Finder pulls from multiple business directories beyond Google Maps.' },
    ],
    switchReasons: [
      'LeadSpotter\'s deep website crawling finds emails that D7\'s basic scraping misses.',
      'Cloud-based 24/7 processing means you don\'t need to keep your browser open.',
      'Bulk keyword generation eliminates hours of manual keyword entry.',
      'Social media profile discovery adds Instagram, Facebook, LinkedIn, and Twitter links.',
    ],
    faqs: [
      { question: 'How is LeadSpotter different from D7 Lead Finder?', answer: 'While both extract business data from Google Maps, LeadSpotter offers deeper website crawling for hidden emails, cloud-based 24/7 processing (no browser required), bulk keyword generation for scaling searches, and social media profile discovery — features D7 Lead Finder doesn\'t include.' },
      { question: 'Does D7 Lead Finder have cloud processing?', answer: 'No. D7 Lead Finder runs locally, meaning you need to keep the tool open during extraction. LeadSpotter runs entirely in the cloud — start an extraction, close your browser, and come back when it\'s done.' },
      { question: 'Which has better email discovery: LeadSpotter or D7 Lead Finder?', answer: 'LeadSpotter. While D7 extracts emails listed on Google Maps, LeadSpotter goes further by crawling each business\'s website to find emails that aren\'t publicly listed on Maps — capturing significantly more contact data per lead.' },
    ],
  },

  // ── Outscraper ────────────────────────────────────────────────────────────
  outscraper: {
    name: 'Outscraper',
    slug: 'outscraper',
    tagline: 'Google Maps scraping API and service',
    heroDescription:
      'Outscraper is an API-first Google Maps scraping service built for developers who want raw data pipelines. It\'s powerful for engineering teams building custom integrations. But for sales teams and agencies who just need enriched leads in a spreadsheet, LeadSpotter\'s all-in-one interface is faster and more practical.',
    verdict: 'LeadSpotter wins for non-technical users needing complete leads',
    verdictDetail:
      'Outscraper excels as a developer API for raw Google Maps data at scale. But LeadSpotter combines extraction, email enrichment, phone discovery, social profiles, and CSV export in a single interface — no coding, no API keys, no per-result billing surprises.',
    quickVerdicts: [
      { category: 'Ease of Use', winner: 'us', reason: 'No API setup — LeadSpotter is a complete web interface' },
      { category: 'Built-in Enrichment', winner: 'us', reason: 'Email, phone, social included — Outscraper requires add-on services' },
      { category: 'API & Developer Tools', winner: 'them', reason: 'Outscraper is purpose-built for developers needing raw data via API' },
    ],
    features: buildFeatures({
      mapsExtraction: true,
      websiteCrawling: false,
      linkedin: false,
      multiPlatform: 'Google services',
      emailDiscovery: 'Separate add-on',
      phoneExtraction: true,
      socialProfiles: false,
      emailVerification: false,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: false,
      freePlan: 'Limited free tier',
      oneTimePayment: 'Pay-per-result',
      noProxy: true,
      noCoding: false,
    }),
    theirPricing: [
      { plan: 'Free', price: '$0/mo', note: 'Limited free tier' },
      { plan: 'Pay as You Go', price: '~$2/1K results', note: 'Per-result billing' },
      { plan: 'Monthly Plans', price: 'From $29/mo', note: 'Prepaid result credits' },
    ],
    useCases: [
      { scenario: 'Non-technical teams needing enriched Google Maps leads', best: 'leadspotter', reason: 'LeadSpotter is a complete web app — no API knowledge needed.' },
      { scenario: 'Building custom data pipelines with raw Maps data', best: 'them', reason: 'Outscraper\'s API is ideal for developers building automated data workflows.' },
      { scenario: 'Lead generation with emails, phones, and social profiles', best: 'leadspotter', reason: 'LeadSpotter enriches every lead with emails, phones, and socials. Outscraper requires separate enrichment.' },
      { scenario: 'Large-scale API-driven scraping for SaaS products', best: 'them', reason: 'Outscraper\'s API-first design integrates into custom applications and data pipelines.' },
    ],
    switchReasons: [
      'No coding or API setup required — LeadSpotter is a complete web application.',
      'Built-in email discovery, phone extraction, and social profile enrichment — not separate add-ons.',
      'Predictable monthly pricing vs pay-per-result costs that can spike unexpectedly.',
      'Bulk keyword generation automates what would require custom scripting with Outscraper.',
    ],
    faqs: [
      { question: 'Is Outscraper better than LeadSpotter for Google Maps scraping?', answer: 'It depends on your needs. Outscraper is an API service designed for developers who want raw data and custom integrations. LeadSpotter is an all-in-one platform for sales teams and agencies that includes extraction, email enrichment, and export in a simple web interface. For non-technical users, LeadSpotter is the better choice.' },
      { question: 'Does Outscraper include email enrichment?', answer: 'Not natively. Outscraper extracts business data from Google Maps but doesn\'t crawl websites for emails. Email enrichment is available as a separate, additional service. LeadSpotter includes deep website crawling and email discovery in every extraction.' },
      { question: 'Can I use LeadSpotter without coding knowledge?', answer: 'Yes. LeadSpotter is designed for non-technical users. Enter a keyword, choose a location, and start extracting. All enrichment happens automatically. No APIs, no scripts, no configuration required.' },
    ],
  },

  // ── Apify ─────────────────────────────────────────────────────────────────
  apify: {
    name: 'Apify',
    slug: 'apify',
    tagline: 'Web scraping and automation platform with Actor marketplace',
    heroDescription:
      'Apify is a developer-focused scraping platform with a marketplace of community-built "Actors" for every imaginable use case — including Google Maps. It\'s powerful and flexible, but the learning curve is steep, proxy costs add up, and email enrichment isn\'t included. LeadSpotter distills the Maps extraction workflow into a single, streamlined tool.',
    verdict: 'LeadSpotter wins for focused, zero-config Maps extraction',
    verdictDetail:
      'Apify is a Swiss Army knife for web scraping — impressive but complex. For the specific task of extracting enriched business leads from Google Maps, LeadSpotter is faster to start, includes all enrichment, and costs less when you factor in Apify\'s proxy and compute charges.',
    quickVerdicts: [
      { category: 'Google Maps Data', winner: 'tie', reason: 'Both extract Maps data — Apify via Actors, LeadSpotter natively' },
      { category: 'Total Cost (incl. proxies)', winner: 'us', reason: 'No proxy charges — Apify\'s residential proxy costs add up fast' },
      { category: 'Flexibility', winner: 'them', reason: 'Apify can scrape virtually any website with custom or marketplace Actors' },
    ],
    features: buildFeatures({
      mapsExtraction: 'Via marketplace Actor',
      websiteCrawling: 'Via custom Actor',
      linkedin: 'Via marketplace Actor',
      multiPlatform: true,
      emailDiscovery: 'Via separate Actor',
      phoneExtraction: 'Via Actor output',
      socialProfiles: 'Via separate Actor',
      emailVerification: false,
      bulkKeywords: false,
      cloudProcessing: true,
      realTimeTracking: true,
      dripCampaigns: false,
      freePlan: '$5 free credit',
      oneTimePayment: false,
      noProxy: false,
      noCoding: 'Actors need configuration',
    }),
    theirPricing: [
      { plan: 'Free', price: '$5 credit', note: 'One-time credit, then pay-as-you-go' },
      { plan: 'Starter', price: '$49/mo', note: 'Plus proxy costs ($8/GB residential)' },
      { plan: 'Scale', price: '$499/mo', note: 'High volume, proxy costs additional' },
    ],
    useCases: [
      { scenario: 'Quick, enriched Google Maps lead extraction', best: 'leadspotter', reason: 'One keyword input vs finding an Actor, configuring it, managing proxies, and chaining enrichment.' },
      { scenario: 'Scraping custom websites or niche data sources', best: 'them', reason: 'Apify\'s Actor marketplace and SDK support virtually any scraping target.' },
      { scenario: 'Non-technical users needing leads in a spreadsheet', best: 'leadspotter', reason: 'LeadSpotter requires zero technical knowledge. Apify needs Actor selection, input configuration, and proxy management.' },
      { scenario: 'Building scraping infrastructure for a SaaS product', best: 'them', reason: 'Apify\'s platform, SDK, and infrastructure are built for engineering teams.' },
    ],
    switchReasons: [
      'No Actor configuration, proxy setup, or compute management — just enter a keyword.',
      'Email and social enrichment is included, not a separate Actor you need to chain.',
      'Apify\'s proxy costs ($8/GB residential) add significant hidden costs to Maps scraping.',
      'Bulk keyword generation replaces the manual work of preparing Actor input lists.',
    ],
    faqs: [
      { question: 'Is Apify better than LeadSpotter for Google Maps scraping?', answer: 'Apify is more flexible — it can scrape almost any website. But for the specific workflow of extracting enriched Google Maps leads, LeadSpotter is faster, simpler, and more cost-effective. No Actor setup, no proxy configuration, and enrichment is included.' },
      { question: 'Does Apify include email enrichment?', answer: 'Not in its Google Maps Actors. Email enrichment requires a separate Actor or third-party integration, adding complexity and cost. LeadSpotter crawls each business\'s website to discover emails, phone numbers, and social profiles as part of every extraction.' },
      { question: 'What are Apify\'s hidden costs compared to LeadSpotter?', answer: 'Apify charges for compute time, storage, and proxies separately. Residential proxy bandwidth costs $8/GB, and Google Maps scraping is proxy-intensive. LeadSpotter includes everything in a flat monthly fee or one-time payment — no hidden charges.' },
    ],
  },
};

// ─── Helper: Get all competitor slugs for cross-linking ──────────────────────

export function getAllCompetitorSlugs(): string[] {
  return Object.keys(competitors);
}
