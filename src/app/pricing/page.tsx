import { Metadata } from 'next';
import { PlanService } from '@/services/plan.service';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { LandingBanner } from '@/components/LandingBanner';
import { Check, X, Zap, User, Award, Diamond } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR: Revalidate every hour

export const metadata: Metadata = {
  title: 'Pricing | LeadSpotter',
  description: 'Choose the right plan to scale your lead generation. Transparent pricing for Google Maps extraction.',
};

export default async function PricingPage() {
  const plans = await PlanService.getAllPlans();
  const planIcons = [User, Award, Diamond, Zap, Zap];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground overflow-x-hidden">
      <LandingBanner />
      <LandingHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 to-transparent dark:from-indigo-900/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10" />
        
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4">Pricing</p>
          <h1 className="serif-font text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-foreground tracking-tight mb-6">
            Choose Your Plan
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium">
            Scale your lead generation with the right plan. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-6 relative z-10 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : ''}`}>
          {plans.map((plan, index) => {
            const hasBadge = !!plan.badge;
            const isHighlight = hasBadge;
            const isFree = plan.period === 'free';
            const isCustom = plan.period === 'custom';
            const Icon = planIcons[index] || Zap;

            return (
              <div
                key={plan.id}
                className={`relative glass-card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:translate-y-[-4px] ${
                  isHighlight ? 'ring-2 ring-indigo-400/50 shadow-xl shadow-indigo-100/40 dark:shadow-indigo-900/20' : ''
                }`}
              >
                {/* Badge */}
                {hasBadge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap ${
                      isCustom ? 'bg-violet-600' : 'gradient-button'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isFree ? 'bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' :
                    isCustom ? 'bg-violet-100/60 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' :
                    isHighlight ? 'bg-indigo-100/60 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' :
                    'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {isFree ? (
                    <>
                      <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-medium ml-1">/forever</span>
                    </>
                  ) : isCustom ? (
                    <>
                      <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">Custom</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-1 block mt-0.5">contact for pricing</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-foreground">₹{plan.price?.toLocaleString()}</span>
                        {(plan.discount ?? 0) > plan.price && (
                          <span className="text-lg text-slate-400 dark:text-slate-500 line-through font-medium">₹{plan.discount?.toLocaleString()}</span>
                        )}
                      </div>
                      {(plan.discount ?? 0) > plan.price && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round((((plan.discount ?? 0) - plan.price) / (plan.discount ?? 1)) * 100)}% off
                        </span>
                      )}
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-medium ml-1">
                        {plan.period === 'month' ? '/month' : ''}
                      </span>
                      {plan.period === 'one-time' && (
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-1 block mt-0.5">one-time purchase</span>
                      )}
                    </>
                  )}
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{plan.description}</p>
                )}

                {/* Credits */}
                <div className={`mb-3 px-3 py-2 rounded-xl ${
                  isFree ? 'bg-emerald-50/60 dark:bg-emerald-950/30' :
                  isCustom ? 'bg-violet-50/60 dark:bg-violet-950/30' :
                  'bg-indigo-50/60 dark:bg-indigo-950/30'
                }`}>
                  <p className={`text-xs font-bold ${
                    isFree ? 'text-emerald-600 dark:text-emerald-400' :
                    isCustom ? 'text-violet-600 dark:text-violet-400' :
                    'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {isCustom ? 'Unlimited lead credits' : `${plan.leadsCredits?.toLocaleString()} lead credits`}
                  </p>
                </div>

                <div className={`mb-6 px-3 py-2 rounded-xl ${
                  isFree ? 'bg-emerald-50/60 dark:bg-emerald-950/30' :
                  isCustom ? 'bg-violet-50/60 dark:bg-violet-950/30' :
                  'bg-indigo-50/60 dark:bg-indigo-950/30'
                }`}>
                  <p className={`text-xs font-bold ${
                    isFree ? 'text-emerald-600 dark:text-emerald-400' :
                    isCustom ? 'text-violet-600 dark:text-violet-400' :
                    'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {plan.maxConcurrentTasks} concurrent task{plan.maxConcurrentTasks !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Included Features (checkmark) */}
                <ul className="space-y-3 flex-1 mb-4">
                  {(plan.features || []).map((feature: string, i: number) => (
                    <li key={`f-${i}`} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}

                  {/* Unavailable Features (X mark) */}
                  {(plan.unavailableFeatures || []).map((feature: string, i: number) => (
                    <li key={`u-${i}`} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-rose-50/80 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                        <X size={14} className="text-rose-400" />
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="mt-auto">
                  <Link
                    href={isCustom ? (plan.whatsappUrl || '#') : '/signup'}
                    target={isCustom ? '_blank' : undefined}
                    className={`w-full flex items-center justify-center py-4 rounded-2xl text-sm font-bold transition-all ${
                      isHighlight
                        ? 'gradient-button text-white shadow-lg shadow-indigo-200/50 dark:shadow-none hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-white dark:bg-background border-2 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {isFree ? 'Start for free' : isCustom ? 'Contact Sales' : 'Get Started'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-24 text-center relative z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-4">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left mt-10">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-foreground mb-2">What happens when I run out of credits?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Your active tasks will pause. You can upgrade to a higher plan to resume them immediately, or wait until your next billing cycle for credits to reset.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-foreground mb-2">Can I cancel my subscription?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Yes, you can cancel your monthly subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-foreground mb-2">How are "leads" counted?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">One lead equals one business profile successfully extracted from Google Maps, complete with all available data points (emails, phones, socials, etc).</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-foreground mb-2">Do you offer refunds?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Because we incur immediate server and proxy costs for extracting leads, we generally do not offer refunds. We recommend trying the Free plan first to ensure LeadSpotter meets your needs.</p>
            </div>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
