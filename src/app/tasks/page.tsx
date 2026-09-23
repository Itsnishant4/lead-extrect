"use client"

import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAutomation } from '@/context/AutomationContext';
import { deleteTaskAction, updateTaskStatusAction, triggerTaskAutomationAction, getMyPlanFeaturesAction } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Rocket,
  Pause,
  Play,
  Trash2,
  Clock,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { ExportFilters, FilterSettings } from '@/components/ExportFilters';
import type { ExportFormat } from '@/lib/export-utils';
import Lottie from "lottie-react";
import taskanimation from "../../../public/taskloading.json"
export default function TasksPage() {
  const queryClient = useQueryClient();
  // Track which task+action is loading
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const setLoading = (taskId: number, action: string, value: boolean) => {
    setLoadingActions(prev => ({ ...prev, [`${taskId}-${action}`]: value }));
  };
  const isActionLoading = (taskId: number, action: string) => loadingActions[`${taskId}-${action}`] || false;
  const isAnyActionLoading = (taskId: number) => {
    return Object.entries(loadingActions).some(([key, val]) => key.startsWith(`${taskId}-`) && val);
  };

  const { tasks = [], isLoadingTasks: isLoading } = useAutomation();
  // NOTE: no local ['tasks'] useQuery here — AutomationContext owns the single
  // polling observer (2s active / 30s idle). Local duplicate caused 2x server
  // actions per tick per tab.

  // Fetch user's plan features for export permissions
  const { data: planData } = useQuery({
    queryKey: ['my-plan-features'],
    queryFn: async () => {
      const res = await getMyPlanFeaturesAction();
      if (res.success && 'data' in res) return res.data as { planType: string; features: string[] };
      return { planType: 'free', features: ['CSV Export'] };
    },
    staleTime: 60_000,
  });

  const planFeatures = planData?.features || ['CSV Export'];
  const allowedFormats: ExportFormat[] = (['csv', 'json', 'xlsx', 'pdf'] as ExportFormat[]).filter(f => {
    const featureMap: Record<ExportFormat, string> = { csv: 'CSV Export', json: 'JSON Export', xlsx: 'Excel Export', pdf: 'PDF Export' };
    return planFeatures.includes(featureMap[f]);
  }) as ExportFormat[];

  const hasLeadScoring = planFeatures.includes('Lead Scoring');
  const hasEmailVerification = planFeatures.includes('Email Verification');

  // Map plan features to allowed export filters
  const filterFeatureMap: Record<string, string> = {
    hasEmail: 'Filter: Email Required',
    hasPhone: 'Filter: Phone Required',
    hasWebsite: 'Filter: Website Required',
    hasSocials: 'Filter: Socials Required',
    hasRating: 'Filter: Rating Required',
    hasAddress: 'Filter: Address Required',
    hasVerifiedEmail: 'Filter: Verified Email Required',
  };
  const allowedFilters = (Object.keys(filterFeatureMap) as (keyof FilterSettings)[])
    .filter(k => planFeatures.includes(filterFeatureMap[k]));

  const handleStart = async (taskId: number) => {
    setLoading(taskId, 'start', true);
    try {
      const res = await triggerTaskAutomationAction(taskId);
      if (res.success) {
        toast.success('Task started');
      } else {
        toast.error((res as any).error || 'Failed to start task');
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } finally {
      setLoading(taskId, 'start', false);
    }
  };

  const handlePause = async (taskId: number) => {
    setLoading(taskId, 'pause', true);
    try {
      await updateTaskStatusAction(taskId, 'paused', undefined, 'Paused by user');
      toast.info('Task paused');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } finally {
      setLoading(taskId, 'pause', false);
    }
  };

  const handleResume = async (taskId: number) => {
    setLoading(taskId, 'resume', true);
    try {
      const res = await triggerTaskAutomationAction(taskId);
      if (res.success) {
        toast.success('Task resumed');
      } else {
        toast.error((res as any).error || 'Failed to resume task');
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } finally {
      setLoading(taskId, 'resume', false);
    }
  };

  const handleDelete = async (taskId: number) => {
    setLoading(taskId, 'delete', true);
    try {
      const res = await deleteTaskAction(taskId);
      if (res.success) {
        toast.success('Task deleted');
      } else {
        toast.error((res as any).error || 'Failed to delete task');
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } finally {
      setLoading(taskId, 'delete', false);
    }
  };

  const handleExport = async (taskId: number, taskName: string, filters: FilterSettings, format: ExportFormat) => {
    toast.info(`Exporting as ${format.toUpperCase()}...`);
    try {
      const params = new URLSearchParams();
      if (filters.hasEmail) params.append('hasEmail', '1');
      if (filters.hasPhone) params.append('hasPhone', '1');
      if (filters.hasWebsite) params.append('hasWebsite', '1');
      if (filters.hasSocials) params.append('hasSocials', '1');
      if (filters.hasRating) params.append('hasRating', '1');
      if (filters.hasAddress) params.append('hasAddress', '1');
      if (filters.hasVerifiedEmail) params.append('hasVerifiedEmail', '1');
      params.append('format', format);

      const url = `/api/task-export/${taskId}?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error((errData as any).error || 'Export failed or no leads match criteria');
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const ext = format === 'xlsx' ? '.xlsx' : format === 'pdf' ? '.pdf' : format === 'json' ? '.json' : '.csv';
      a.download = `${taskName.replace(/\s+/g, '_')}_leads${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Export complete');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50">
      <DashboardHeader activePage="campaigns" />

      <main className="pt-28 pb-20 max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl serif-font font-bold text-slate-900">Automation Tasks</h1>
            <p className="text-slate-500 mt-1">Monitor and manage your background extraction campaigns.</p>
          </div>
    
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-400 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center  rounded-2xl">
            <Rocket className="h-12 w-12 0 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No tasks found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Start a new automation from the Leads page.</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-5xl mx-auto">
            {tasks.map((task: any) => {
              const anyLoading = isAnyActionLoading(task.id);

              return (
                <Card key={task.id} className="overflow-hidden !rounded-3xl bg-gradient-to-b from-white to-gray-100 !border-none shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-start gap-4 !rounded-2xl">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                        task.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                          task.status === 'running' ? "bg-slate-100 text-indigo-600 " :
                            task.status === 'failed' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {
                          task.status === 'running' ? (
                            <Lottie
                              animationData={taskanimation}
                              loop={true}
                              autoplay={true}
                              className=" h-9 w-9 "
                            />
                          ) : (
                            <Rocket className={cn("h-6 w-6", task.status === 'running' && "animate-pulse")} />
                          )
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{task.name}</h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-1">
                          <Badge variant="secondary" className={cn(
                            "capitalize text-[10px] font-black px-2 py-0.5 rounded-full border-none whitespace-nowrap",
                            task.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" :
                              task.status === 'running' ? "bg-indigo-500/10 text-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.1)]" :
                                task.status === 'failed' ? "bg-rose-500/10 text-rose-600" :
                                  task.status === 'paused' ? "bg-amber-500/10 text-amber-600" :
                                    task.status === 'uploading' ? "bg-blue-500/10 text-blue-600" :
                                      "bg-slate-500/10 text-slate-500"
                          )}>
                            {task.status} {task.totalKeywords > 0 ? `• ${Math.min(100, Math.round((task.currentKeywordIndex / task.totalKeywords) * 100))}%` : ''}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                            <Clock size={12} className="text-slate-300" /> {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, HH:mm') : 'N/A'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                            • {task.totalLeads || 0} Leads Extracted
                          </span>
                        </div>
                        {/* Status Reason */}
                        {task.statusReason && (
                          <div className={cn(
                            "flex items-start gap-1.5 mt-2 text-xs font-medium",
                            task.status === 'failed' ? "text-rose-500" :
                              task.status === 'paused' ? "text-amber-600" :
                                task.status === 'completed' ? "text-emerald-600" :
                                  "text-slate-400"
                          )}>
                            <div className="mt-0.5 shrink-0">
                              {task.status === 'failed' ? <AlertCircle size={12} /> : <Info size={12} />}
                            </div>
                            <span className="break-words">{task.statusReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                      {/* Start button: only show for never-triggered pending tasks (no statusReason of 'Queued') */}
                      {task.status === 'pending' && task.currentKeywordIndex === 0 && !task.statusReason?.startsWith('Queued') && !task.statusReason?.startsWith('Uploading') && task.status !== 'uploading' && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 flex-1 md:flex-none justify-center"
                          onClick={() => handleStart(task.id)}
                          disabled={anyLoading}
                        >
                          {isActionLoading(task.id, 'start') ? (
                            <Loader2 size={14} className="mr-2 animate-spin" />
                          ) : (
                            <Play size={14} className="mr-2" />
                          )}
                          Start
                        </Button>
                      )}
                      {/* Starting... spinner for queued tasks waiting for worker */}
                      {(task.status === 'pending' && (task.statusReason?.startsWith('Queued') || task.statusReason?.startsWith('Uploading'))) || task.status === 'uploading' && (
                        <Button size="sm" variant="outline" disabled className="flex-1 md:flex-none justify-center">
                          <Loader2 size={14} className="mr-2 animate-spin" /> {task.status === 'uploading' ? 'Uploading...' : 'Starting...'}
                        </Button>
                      )}
                      {/* Pending with progress (worker will pick up) */}
                      {task.status === 'pending' && task.currentKeywordIndex > 0 && !task.statusReason?.startsWith('Queued') && !task.statusReason?.startsWith('Uploading') && !task.statusReason?.startsWith('Auto-recovered') && (
                        <Button size="sm" variant="outline" disabled className="flex-1 md:flex-none justify-center">
                          <Loader2 size={14} className="mr-2 animate-spin" /> Starting...
                        </Button>
                      )}
                      {/* Pause button for running tasks */}
                      {task.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 md:flex-none justify-center"
                          onClick={() => handlePause(task.id)}
                          disabled={anyLoading}
                        >
                          {isActionLoading(task.id, 'pause') ? (
                            <Loader2 size={14} className="mr-2 animate-spin" />
                          ) : (
                            <Pause size={14} className="mr-2" />
                          )}
                          Pause
                        </Button>
                      )}
                      {/* Resume button for paused or auto-recovered tasks */}
                      {(task.status === 'paused' || (task.status === 'pending' && task.statusReason?.startsWith('Auto-recovered'))) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 md:flex-none justify-center"
                          onClick={() => handleResume(task.id)}
                          disabled={anyLoading}
                        >
                          {isActionLoading(task.id, 'resume') ? (
                            <Loader2 size={14} className="mr-2 animate-spin" />
                          ) : (
                            <Play size={14} className="mr-2" />
                          )}
                          Resume
                        </Button>
                      )}
                      {/* Export */}
                      <ExportFilters
                        onExport={(filters, format) => handleExport(task.id, task.name, filters, format)}
                        allowedFormats={allowedFormats}
                        allowedFilters={allowedFilters}
                        hasLeadScoring={hasLeadScoring}
                        hasEmailVerification={hasEmailVerification}
                      />
                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-50 flex-1 md:flex-none justify-center"
                        onClick={() => handleDelete(task.id)}
                        disabled={anyLoading}
                      >
                        {isActionLoading(task.id, 'delete') ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span className="ml-2 md:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
