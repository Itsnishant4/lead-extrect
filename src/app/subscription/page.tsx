'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getPlansAction, createCheckoutSessionAction, checkOrderStatusAction } from '@/app/actions';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Check, CheckCircle, Zap, ShieldCheck, X, MessageCircle,
  User, Award, Diamond, Receipt,
} from 'lucide-react';
import { PTMCheckout } from '@/lib/sdk/PTMCheckout';

export default function SubscriptionPage() {
  const { user, isLoadingUser: isLoading, refreshUser } = useAutomation();
  const [isCheckingOut, setIsCheckingOut] = useState<number | null>(null);

  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      const res = await getPlansAction();
      if (!res.success) return [];
      return (res as any).data || [];
    },
  });


  const handleCheckout = async (plan: any) => {
    // Custom plan -> redirect to WhatsApp
    if (plan.period === 'custom') {
      const url = plan.whatsappUrl || 'https://wa.me/919773005701?text=Hi, I am interested in the Enterprise plan.';
      window.open(url, '_blank');
      return;
    }

    // Free plan -> already on it
    if (plan.period === 'free') {
      toast.info('You are already on the free plan!');
      return;
    }

    // Paid plan -> checkout
    setIsCheckingOut(plan.id);
    try {
      const res = await createCheckoutSessionAction(plan.id);
      if (res.success && (res as any).data?.paymentUrl) {
        const origin = window.location.origin;
        const paymentUrlWithOrigin = (res as any).data.paymentUrl + `&origin=${encodeURIComponent(origin)}`;

        const gateway = new PTMCheckout({
          payment_url: paymentUrlWithOrigin,
          order_id: (res as any).data.orderId,
          gateway_origin: 'https://ptm-phi.vercel.app',
          checkStatus: async (orderId) => {
            const statusRes = await checkOrderStatusAction(orderId);
            return statusRes.success ? (statusRes as any).status : 'pending';
          },
          onSuccess: () => {
            toast.success('Payment successful! Your plan has been activated.');
            refreshUser();
            setIsCheckingOut(null);
          },
          onFailure: (err) => {
            toast.error(err?.message || 'Payment failed');
            setIsCheckingOut(null);
          },
          onClose: () => {
            setIsCheckingOut(null);
          }
        });

        gateway.open();
      } else {
        const errorMsg = (res as any).error;
        if (errorMsg === 'Unauthorized') {
          toast.error('Please log in to subscribe to a plan');
          window.location.href = '/login?redirect=/subscription';
        } else {
          toast.error(errorMsg || 'Failed to create checkout session');
        }
        setIsCheckingOut(null);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsCheckingOut(null);
    }
  };

  const usedLeads = user?.leadsExtracted || 0;
  const bonusCredits = user?.bonusCredits || 0;
  const isUnlimited = user?.planType === 'premium' || user?.planType === 'enterprise';
  const limit = isUnlimited ? Infinity : bonusCredits;
  const remaining = limit === Infinity ? Infinity : Math.max(limit - usedLeads, 0);
  const usagePercent = limit === Infinity ? 0 : Math.min((usedLeads / limit) * 100, 100);

  const pageLoading = isLoading || isLoadingPlans;

  // Pick icon based on plan index/type
  const planIcons = [User, Award, Diamond, Zap, Zap];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
      <DashboardHeader activePage="search" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {pageLoading ? (
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
                <div className="flex-1 relative max-w-md w-full">
                  
                  <div className="h-2.5 mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

                  <Link
                    href="/payment/history"
                    className="inline-flex w-full mt-3 justify-end items-center gap-1.5  text-xs font-semibold  hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Receipt size={14} className='text-indigo-600 dark:text-indigo-400'/>
                    Payment History
                  </Link>
                  
                </div>
              </div>
            )}

            {/* Plan cards */}
            {plans.length > 0 ? (
              <div className={`grid grid-cols-1 gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : ''}`}>
                {plans.map((plan: any, index: number) => {
                  const isPlanExpired = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) < new Date() : false;
                  const isCurrent = plan.period === 'month' 
                    ? (user?.planType?.toLowerCase() === plan.name?.toLowerCase() && !isPlanExpired)
                    : plan.period === 'free'
                      ? (user?.planType === 'free' || !user?.planType)
                      : false;
                      
                  const hasBadge = !!plan.badge;
                  const isHighlight = hasBadge && !isCurrent;
                  const isFree = plan.period === 'free';
                  const isCustom = plan.period === 'custom';
                  const Icon = planIcons[index] || Zap;

                  return (
                    <div
                      key={plan.id}
                      className={`relative glass-card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:translate-y-[-4px] ${
                        isHighlight ? 'ring-2 ring-indigo-400/50 shadow-xl shadow-indigo-100/40' : ''
                      } ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
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

                      {/* Current indicator (only if no badge) */}
                      {isCurrent && !hasBadge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                            Current
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
                              {plan.discount > 0 && plan.discount > plan.price && (
                                <span className="text-lg text-slate-400 dark:text-slate-500 line-through font-medium">₹{plan.discount?.toLocaleString()}</span>
                              )}
                            </div>
                            {plan.discount > 0 && plan.discount > plan.price && (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {Math.round(((plan.discount - plan.price) / plan.discount) * 100)}% off
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
                      <div className={`mb-4 px-3 py-2 rounded-xl ${
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
                      ) : isCustom ? (
                        <button
                          onClick={() => handleCheckout(plan)}
                          className="w-full py-4 rounded-2xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100 dark:shadow-violet-950"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <MessageCircle size={14} />
                            Contact Sales
                          </span>
                        </button>
                      ) : isFree ? (
                        <button
                          disabled
                          className="w-full py-4 rounded-2xl text-sm font-bold bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50 cursor-not-allowed"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Check size={14} />
                            Free Forever
                          </span>
                        </button>
                      ) : isHighlight ? (
                        <button
                          onClick={() => handleCheckout(plan)}
                          disabled={isCheckingOut === plan.id}
                          className="w-full gradient-button text-white py-4 rounded-2xl font-bold text-sm shadow-lg disabled:opacity-70"
                        >
                          <span className="flex items-center justify-center gap-2">
                            {isCheckingOut === plan.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Zap size={14} />
                            )}
                            {isCheckingOut === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckout(plan)}
                          disabled={isCheckingOut === plan.id}
                          className="w-full py-4 rounded-2xl text-sm font-bold bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-white/80 dark:border-slate-700 hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-70"
                        >
                          <span className="flex items-center justify-center gap-2">
                            {isCheckingOut === plan.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            {isCheckingOut === plan.id ? 'Processing...' : `Get ${plan.name}`}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 dark:text-slate-500 text-sm">No plans available yet. Check back soon.</p>
              </div>
            )}

            {/* Bottom note */}
            <div className="mt-12 glass-card rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ShieldCheck size={18} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Secure Payments</span>
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


      <footer className="w-full py-8 border-t border-white/20 dark:border-slate-800 flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm mt-auto">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase"></p>
      </footer>
    </div>
  );
}
