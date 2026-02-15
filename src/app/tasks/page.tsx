'use client';

import React, { useEffect, useState } from 'react';
import { useAutomation } from '@/context/AutomationContext';
import Link from 'next/link';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ExportFilters, FilterSettings } from '@/components/ExportFilters';
import { getTaskLeadsAction } from '@/app/actions';
import { DashboardHeader } from '@/components/DashboardHeader';
import {
  Plus, Rocket, AlertTriangle, Check, PauseCircle, AlertCircle,
  Clock, Pause, Play, Trash2, RefreshCw,
  Zap, Target, Flame, Send, Compass, Sparkles, Radio, Globe,
} from 'lucide-react';

const CAMPAIGN_ICONS = [Rocket, Zap, Target, Flame, Send, Compass, Sparkles, Radio, Globe];

interface Lead {
  id: number;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviews_count: number;
  phone: string;
  website_phone: string;
  email: string;
  website_email: string;
  website: string;
  address: string;
  direction_url: string;
  latitude: string;
  longitude: string;
  monday_hours: string;
  tuesday_hours: string;
  wednesday_hours: string;
  thursday_hours: string;
  friday_hours: string;
  saturday_hours: string;
  sunday_hours: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  pinterest: string;
  tiktok: string;
}

export default function TasksPage() {
  const {
    tasks,
    handlePauseTask,
    handleResumeTask,
    handleDeleteTask,
    user,
    isLoadingTasks,
    startAllPendingTasks,
    settings,
  } = useAutomation();

  useEffect(() => {
    startAllPendingTasks();
  }, []);

  /* ── Credits ── */
  const limits: Record<string, number> = { free: 500, pro: 5000, premium: Infinity };
  const baseLimit = limits[user?.plan_type || 'free'] ?? 500;
  const bonus = user?.bonus_credits || 0;
  const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonus;
  const used = user?.leads_extracted || 0;
  const creditsExhausted = currentLimit !== Infinity && used >= currentLimit;

  /* ── State ── */
  const [deletingTasks, setDeletingTasks] = useState<Set<number>>(new Set());
  const [exportProgressMap, setExportProgressMap] = useState<Record<number, number>>({});

  /* ── CSV download (full logic from TasksList) ── */
  const downloadTaskCSV = async (taskId: number, taskName: string, filters: FilterSettings) => {
    if (settings.fastMode) {
      const params = new URLSearchParams();
      if (filters.hasEmail) params.set('hasEmail', '1');
      if (filters.hasPhone) params.set('hasPhone', '1');
      if (filters.hasWebsite) params.set('hasWebsite', '1');
      if (filters.hasSocials) params.set('hasSocials', '1');
      if (filters.hasRating) params.set('hasRating', '1');
      if (filters.hasAddress) params.set('hasAddress', '1');
      const query = params.toString();
      const url = query ? `/api/task-export/${taskId}?${query}` : `/api/task-export/${taskId}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to download export');
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${taskName.replace(/\s+/g, '_')}_export.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      return;
    }

    const CHUNK_SIZE = 1000;
    const task = tasks.find((t) => t.id === taskId);
    const totalLeads = task?.total_leads || 0;
    let leads: Lead[] = [];

    try {
      if (totalLeads > 0) {
        setExportProgressMap((prev) => ({ ...prev, [taskId]: 0 }));
        let offset = 0;
        while (offset < totalLeads + CHUNK_SIZE) {
          const progress = Math.min(Math.round((offset / totalLeads) * 100), 99);
          setExportProgressMap((prev) => ({ ...prev, [taskId]: progress }));
          const res = await getTaskLeadsAction(taskId, CHUNK_SIZE, offset);
          if (!res.success || !res.data || res.data.length === 0) break;
          leads = [...leads, ...(res.data as unknown as Lead[])];
          offset += CHUNK_SIZE;
          if (res.data.length < CHUNK_SIZE) break;
        }
      } else {
        const res = await getTaskLeadsAction(taskId);
        if (res.success && res.data) leads = res.data as unknown as Lead[];
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
      setExportProgressMap((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      return;
    } finally {
      setExportProgressMap((prev) => ({ ...prev, [taskId]: 100 }));
      setTimeout(() => {
        setExportProgressMap((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }, 2000);
    }

    let filteredLeads = [...leads];
    if (filters.hasEmail) filteredLeads = filteredLeads.filter((l) => l.email || l.website_email);
    if (filters.hasPhone) filteredLeads = filteredLeads.filter((l) => l.phone || l.website_phone);
    if (filters.hasWebsite) filteredLeads = filteredLeads.filter((l) => l.website && l.website.startsWith('http'));
    if (filters.hasSocials) filteredLeads = filteredLeads.filter((l) => l.facebook || l.instagram || l.linkedin || l.twitter || l.youtube || l.pinterest || l.tiktok);
    if (filters.hasRating) filteredLeads = filteredLeads.filter((l) => l.rating && l.rating > 0);
    if (filters.hasAddress) filteredLeads = filteredLeads.filter((l) => l.address && l.address.length > 5);

    if (filteredLeads.length === 0) {
      toast.error('No leads match the selected filters');
      return;
    }

    const headers = [
      'Name', 'Category', 'City', 'Rating', 'Reviews', 'Phone', 'Website Phone',
      'Email', 'Website Email', 'Website', 'Address', 'DirectionUrl',
      'Latitude', 'Longitude', 'Monday Hours', 'Tuesday Hours', 'Wednesday Hours',
      'Thursday Hours', 'Friday Hours', 'Saturday Hours', 'Sunday Hours',
      'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Pinterest', 'TikTok',
    ];
    const rows = filteredLeads.map((l: any) => [
      l.name, l.category, l.city, l.rating, l.reviews_count, l.phone, l.website_phone,
      l.email, l.website_email, l.website, l.address, l.direction_url,
      l.latitude, l.longitude, l.monday_hours, l.tuesday_hours, l.wednesday_hours,
      l.thursday_hours, l.friday_hours, l.saturday_hours, l.sunday_hours,
      l.facebook, l.instagram, l.linkedin, l.twitter, l.youtube, l.pinterest, l.tiktok,
    ]);

    if (settings.exportCityWise) {
      const cityGroups: Record<string, any[][]> = {};
      rows.forEach((row) => {
        const city = row[2] || 'Unknown';
        if (!cityGroups[city]) cityGroups[city] = [];
        cityGroups[city].push(row);
      });
      Object.entries(cityGroups).forEach(([city, cityRows], index) => {
        const cityCsv = [headers, ...cityRows]
          .map((e) => e.map(String).map((s) => `"${s.replace(/"/g, '""')}"`).join(','))
          .join('\n');
        const blob = new Blob([cityCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${taskName.replace(/\s+/g, '_')}_${city.replace(/\s+/g, '_')}_leads.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        setTimeout(() => { link.click(); document.body.removeChild(link); }, index * 200);
      });
      toast.success(`Exporting ${Object.keys(cityGroups).length} city-wise CSV files...`);
    } else {
      const csvContent = [headers, ...rows]
        .map((e) => e.map(String).map((s) => `"${s.replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `task_${taskName.replace(/\s+/g, '_')}_leads.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${taskName} leads exported (${filteredLeads.length} leads)`);
    }
  };

  /* ── Status badge (Stitch-exact) ── */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-800/50">
            <Check size={12} className="font-black" />
            Completed
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
            <PauseCircle size={12} />
            {creditsExhausted ? 'Credits Out' : 'Paused'}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-rose-100/50 dark:border-rose-800/50">
            <AlertCircle size={12} />
            Failed
          </span>
        );
      default: // pending
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-100/50 dark:border-amber-800/50">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  /* ── Render ── */
  return (
    <div
      className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground"
    >
      {/* ─── HEADER ─── */}
      <DashboardHeader activePage="campaigns" />

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-12 pt-28">
        <div className="w-full max-w-4xl">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="serif-font text-3xl md:text-4xl text-slate-900 dark:text-foreground">Campaigns</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                Manage your automated lead extraction tasks.
              </p>
            </div>
            <Link
              href="/keywords"
              className="gradient-button flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl text-sm font-bold text-white w-full sm:w-auto"
            >
              <Plus size={14} />
              New Campaign
            </Link>
          </div>

          {/* Credits exhausted */}
          {creditsExhausted && (
            <div className="glass-card rounded-2xl p-5 mb-6 border-rose-200/20 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/40">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-rose-500" />
                <div>
                  <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Credits exhausted</h3>
                  <p className="text-rose-600/80 dark:text-rose-400/80 text-xs">Upgrade your plan to continue running campaigns.</p>
                </div>
              </div>
            </div>
          )}

          {/* Content states */}
          {isLoadingTasks ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <LoadingSpinner />
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading campaigns...</p>
            </div>
          ) : tasks.length === 0 ? (
            /* ── Empty state ── */
            <div className="glass-card rounded-2xl p-8 md:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-300 dark:text-indigo-600 mx-auto mb-6 ring-1 ring-indigo-100/30 dark:ring-indigo-800/30">
                <Rocket size={30} />
              </div>
              <h3 className="serif-font text-2xl text-indigo-950 dark:text-indigo-100 mb-3">No campaigns yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">
                Generate keywords to launch your first automated lead extraction campaign.
              </p>
              <Link
                href="/keywords"
                className="gradient-button inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white"
              >
                <Plus size={14} />
                Create your first campaign
              </Link>
            </div>
          ) : (
            /* ── Campaign cards ── */
            <div className="space-y-4">
              {tasks.map((task, index) => {
                const isRunning = task.status === 'running';
                const progress = task.total_keywords > 0
                  ? Math.round((task.current_keyword_index / task.total_keywords) * 100)
                  : 0;
                const CampaignIcon = CAMPAIGN_ICONS[index % CAMPAIGN_ICONS.length];

                return (
                  <div
                    key={task.id}
                    className="glass-card !bg-gradient-to-b !from-white !to-gray-900/02 dark:!from-white/5 dark:!to-white/[0.01] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between group transition-all"
                  >
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                      {isRunning ? (
                        <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 bg-indigo-50/50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100/50 dark:ring-indigo-800/50 shadow-inner">
                          <CampaignIcon size={24} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 bg-white/40 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 ring-1 ring-white/50 dark:ring-slate-700/50">
                          <CampaignIcon size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-foreground text-[15px] sm:text-[17px] truncate">{task.name}</h3>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap">
                          {getStatusBadge(task.status)}
                          {isRunning && progress > 0 && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">/</span>
                              <span className="text-[12px] text-indigo-600 dark:text-indigo-400 font-semibold">{progress}%</span>
                            </>
                          )}
                          <span className="text-slate-300 dark:text-slate-600">/</span>
                          <span className="text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                            {task.total_leads.toLocaleString()} Leads
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
                          <span className="text-[12px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 shrink-0 self-end sm:self-auto">
                      {/* Pause / Resume / Refresh */}
                      {task.status === 'running' ? (
                        <button
                          onClick={() => handlePauseTask(task.id)}
                          className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-white/50 dark:hover:border-slate-700"
                        >
                          <Pause size={20} />
                        </button>
                      ) : task.status === 'paused' || task.status === 'pending' ? (
                        <button
                          onClick={() => handleResumeTask(task.id)}
                          className="w-11 h-11 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-white/60 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-white/50 dark:hover:border-slate-700"
                        >
                          <Play size={20} />
                        </button>
                      ) : null}

                      {/* Export */}
                      <ExportFilters
                        onExport={(f) => downloadTaskCSV(task.id, task.name, f)}
                        disabled={task.total_leads === 0}
                        progress={exportProgressMap[task.id]}
                      />

                      {/* Delete */}
                      <button
                        disabled={deletingTasks.has(task.id)}
                        onClick={async () => {
                          if (window.confirm('Delete this campaign? All associated leads will be removed.')) {
                            setDeletingTasks((prev) => {
                              const next = new Set(prev);
                              next.add(task.id);
                              return next;
                            });
                            try {
                              const res = await handleDeleteTask(task.id);
                              if (res.success) toast.success('Campaign deleted');
                              else toast.error(`Failed: ${res.error}`);
                            } finally {
                              setDeletingTasks((prev) => {
                                const next = new Set(prev);
                                next.delete(task.id);
                                return next;
                              });
                            }
                          }
                        }}
                        className="w-8 h-8 px-2 py-2  flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/50 hover:text-rose-500 dark:hover:text-rose-400 transition-colors border border-transparent hover:border-rose-100/50 dark:hover:border-rose-800/50 disabled:opacity-40"
                      >
                        {deletingTasks.has(task.id) ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

    
    </div>
  );
}
