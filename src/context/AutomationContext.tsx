'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  getTasksAction,
  getTasksProgressAction,
  createTaskAction,
  createTaskShellAction,
  appendTaskKeywordsAction,
  updateTaskStatusAction,
  deleteTaskAction,
  uploadTaskExportChunkAction,
  getSettingsAction,
  getUserAction,
  triggerTaskAutomationAction,
  updateSettingAction,
  startAllPendingTasksAction
} from '@/app/actions';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Task {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'uploading';
  statusReason: string | null;
  total_keywords: number;
  current_keyword_index: number;
  total_leads: number;
  keywords: string;
  created_at: string;
  updatedAt: string;
}

interface AutomationContextType {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  startNewTask: (name: string, keywords: string[]) => Promise<void>;
  handlePauseTask: (taskId: number) => Promise<void>;
  handleResumeTask: (taskId: number) => Promise<void>;
  handleDeleteTask: (taskId: number) => Promise<{ success: boolean; error?: string }>;
  handleSearch: (e?: React.FormEvent, searchOverride?: string, taskId?: number) => Promise<any>;
  isLoadingTasks: boolean;
  user: any;
  isLoadingUser: boolean;
  isFetchingUser: boolean;
  refreshUser: () => Promise<void>;
  loadedSession: { name: string, niche: string, keywords: string[] } | null;
  loadKeywordSession: (name: string, niche: string, keywords: string[]) => void;
  clearKeywordSession: () => void;
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  startAllPendingTasks: () => Promise<void>;
  refreshTasksNow: () => Promise<void>;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export function AutomationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [loadedSession, setLoadedSession] = useState<{ name: string, niche: string, keywords: string[] } | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({
    exportCityWise: false,
    fastMode: true,
    telegramExportEnabled: true,
  });
  const exportQueueRef = useRef<Promise<void>>(Promise.resolve());
  const exportStateRef = useRef<{ taskId: number | null; buffer: string; chunkIndex: number; taskName: string }>({
    taskId: null,
    buffer: '',
    chunkIndex: 0,
    taskName: '',
  });

  const { data: user, isLoading: isLoadingUser, isFetching: isFetchingUser, refetch: refreshUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await getUserAction();
      if (!res.success) return null;
      return (res as any).data;
    },
    staleTime: 30 * 1000,
  });

  const serverTimeRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);

  const { data: tasks = [], isLoading: isLoadingTasks, refetch: loadTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const prev = queryClient.getQueryData(['tasks']) as Task[] | undefined;
      pollCountRef.current += 1;

      // Full fetch on first load + every 6th tick (catches deletes/new names).
      // Delta ticks use lightweight 7-col progress endpoint, merged in place.
      const needFull = !prev || !serverTimeRef.current || pollCountRef.current % 6 === 0;
      if (needFull) {
        const res = await getTasksAction();
        if (!res.success) return prev ?? [];
        const rows = ((res as any).data || []) as unknown as Task[];
        serverTimeRef.current = Date.now();
        return rows;
      }

      try {
        const res = await getTasksProgressAction(serverTimeRef.current ?? undefined);
        if (!res.success || !(res as any).data) return prev;
        const { rows, serverTime, unchanged } = (res as any).data as {
          rows: any[]; serverTime: number; unchanged: boolean;
        };
        serverTimeRef.current = serverTime;
        if (unchanged || rows.length === 0) return prev;
        const byId = new Map(prev.map((t: any) => [t.id, t]));
        let missing = false;
        for (const r of rows) {
          const cur = byId.get(r.id) as any;
          if (!cur) { missing = true; break; }
          byId.set(r.id, { ...cur, ...r });
        }
        // New task id seen in delta but full row unknown → full refresh next tick.
        if (missing) {
          pollCountRef.current = 5;
          return prev;
        }
        return Array.from(byId.values()) as Task[];
      } catch {
        return prev;
      }
    },
    // Realtime polling: 2s while any task active (meets 1-2s target),
    // 30s idle. Single observer — TasksPage consumes this context instead
    // of mounting a duplicate ['tasks'] query (was 2x calls per tick).
    staleTime: 2_000,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      const data = query.state.data as Task[];
      return (data && data.some(t => t.status === 'running' || t.status === 'pending' || t.status === 'uploading')) ? 2_000 : 30_000;
    },
  });

  const { data: serverSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await getSettingsAction();
      if (!res.success) return { exportCityWise: false, fastMode: true, telegramExportEnabled: true };
      return (res as any).data;
    }
  });

  useEffect(() => {
    if (serverSettings) setSettings(prev => ({ ...prev, ...serverSettings }));
  }, [serverSettings]);

  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await updateSettingAction(key, value);
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };


  const loadTasksAsync = async () => {
    await loadTasks();
  };

  /**
   * Forced full refetch — call after every create/pause/resume/delete.
   * Delta merge cannot see new ids or deletes, so reset its refs and
   * refetch immediately instead of waiting for interval tick.
   */
  const refreshTasksNow = async () => {
    serverTimeRef.current = null;
    pollCountRef.current = 0;
    await await refreshTasksNow();
    await loadTasks();
  };

  const handleSearch = async (e?: React.FormEvent, searchOverride?: string) => {
    e?.preventDefault();
    const finalQuery = searchOverride;
    if (!finalQuery?.trim()) return;

    // Convert legacy search to a one-keyword task
    const taskName = `Search: ${finalQuery.slice(0, 30)}${finalQuery.length > 30 ? '...' : ''}`;
    const res = await createTaskAction(taskName, [finalQuery]);
    if (res.success && 'taskId' in res) {
      const triggerRes = await triggerTaskAutomationAction(Number(res.taskId));
      if (triggerRes.success) {
        toast.success(`Search started for "${finalQuery}"`);
        await refreshTasksNow();
      } else {
        toast.error((triggerRes as any).error || "Failed to start search");
      }
    } else {
      toast.error((res as any).error || "Failed to create search task");
    }
    return res;
  };

  const enqueueExport = (fn: () => Promise<void>) => {
    exportQueueRef.current = exportQueueRef.current.then(fn).catch(() => { });
  };

  const flushTelegramExport = (taskId: number, taskName: string) => {
    if (!settings.fastMode || !settings.telegramExportEnabled) return;
    enqueueExport(async () => {
      const state = exportStateRef.current;
      if (state.taskId !== taskId) return;
      if (state.buffer.length === 0) return;
      await uploadTaskExportChunkAction(taskId, taskName, state.buffer, state.chunkIndex);
      exportStateRef.current.buffer = '';
      exportStateRef.current.chunkIndex += 1;
    });
  };

  const startNewTask = async (name: string, keywords: string[]) => {
    const largeListThreshold = 1000;
    if (keywords.length > largeListThreshold) {
      toast.info("Large keyword list detected. Starting task now and uploading keywords in background.");
      const createRes = await createTaskShellAction(name, keywords.length);
      if (!createRes.success || !(createRes as any).taskId) {
        toast.error((createRes as any).error || "Failed to create task");
        return;
      }

      const taskId = Number((createRes as any).taskId);
      const chunkSize = 2000;

      const uploadKeywordsInBackground = async () => {
        for (let i = 0; i < keywords.length; i += chunkSize) {
          const chunk = keywords.slice(i, i + chunkSize);
          const appendRes = await appendTaskKeywordsAction(taskId, chunk);
          if (!appendRes.success) {
            toast.error((appendRes as any).error || "Keyword upload failed");
            return;
          }
        }
        const triggerRes = await triggerTaskAutomationAction(taskId);
        if (!triggerRes.success) {
          toast.error((triggerRes as any).error || "Failed to start task");
        }
      };

      void uploadKeywordsInBackground();
      toast.success(`Automation task "${name}" started`);
      await refreshTasksNow();
      return;
    }

    const res = await createTaskAction(name, keywords);
    if (res.success && 'taskId' in res) {
      const triggerRes = await triggerTaskAutomationAction(Number(res.taskId));
      if (!triggerRes.success) {
        // Task was created but trigger failed (concurrent limit)
        toast.error((triggerRes as any).error || "Failed to start task");
        await refreshTasksNow();
        return;
      }
      toast.success(`Automation task "${name}" started`);
      await refreshTasksNow();
    } else {
      toast.error((res as any).error || "Failed to create task");
    }
  };

  const handlePauseTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    flushTelegramExport(taskId, task?.name || `Task-${taskId}`);
    await updateTaskStatusAction(taskId, 'paused', undefined, 'Paused by user');
    toast.info("Task paused");
    await refreshTasksNow();
  };

  const handleResumeTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isUnlimited = user?.planType === 'premium' || user?.planType === 'enterprise';
    const bonus = user?.bonusCredits || 0;
    const currentLimit = isUnlimited ? Infinity : bonus;
    const used = user?.leadsExtracted || 0;
    const exhausted = currentLimit !== Infinity && used >= currentLimit;
    if (exhausted) {
      toast.info("Credits exhausted. Task cannot be resumed.");
      return;
    }

    // Check concurrent limit before resuming
    const triggerRes = await triggerTaskAutomationAction(taskId);
    if (!triggerRes.success) {
      toast.error((triggerRes as any).error || "Failed to resume task");
      return;
    }
    toast.success("Task resumed");
    await refreshTasksNow();
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await deleteTaskAction(taskId);
    if (res.success) {
      await refreshTasksNow();
    }
    return res as any;
  };

  const loadKeywordSession = (name: string, niche: string, keywords: string[]) => {
    setLoadedSession({ name, niche, keywords });
  };

  const clearKeywordSession = () => {
    setLoadedSession(null);
  };

  const startAllPendingTasks = async () => {
    const res = await startAllPendingTasksAction();
    if (res.success && (res as any).count && (res as any).count > 0) {
      toast.success(`Auto-started ${(res as any).count} pending tasks`);
      await refreshTasksNow();
    }
  };

  return (
    <AutomationContext.Provider value={{
      tasks,
      loadTasks: loadTasksAsync,
      startNewTask,
      handlePauseTask,
      handleResumeTask,
      handleDeleteTask,
      handleSearch,
      isLoadingTasks,
      user,
      isLoadingUser,
      isFetchingUser,
      refreshUser: async () => { await refreshUser() },
      loadedSession,
      loadKeywordSession,
      clearKeywordSession,
      settings,
      updateSetting,
      startAllPendingTasks,
      refreshTasksNow
    }}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}
