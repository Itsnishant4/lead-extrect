import { Metadata } from 'next';
import { PlanService } from '@/services/plan.service';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { LandingBanner } from '@/components/LandingBanner';
import JsonLd from '@/components/JsonLd';
import { StaticBreadcrumbs } from '@/components/Breadcrumbs';
import { Check, X, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR: Revalidate every hour

export const metadata: Metadata = {
  title: 'LeadSpotter Pricing — Free & Paid Plans for Google Maps Lead Extraction',
  description: 'Choose the right plan to scale your lead generation. Transparent pricing for Google Maps extraction.',
  keywords: ['leadspotter pricing', 'google maps scraper pricing', 'lead extraction plans', 'b2b lead generation cost', 'google maps leads pricing'],
  alternates: {
    canonical: 'https://leadspotter.in/pricing',
  },
  openGraph: {
    title: 'Pricing | LeadSpotter',
    description: 'Choose the right plan to scale your lead generation. Transparent pricing for Google Maps extraction.',
    url: 'https://leadspotter.in/pricing',
    siteName: 'LeadSpotter',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | LeadSpotter',
    description: 'Choose the right plan to scale your lead generation.',
    images: ['https://leadspotter.in/opengraph-image'],
  },
};

export default async function PricingPage() {
  const plans = await PlanService.getAllPlans();

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden min-h-screen flex flex-col">
      <LandingBanner />
      <LandingHeader hasBanner={true} />
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "https://leadspotter.in" },
            { name: "Pricing", url: "https://leadspotter.in/pricing" },
          ],
        }}
      />
      <JsonLd
        type="FAQPage"
        data={{
          faqs: [
            {
              "@type": "Question",
              name: "What happens when I run out of credits?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Your active tasks will pause. You can upgrade to a higher plan to resume them immediately, or wait until your next billing cycle for credits to reset.",
              },
            },
            {
              "@type": "Question",
              name: "Can I cancel my subscription?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, you can cancel your monthly subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.",
              },
            },
            {
              "@type": "Question",
              name: 'How are "leads" counted?',
              acceptedAnswer: {
                "@type": "Answer",
                text: "One lead equals one business profile successfully extracted from Google Maps, complete with all available data points (emails, phones, socials, etc).",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer refunds?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Because we incur immediate server and proxy costs for extracting leads, we generally do not offer refunds. We recommend trying the Free plan first to ensure LeadSpotter meets your needs.",
              },
            },
          ],
        }}
      />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="pt-28 md:pt-40 pb-16 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <StaticBreadcrumbs items={[
              { label: 'Home', href: '/' },
              { label: 'Pricing', href: '/pricing' }
            ]} />
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Simple, transparent<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                pricing plans
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Start extracting leads for free. Upgrade when you need more volume, speed, and advanced enrichment.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24 relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className={`grid grid-cols-1 gap-8 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : ''}`}>
              {plans.map((plan) => {
                const isPopular = !!plan.badge;
                const isFree = plan.period === 'free';
                const isCustom = plan.period === 'custom';

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col p-8 rounded-[2rem] transition-all duration-300 bg-white border shadow-sm hover:shadow-xl ${isPopular
                      ? 'border-indigo-200 shadow-indigo-100/50 scale-100 md:scale-105 z-10'
                      : 'border-slate-200 hover:border-indigo-100'
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      {isFree ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-slate-900">Free</span>
                        </div>
                      ) : isCustom ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900">Custom</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                            <span className="text-slate-500 font-medium">
                              {plan.period === 'one-time' ? '/once' : '/mo'}
                            </span>
                          </div>
                          {(plan.discount ?? 0) > plan.price && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-slate-400 line-through text-sm font-medium">₹{plan.discount}</span>
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                Save {Math.round((((plan.discount ?? 0) - plan.price) / (plan.discount ?? 1)) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Link
                      href={isCustom ? (plan.whatsappUrl || '#') : '/signup'}
                      target={isCustom ? '_blank' : undefined}
                      className={`w-full py-4 px-6 rounded-full font-bold text-center transition-all flex items-center justify-center gap-2 ${isPopular
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:opacity-90'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                      {isFree ? 'Start for free' : isCustom ? 'Contact Sales' : 'Get Started'}
                      <ArrowRight size={16} />
                    </Link>

                    <div className="mt-8 space-y-6 flex-1">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">What's included</p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="mt-0.5 bg-indigo-50 rounded-full p-1 text-indigo-600 shrink-0">
                              <Zap size={14} />
                            </div>
                            <span className="text-slate-700 text-sm font-medium">
                              {isCustom ? 'Unlimited leads' : `${plan.leadsCredits?.toLocaleString()} leads`} {plan.period === 'month' ? '/ month' : ''}
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="mt-0.5 bg-indigo-50 rounded-full p-1 text-indigo-600 shrink-0">
                              <Zap size={14} />
                            </div>
                            <span className="text-slate-700 text-sm font-medium">
                              {plan.maxConcurrentTasks} concurrent task{plan.maxConcurrentTasks !== 1 ? 's' : ''}
                            </span>
                          </li>
                          {(plan.features as string[] || []).map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="mt-0.5 bg-emerald-50 rounded-full p-1 text-emerald-600 shrink-0">
                                <Check size={14} strokeWidth={3} />
                              </div>
                              <span className="text-slate-600 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {(plan.unavailableFeatures as string[] || []).length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Not included</p>
                          <ul className="space-y-3 opacity-60">
                            {(plan.unavailableFeatures as string[] || []).map((feature, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400 shrink-0">
                                  <X size={16} />
                                </div>
                                <span className="text-slate-500 text-sm line-through">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <p className="text-gray-500">Everything you need to know about the product and billing.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">What happens when I run out of credits?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Your active tasks will pause. You can upgrade to a higher plan to resume them immediately, or wait until your next billing cycle for credits to reset.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Can I cancel my subscription?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Yes, you can cancel your monthly subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">How are "leads" counted?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">One lead equals one business profile successfully extracted from Google Maps, complete with all available data points (emails, phones, socials, etc).</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Do you offer refunds?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Because we incur immediate server and proxy costs for extracting leads, we generally do not offer refunds. We recommend trying the Free plan first to ensure LeadSpotter meets your needs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div >
  );
}
