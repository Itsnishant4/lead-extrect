'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  getTasksAction,
  createTaskAction,
  createTaskShellAction,
  appendTaskKeywordsAction,
  updateTaskStatusAction,
  updateTaskLeadCountAction,
  deleteTaskAction,
  searchLeadsAction,
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
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
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

  const { data: tasks = [], isLoading: isLoadingTasks, refetch: loadTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasksAction();
      if (!res.success) return [];
      return ((res as any).data || []) as unknown as Task[];
    },
    refetchInterval: (query) => {
      const data = query.state.data as Task[];
      // Polling every 4 seconds when tasks are running, 15 seconds otherwise
      return (data && data.some(t => t.status === 'running' || t.status === 'pending')) ? 4000 : 15000;
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

  const handleSearch = async (e?: React.FormEvent, searchOverride?: string, taskId?: number) => {
    e?.preventDefault();
    const finalQuery = searchOverride;
    if (!finalQuery?.trim()) return;

    const res = await searchLeadsAction(finalQuery, taskId);
    if (res.success) {
      refreshUser();
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      return;
    }

    const res = await createTaskAction(name, keywords);
    if (res.success && 'taskId' in res) {
      const triggerRes = await triggerTaskAutomationAction(Number(res.taskId));
      if (!triggerRes.success) {
        // Task was created but trigger failed (concurrent limit)
        toast.error((triggerRes as any).error || "Failed to start task");
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        return;
      }
      toast.success(`Automation task "${name}" started`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } else {
      toast.error((res as any).error || "Failed to create task");
    }
  };

  const handlePauseTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    flushTelegramExport(taskId, task?.name || `Task-${taskId}`);
    await updateTaskStatusAction(taskId, 'paused', undefined, 'Paused by user');
    toast.info("Task paused");
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleResumeTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isUnlimited = user?.planType === 'premium' || user?.planType === 'enterprise';
    const bonus = user?.bonusCredits || 0;
    const currentLimit = isUnlimited ? Infinity : 500 + bonus;
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
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await deleteTaskAction(taskId);
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      startAllPendingTasks
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
