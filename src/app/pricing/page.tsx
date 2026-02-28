import { Metadata } from 'next';
import { PlanService } from '@/services/plan.service';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR: Revalidate every hour

export const metadata: Metadata = {
  title: 'Pricing | LeadSpotter',
  description: 'Choose the right plan to scale your lead generation. Transparent pricing for Google Maps extraction.',
};

export default async function PricingPage() {
  const plans = await PlanService.getAllPlans();

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 w-full pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium">
              Start extracting leads for free. Upgrade when you need more volume, speed, and advanced enrichment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = !!plan.badge;
              const isFree = plan.period === 'free';
              const isCustom = plan.period === 'custom';

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col p-8 rounded-[2rem] transition-all duration-300 ${
                    isPopular 
                      ? 'bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-200 shadow-xl shadow-indigo-100/50 scale-105 z-10' 
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
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
                    className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:opacity-90'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isFree ? 'Start for free' : isCustom ? 'Contact Sales' : 'Get Started'}
                  </Link>

                  <div className="mt-8 space-y-6 flex-1">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">What's included</p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="mt-0.5 bg-indigo-100 rounded-full p-0.5 text-indigo-600 shrink-0">
                            <Zap size={14} />
                          </div>
                          <span className="text-slate-700 text-sm font-medium">
                            {isCustom ? 'Unlimited' : plan.leadsCredits.toLocaleString()} leads / {plan.period === 'month' ? 'month' : 'total'}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="mt-0.5 bg-indigo-100 rounded-full p-0.5 text-indigo-600 shrink-0">
                            <Zap size={14} />
                          </div>
                          <span className="text-slate-700 text-sm font-medium">
                            {plan.maxConcurrentTasks} concurrent task{plan.maxConcurrentTasks !== 1 ? 's' : ''}
                          </span>
                        </li>
                        {(plan.features as string[] || []).map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 bg-emerald-100 rounded-full p-0.5 text-emerald-600 shrink-0">
                              <Check size={14} />
                            </div>
                            <span className="text-slate-700 text-sm">{feature}</span>
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

          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left mt-10">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">What happens when I run out of credits?</h3>
                <p className="text-slate-500 text-sm">Your active tasks will pause. You can upgrade to a higher plan to resume them immediately, or wait until your next billing cycle for credits to reset.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Can I cancel my subscription?</h3>
                <p className="text-slate-500 text-sm">Yes, you can cancel your monthly subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">How are "leads" counted?</h3>
                <p className="text-slate-500 text-sm">One lead equals one business profile successfully extracted from Google Maps, complete with all available data points (emails, phones, socials, etc).</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Do you offer refunds?</h3>
                <p className="text-slate-500 text-sm">Because we incur immediate server and proxy costs for extracting leads, we generally do not offer refunds. We recommend trying the Free plan first to ensure LeadSpotter meets your needs.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
