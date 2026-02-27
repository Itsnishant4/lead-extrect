'use client';

import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2, User, Award, Diamond, Check, CheckCircle, Zap, MessageCircle, ShieldCheck,
} from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    id: 'free',
    price: '₹0',
    period: '/month',
    description: 'Perfect for testing and small projects.',
    limit: 500,
    Icon: User,
    features: [
      'Up to 500 leads extraction',
      'Localized search by area',
      'Basic email extraction',
      'Standard support',
    ],
    buttonText: 'Current Plan',
  },
  {
    name: 'Pro',
    id: 'pro',
    price: '₹2,000',
    period: '/month',
    description: 'For professionals needing more volume.',
    limit: 5000,
    Icon: Award,
    features: [
      'Up to 5,000 leads extraction',
      'Priority area caching',
      'Advanced social enrichment',
      'Bulk export history',
      'Priority email support',
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Premium',
    id: 'premium',
    price: 'Custom',
    period: '',
    description: 'Scale without limits for your entire team.',
    limit: Infinity,
    Icon: Diamond,
    features: [
      'Unlimited leads extraction',
      'Full API access',
      'Dedicated account manager',
      'Custom integration support',
      'White-glove data cleaning',
    ],
    buttonText: 'Contact Sales',
    whatsapp: true,
  },
];

export default function SubscriptionPage() {
  const { user, isLoadingUser: isLoading } = useAutomation();

  const handleUpgrade = (plan: (typeof PLANS)[number]) => {
    if (plan.whatsapp) {
      window.open(
        'https://wa.me/919773005701?text=Hi, I am interested in the Premium plan for Lead Extractor.',
        '_blank'
      );
    } else if (plan.id === 'pro') {
      toast.info('Payment gateway integration is being finalized. Our team will contact you shortly to activate your Pro features!', {
        description: 'You can also reach out via WhatsApp for instant activation.',
        action: {
          label: 'WhatsApp Support',
          onClick: () => window.open('https://wa.me/919773005701?text=Hi, I want to upgrade to Pro plan.', '_blank')
        },
        duration: 10000,
      });
    }
  };

  const currentPlan = PLANS.find((p) => p.id === (user?.planType || 'free'));
  const usedLeads = user?.leadsExtracted || 0;
  const baseLimit = currentPlan?.limit || 500;
  const bonusCredits = user?.bonusCredits || 0;
  const limit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits;
  const remaining = limit === Infinity ? Infinity : Math.max(limit - usedLeads, 0);
  const usagePercent = limit === Infinity ? 0 : Math.min((usedLeads / limit) * 100, 100);

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground"
    >
      <DashboardHeader activePage="search" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-300 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading plans...</p>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="text-center mb-12">
              <h1 className="serif-font text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-foreground mb-4">Choose Your Plan</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
                Scale your lead generation with the right plan. Upgrade or downgrade at any time.
              </p>
            </div>

            {/* Usage bar */}
            {user && (
              <div className="glass-card rounded-2xl p-6 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Current usage</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-foreground mt-1">
                    {usedLeads.toLocaleString()} / {limit === Infinity ? 'Unlimited' : limit.toLocaleString()} leads
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Plan: <span className="font-bold capitalize text-indigo-600 dark:text-indigo-400">{user.planType}</span>
                  </p>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${usagePercent}%`,
                        background:
                          usagePercent > 80
                            ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
                            : 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    <span>{Math.round(usagePercent)}% used</span>
                    <span>{limit === Infinity ? 'No limit' : `${remaining.toLocaleString()} available`}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => {
                const isCurrent = user?.planType === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative glass-card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:translate-y-[-4px] ${plan.highlight
                        ? 'ring-2 ring-indigo-400/50 shadow-xl shadow-indigo-100/40'
                        : ''
                      } ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="gradient-button text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    {/* Current indicator */}
                    {isCurrent && !plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                          Current
                        </span>
                      </div>
                    )}

                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.highlight
                          ? 'bg-indigo-100/60 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                        }`}>
                        <plan.Icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-foreground">{plan.price}</span>
                      {plan.period && (
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium ml-1">{plan.period}</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{plan.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-50/60 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                            <Check size={14} className="text-indigo-500" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl text-sm font-bold bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50 cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={14} />
                          Current Plan
                        </span>
                      </button>
                    ) : plan.highlight ? (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full gradient-button text-white py-4 rounded-2xl font-bold text-sm shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Zap size={14} />
                          {plan.buttonText}
                        </span>
                      </button>
                    ) : plan.whatsapp ? (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full py-4 rounded-2xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 dark:shadow-emerald-950"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <MessageCircle size={14} />
                          {plan.buttonText}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full py-4 rounded-2xl text-sm font-bold bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-white/80 dark:border-slate-700 hover:bg-white dark:hover:bg-white/10 transition-colors"
                      >
                        {plan.buttonText}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom note */}
            <div className="mt-12 glass-card rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ShieldCheck size={18} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Enterprise ready</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All plans include access to the localized area database and 24/7 technical support.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Need a custom enterprise solution?{' '}
                <a
                  href="https://wa.me/919773005701?text=Hi, I need a custom enterprise plan."
                  target="_blank"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Let&apos;s talk.
                </a>
              </p>
            </div>
          </>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full py-8 border-t border-white/20 dark:border-slate-800 flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm mt-auto">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">

        </p>
      </footer>
    </div>
  );
}
