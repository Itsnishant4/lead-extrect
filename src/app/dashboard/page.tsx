'use client';

import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getDashboardStatsAction } from '@/app/actions';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Loader2, TrendingUp, Users, Zap, Target, ArrowUpRight,
  CheckCircle, XCircle, Clock, Pause, Play, Mail, Phone, Globe,
  BarChart3, MapPin, Layers, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';



const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  running: { icon: Play, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
  completed: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
  failed: { icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  paused: { icon: Pause, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  pending: { icon: Clock, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
};

export default function DashboardPage() {
  const { user, isLoadingUser } = useAutomation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await getDashboardStatsAction();
      if (!res.success) return null;
      return (res as any).data;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const loading = isLoadingUser || isLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
        <DashboardHeader activePage="dashboard" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-300 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
        <DashboardHeader activePage="dashboard" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to load dashboard data.</p>
        </main>
      </div>
    );
  }

  const creditsPercent = stats.credits.isUnlimited
    ? 100
    : stats.credits.total > 0
      ? Math.min(Math.round((stats.credits.used / stats.credits.total) * 100), 100)
      : 0;

  const creditsRemaining = stats.credits.isUnlimited
    ? null
    : Math.max((stats.credits.total || 0) - stats.credits.used, 0);

  // Fill missing days in leadsPerDay for smooth chart
  const chartData = (() => {
    const map = new Map<string, number>();
    (stats.leadsPerDay || []).forEach((d: any) => map.set(d.date, d.count));
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = format(date, 'yyyy-MM-dd');
      days.push({ date: format(date, 'MMM dd'), searches: map.get(key) || 0 });
    }
    return days;
  })();

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
      <DashboardHeader activePage="dashboard" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="serif-font text-3xl md:text-4xl text-slate-900 dark:text-foreground mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Here&apos;s what&apos;s happening with your lead extraction.
          </p>
        </div>

        {/* Credits + Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Credits Card - spans 2 on mobile */}
          <div className="col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                  <Zap size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Credits</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{stats.credits.planType} Plan</p>
                </div>
              </div>
              <Link href="/subscription" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
                Upgrade <ArrowUpRight size={12} />
              </Link>
            </div>
            {stats.credits.isUnlimited ? (
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-foreground">Unlimited Credits</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-2xl font-bold text-slate-900 dark:text-foreground tabular-nums">
                    {stats.credits.used.toLocaleString()}
                    <span className="text-sm font-medium text-slate-400 dark:text-slate-500"> / {(stats.credits.total || 0).toLocaleString()}</span>
                  </p>
                  <span className="text-xs font-bold text-slate-400">{creditsPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${creditsPercent > 90 ? 'bg-rose-500' : creditsPercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${creditsPercent}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {creditsRemaining?.toLocaleString()} credits remaining
                  {stats.credits.expiresAt && ` · Expires ${formatDistanceToNow(new Date(stats.credits.expiresAt), { addSuffix: true })}`}
                </p>
              </>
            )}
          </div>

          {/* Total Leads */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-foreground tabular-nums">{stats.totalLeads.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Leads</p>
          </div>

          {/* Total Tasks */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
                <Layers size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-foreground tabular-nums">{stats.tasks.total}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tasks</p>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Running', count: stats.tasks.running, key: 'running' },
            { label: 'Pending', count: stats.tasks.pending, key: 'pending' },
            { label: 'Completed', count: stats.tasks.completed, key: 'completed' },
            { label: 'Paused', count: stats.tasks.paused, key: 'paused' },
            { label: 'Failed', count: stats.tasks.failed, key: 'failed' },
          ].map((item) => {
            const config = STATUS_CONFIG[item.key];
            const Icon = config.icon;
            return (
              <div key={item.key} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={14} className={config.color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-foreground tabular-nums leading-none">{item.count}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Searches Over Time - Area Chart */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Search Activity</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last 30 days</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="searches"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#searchGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Contact Stats + Top Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Contact Info Stats */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Contact Data Coverage</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'With Email', value: stats.contactStats.withEmail, icon: Mail, color: 'bg-emerald-500' },
                { label: 'With Phone', value: stats.contactStats.withPhone, icon: Phone, color: 'bg-blue-500' },
                { label: 'With Website', value: stats.contactStats.withWebsite, icon: Globe, color: 'bg-violet-500' },
              ].map((item) => {
                const percent = stats.totalLeads > 0 ? Math.round((item.value / stats.totalLeads) * 100) : 0;
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={12} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-foreground tabular-nums">
                        {item.value.toLocaleString()} <span className="text-slate-400 font-medium">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Categories - Bar Chart */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Top Categories</h3>
            </div>
            {stats.topCategories && stats.topCategories.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topCategories.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-slate-400">No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Cities + Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cities */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Top Cities</h3>
            </div>
            {stats.topCities && stats.topCities.length > 0 ? (
              <div className="space-y-2">
                {stats.topCities.map((city: any, i: number) => {
                  const maxCount = stats.topCities[0].count;
                  const percent = maxCount > 0 ? Math.round((city.count / maxCount) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[60%]">{city.city}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-foreground tabular-nums">{city.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">No data yet</p>
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Recent Tasks</h3>
              </div>
              <Link href="/tasks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {stats.recentTasks && stats.recentTasks.length > 0 ? (
              <div className="space-y-2">
                {stats.recentTasks.map((task: any) => {
                  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                  const Icon = config.icon;
                  const progress = task.totalKeywords > 0
                    ? Math.round(((task.currentKeywordIndex || 0) / task.totalKeywords) * 100)
                    : 0;
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">{task.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {task.totalLeads || 0} leads
                          </span>
                          <span className="text-[10px] text-slate-300 dark:text-slate-600">|</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                          {task.status}
                        </span>
                        {task.status === 'running' && (
                          <p className="text-[10px] text-slate-400 tabular-nums">{progress}%</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400 mb-3">No tasks yet</p>
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Zap size={12} />
                  Start Extracting
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/leads"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/50 dark:hover:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
                <Zap size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-foreground">Leads</p>
                <p className="text-[10px] text-slate-400">Generate & extract</p>
              </div>
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/50 dark:hover:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-foreground">My Tasks</p>
                <p className="text-[10px] text-slate-400">View campaigns</p>
              </div>
            </Link>
            <Link
              href="/lists"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/50 dark:hover:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                <Target size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-foreground">Saved Lists</p>
                <p className="text-[10px] text-slate-400">Manage lists</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-white/20 dark:border-slate-800 flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm mt-auto">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase"></p>
      </footer>
    </div>
  );
}
