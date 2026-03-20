'use client';

import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getPaymentHistoryAction, getPaymentStatsAction } from '@/app/actions';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRef, useCallback, useEffect } from 'react';
import {
  Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Receipt,
  CreditCard, IndianRupee, Hash, CalendarDays, ArrowUpRight,
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
  const { user, isLoadingUser } = useAutomation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const res = await getPaymentStatsAction();
      if (!res.success) return { totalPaid: 0, totalAttempts: 0, successCount: 0, failedCount: 0 };
      return (res as any).data;
    },
    enabled: !!user,
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['payment-history'],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const res = await getPaymentHistoryAction(pageParam, PAGE_SIZE);
      if (!res.success) return { items: [], nextCursor: undefined };
      return (res as any).data as { items: any[]; nextCursor: number | undefined };
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });

  const history = data?.pages.flatMap((page) => page.items) ?? [];

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const loading = isLoadingUser || (isLoading && isLoadingStats);

  const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string; border: string }> = {
    paid: {
      icon: CheckCircle,
      label: 'Successful',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-200 dark:border-amber-800',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-200 dark:border-rose-800',
    },
  };

  const getStatus = (status: string) => statusConfig[status] || statusConfig.pending;

  const totalPaid = stats?.totalPaid ?? 0;
  const totalAttempts = stats?.totalAttempts ?? 0;
  const successCount = stats?.successCount ?? 0;
  const failedCount = stats?.failedCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
      <DashboardHeader activePage="search" />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-300 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading payment history...</p>
          </div>
        ) : (
          <>
            {/* Back + Title */}
            <div className="mb-10">
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                Back to Plans
              </Link>
              <h1 className="serif-font text-3xl md:text-4xl text-slate-900 dark:text-foreground mb-2">Payment History</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                All your payment attempts and transactions in one place.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500   mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-foreground tabular-nums flex items-center gap-1">
                  <IndianRupee size={18} className="text-indigo-500" />
                  {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500   mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-foreground tabular-nums">{totalAttempts}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-emerald-500   mb-1">Successful</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{successCount}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-rose-400   mb-1">Pending / Failed</p>
                <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 tabular-nums">{failedCount}</p>
              </div>
            </div>

            {/* Transaction List */}
            {history.length === 0 && !isLoading ? (
              <div className="glass-card rounded-3xl p-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-300 dark:border-slate-600">
                  <Receipt size={36} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-2">No transactions yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  Your payment history will appear here once you upgrade to a paid plan.
                </p>
                <Link
                  href="/subscription"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-950"
                >
                  View Plans
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((tx: any, index: number) => {
                  const s = getStatus(tx.status);
                  const StatusIcon = s.icon;
                  const isLast = index === history.length - 1;

                  return (
                    <div
                      key={tx.id}
                      ref={isLast ? lastElementRef : undefined}
                      className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg border-l-4 ${s.border}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left: Status + Plan */}
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                            <StatusIcon size={20} className={s.color} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-foreground">
                                {tx.planName || 'Unknown Plan'}
                              </h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.color}`}>
                                <StatusIcon size={10} />
                                {s.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <CalendarDays size={12} />
                                {tx.createdAt ? format(new Date(tx.createdAt), 'MMM dd, yyyy - hh:mm a') : 'N/A'}
                              </span>
                              {tx.planPeriod && (
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                  {tx.planPeriod === 'month' ? 'Monthly' : 'One-Time'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount + Details */}
                        <div className="flex items-center gap-6 md:text-right ml-14 md:ml-0">
                          <div className="space-y-1">
                            <p className="text-xl font-bold text-slate-900 dark:text-foreground tabular-nums flex items-center gap-0.5">
                              <IndianRupee size={14} className="text-slate-400" />
                              {parseFloat(tx.amount || '0').toLocaleString('en-IN')}
                            </p>
                            {tx.planCredits && (
                              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                +{tx.planCredits.toLocaleString()} credits
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Order ID + UTR */}
                      <div className="flex items-center gap-4 mt-3 ml-14 flex-wrap">
                        {tx.gatewayOrderId && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                            <Hash size={11} />
                            {tx.gatewayOrderId}
                          </span>
                        )}
                        {tx.utr && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                            <CreditCard size={11} />
                            UTR: {tx.utr}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Infinite scroll loading indicator */}
                {isFetchingNextPage && (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <Loader2 size={24} className="text-indigo-400 animate-spin" />
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Loading more transactions...</p>
                  </div>
                )}

                {/* End of list indicator */}
                {!hasNextPage && history.length > 0 && (
                  <div className="py-6 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                      You&apos;ve reached the end of your transaction history.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full py-8 border-t border-white/20 dark:border-slate-800 flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm mt-auto">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase"></p>
      </footer>
    </div>
  );
}
