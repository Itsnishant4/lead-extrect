'use client';

import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Loader2, User, Mail, Shield, CalendarDays, CreditCard,
  AlertTriangle, ArrowRight, ShieldCheck, Diamond, Award,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoadingUser: isLoading } = useAutomation();

  const limits: Record<string, number> = { free: 500, pro: 5000, premium: Infinity };
  const baseLimit = limits[user?.planType || 'free'];
  const bonusCredits = (user as any)?.bonusCredits || 0;
  const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits;
  const usagePercent = currentLimit === Infinity ? 0 : Math.min(((user?.leadsExtracted || 0) / currentLimit) * 100, 100);

  const getPlanIcon = () => {
    if (user?.planType === 'premium') return <Diamond size={12} />;
    if (user?.planType === 'pro') return <Award size={12} />;
    return <User size={12} />;
  };

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground"
    >
      <DashboardHeader activePage="search" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-300 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="mb-10">
              <h1 className="serif-font text-3xl md:text-4xl text-slate-900 dark:text-foreground">Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                Manage your account details and subscription usage.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
              {/* ── Left: User card ── */}
              <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-bold ring-4 ring-white/60 dark:ring-slate-800/60 shadow-lg shadow-indigo-100/30 dark:shadow-indigo-950/30 mb-6">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">{user?.name}</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{user?.email}</p>

                {/* Plan badge */}
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${user?.planType === 'premium'
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/50 border-amber-200/50 dark:border-amber-800/50'
                      : user?.planType === 'pro'
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 border-indigo-200/50 dark:border-indigo-800/50'
                        : 'text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50'
                    }`}>
                    {getPlanIcon()}
                    {user?.planType || 'Free'} Plan
                  </span>
                </div>

                {/* Details */}
                <div className="w-full mt-8 space-y-4 text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <User size={18} />
                      Full name
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
                  </div>
                  <div className="h-px bg-white/40 dark:bg-slate-700/40" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <Mail size={18} />
                      Email
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email}</span>
                  </div>
                  <div className="h-px bg-white/40 dark:bg-slate-700/40" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <Shield size={18} />
                      Role
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.is_admin ? 'Administrator' : 'User'}</span>
                  </div>
                  <div className="h-px bg-white/40 dark:bg-slate-700/40" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <CalendarDays size={18} />
                      Joined
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {user?.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Right: Plan & Security ── */}
              <div className="space-y-6">
                {/* Plan card */}
                <div className="glass-card rounded-3xl p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-foreground">
                        <CreditCard size={20} className="text-indigo-500" />
                        Current Plan
                      </h3>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Details about your subscription.</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${user?.planType === 'premium'
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/50 border-amber-200/50 dark:border-amber-800/50'
                        : user?.planType === 'pro'
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 border-indigo-200/50 dark:border-indigo-800/50'
                          : 'text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50'
                      }`}>
                      {user?.planType || 'Free'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Leads extracted</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-foreground mt-1">
                          {user?.leadsExtracted?.toLocaleString() || '0'}
                        </p>
                      </div>
                      {bonusCredits > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Bonus credits</p>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">
                            +{bonusCredits.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Total limit</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-foreground mt-1">
                          {currentLimit === Infinity ? 'Unlimited' : currentLimit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${usagePercent}%`,
                            background: usagePercent > 80
                              ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
                              : 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        <span>{Math.round(usagePercent)}% used</span>
                        <span>
                          {currentLimit === Infinity
                            ? 'Unlimited plan'
                            : `${(currentLimit - (user?.leadsExtracted || 0)).toLocaleString()} remaining`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expiry warning */}
                  {user?.subscription_expiry && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200/50 dark:border-rose-800/50 bg-rose-50/30 dark:bg-rose-950/30 p-4 text-sm text-rose-600 dark:text-rose-400">
                      <AlertTriangle size={18} />
                      <span>
                        Subscription expires on{' '}
                        <b>{format(new Date(user.subscription_expiry), 'MMM dd, yyyy')}</b>
                      </span>
                    </div>
                  )}

                  {/* Change plan button */}
                  <Link
                    href="/subscription"
                    className="mt-6 gradient-button w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-bold text-sm"
                  >
                    Change plan
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Security card */}
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-5">
                    <ShieldCheck size={100} />
                  </div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-foreground">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    Security & Privacy
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">
                    Your extraction data is protected by default.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    LeadSpotter encrypts stored leads and keeps access locked to your account only.
                    All data transmission is secured with TLS encryption.
                  </p>
                </div>
              </div>
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
