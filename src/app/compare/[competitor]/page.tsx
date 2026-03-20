import type { Metadata } from 'next';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingBanner } from '@/components/LandingBanner';
import { LandingFooter } from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  Shield,
  Star,
  ChevronDown,
  Globe,
  Users,
  BadgeCheck,
  CircleDollarSign,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { competitors, getAllCompetitorSlugs, type CompetitorData } from './competitor-data';
import { PlanService } from '@/services/plan.service';

// ─── Static generation for all competitor pages ──────────────────────────────

export async function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({
    competitor: `leadspotter-vs-${slug}`,
  }));
}

export const dynamicParams = true;
export const revalidate = 3600; // ISR revalidate every hour

// ─── SEO Metadata ────────────────────────────────────────────────────────────

type Params = Promise<{ competitor: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { competitor } = await params;
  const compKey = competitor.replace('leadspotter-vs-', '');
  const comp = competitors[compKey];

  if (!comp) return { title: 'Not Found' };

  return {
    title: `LeadSpotter vs ${comp.name} (2025) | #1 Alternative Compared`,
    description: `Detailed comparison of LeadSpotter vs ${comp.name}. See features, pricing, pros & cons, and why teams switch to LeadSpotter for Google Maps lead extraction.`,
    alternates: {
      canonical: `https://leadspotter.in/compare/leadspotter-vs-${compKey}`,
    },
    openGraph: {
      title: `LeadSpotter vs ${comp.name} — Which is Better for Lead Generation?`,
      description: `Side-by-side comparison: features, pricing, and real use cases. See why LeadSpotter is the #1 ${comp.name} alternative for Google Maps leads.`,
      url: `https://leadspotter.in/compare/leadspotter-vs-${compKey}`,
      type: 'website',
    },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function ComparePage({ params }: { params: Params }) {
  const { competitor } = await params;
  const compKey = competitor.replace('leadspotter-vs-', '');
  const comp = competitors[compKey];

  if (!comp) {
    notFound();
  }

  const plans = await PlanService.getAllPlans();
  const leadspotterPricing = plans.map(p => ({
    plan: p.name,
    price: p.period === 'free' ? 'Free' : p.period === 'custom' ? 'Custom' : `₹${p.price}${p.period === 'month' ? '/mo' : ''}`,
    note: p.period === 'custom' ? 'Enterprise solutions' : `${p.leadsCredits.toLocaleString()} leads`
  }));

  const otherCompetitors = getAllCompetitorSlugs().filter((s) => s !== compKey);

  return (
    <div className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
      {/* JSON-LD Structured Data */}
      <JsonLd
        type="FAQPage"
        data={{
          faqs: comp.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      />

      <LandingBanner />
      <LandingHeader />

      <main className="flex-grow">
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: Hero
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-100/60 via-violet-50/40 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/compare/leadspotter-vs-apollo" className="hover:text-gray-600 transition-colors">Compare</Link>
              <span>/</span>
              <span className="text-gray-600">vs {comp.name}</span>
            </div>

            {/* VS Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-5 py-2 text-sm font-medium text-gray-500">
                <ArrowRightLeft size={16} className="text-indigo-500" />
                Comparison Guide &middot; Updated {new Date().getFullYear()}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight leading-[1.1] mb-6">
              LeadSpotter{' '}
              <span className="text-gray-300 font-normal italic mx-1 md:mx-2">vs</span>{' '}
              {comp.name}
            </h1>

            <p className="text-lg md:text-xl text-gray-500 text-center max-w-3xl mx-auto leading-relaxed mb-10">
              {comp.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)' }}
              >
                Try LeadSpotter Free <ArrowRight size={16} />
              </Link>
              <a
                href="#comparison"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 px-8 py-4 rounded-full text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                See Full Comparison <ChevronDown size={16} />
              </a>
            </div>

            {/* Trust Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><BadgeCheck size={16} className="text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Zap size={16} className="text-amber-500" /> Setup in 30 seconds</span>
              <span className="flex items-center gap-1.5"><Star size={16} className="text-indigo-500" /> 4.9/5 rating</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: Quick Verdict (TL;DR)
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                <Trophy size={14} /> TL;DR Verdict
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{comp.verdict}</h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{comp.verdictDetail}</p>
            </div>

            <div className="grid gap-4">
              {comp.quickVerdicts.map((v, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${v.winner === 'us'
                      ? 'bg-green-50/60 border-green-200/60'
                      : v.winner === 'them'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-amber-50/40 border-amber-200/50'
                    }`}
                >
                  <div className="shrink-0">
                    {v.winner === 'us' && (
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Trophy size={18} className="text-green-600" />
                      </div>
                    )}
                    {v.winner === 'them' && (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-bold">2nd</span>
                      </div>
                    )}
                    {v.winner === 'tie' && (
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ArrowRightLeft size={18} className="text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{v.category}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{v.reason}</div>
                  </div>
                  <div className="shrink-0 hidden sm:block">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${v.winner === 'us'
                        ? 'bg-green-100 text-green-700'
                        : v.winner === 'them'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                      {v.winner === 'us' ? 'LeadSpotter' : v.winner === 'them' ? comp.name : 'Tie'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: Feature Comparison Table
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="comparison" className="py-16 md:py-24 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                <Sparkles size={14} /> Feature-by-Feature
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                LeadSpotter vs {comp.name}: Full Feature Comparison
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_100px] sm:grid-cols-3 bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">Feature</div>
                <div className="text-center">
                  <div className="text-sm font-bold text-indigo-600">LeadSpotter</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-900">{comp.name}</div>
                </div>
              </div>

              {/* Feature Categories */}
              {comp.features.map((category, ci) => (
                <div key={ci}>
                  {/* Category Header */}
                  <div className="bg-gray-50/60 border-b border-t border-gray-100 px-4 sm:px-6 py-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category.category}</span>
                  </div>
                  {/* Feature Rows */}
                  <div className="divide-y divide-gray-50">
                    {category.items.map((item, fi) => (
                      <div
                        key={fi}
                        className="grid grid-cols-[1fr_100px_100px] sm:grid-cols-3 p-4 sm:px-6 sm:py-4 items-center hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-700">{item.label}</div>
                        <div className="flex justify-center">
                          <FeatureValue value={item.us} positive />
                        </div>
                        <div className="flex justify-center">
                          <FeatureValue value={item.them} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: Pricing Comparison
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                <CircleDollarSign size={14} /> Pricing
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Pricing: LeadSpotter vs {comp.name}
              </h2>
              <p className="text-gray-500 mt-3">Transparent pricing. No hidden fees. No per-user charges.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* LeadSpotter Pricing */}
              <div className="relative bg-white rounded-3xl border-2 border-indigo-200 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                  RECOMMENDED
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Sparkles size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">LeadSpotter</h3>
                      <p className="text-xs text-gray-400">Google Maps Lead Extraction</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {leadspotterPricing.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                        <div>
                          <div className="font-bold text-gray-900">{p.plan}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{p.note}</div>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">{p.price}</div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 w-full mt-6 text-white px-6 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)' }}
                  >
                    Start Free <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Competitor Pricing */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Globe size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-700">{comp.name}</h3>
                      <p className="text-xs text-gray-400">{comp.tagline}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {comp.theirPricing.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <div className="font-bold text-gray-700">{p.plan}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.note}</div>
                        </div>
                        <div className="text-lg font-bold text-gray-500">{p.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: Use Cases — Who Should Use What
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                <Users size={14} /> Use Cases
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                When to Use LeadSpotter vs {comp.name}
              </h2>
              <p className="text-gray-500 mt-3">We&apos;re honest — no tool is perfect for everything.</p>
            </div>

            <div className="space-y-4">
              {comp.useCases.map((uc, i) => (
                <div
                  key={i}
                  className={`flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 rounded-2xl border transition-all ${uc.best === 'leadspotter'
                      ? 'bg-green-50/40 border-green-200/50'
                      : 'bg-gray-50/60 border-gray-200/60'
                    }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {uc.best === 'leadspotter' ? (
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 mb-1">{uc.scenario}</div>
                    <div className="text-sm text-gray-500">{uc.reason}</div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${uc.best === 'leadspotter'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {uc.best === 'leadspotter' ? 'LeadSpotter' : comp.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6: Why Switch to LeadSpotter
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                <Shield size={14} /> Why Switch
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Why Teams Switch from {comp.name} to LeadSpotter
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {comp.switchReasons.map((reason, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)' }}
              >
                Make the Switch — Start Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 7: FAQ
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 mt-3">
                Common questions about LeadSpotter vs {comp.name}
              </p>
            </div>

            <div className="space-y-4">
              {comp.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none font-bold text-gray-900 text-sm sm:text-base [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown size={18} className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 8: Cross-Links to Other Comparisons
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-12 md:py-16 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
              More Comparisons
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {otherCompetitors.map((slug) => {
                const other = competitors[slug];
                return (
                  <Link
                    key={slug}
                    href={`/compare/leadspotter-vs-${slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
                  >
                    vs {other.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function FeatureValue({ value, positive }: { value: boolean | string; positive?: boolean }) {
  if (value === true) {
    return (
      <CheckCircle2
        size={20}
        className={positive ? 'text-green-500' : 'text-green-500'}
      />
    );
  }
  if (value === false) {
    return <XCircle size={20} className="text-gray-300" />;
  }
  // String value (partial support, notes)
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${positive
        ? 'bg-green-50 text-green-700 border border-green-100'
        : 'bg-amber-50 text-amber-700 border border-amber-100'
      }`}>
      {value}
    </span>
  );
}
