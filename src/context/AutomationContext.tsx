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
  sendTaskExportToTelegramAction,
  getLeadsAction,
  getSettingsAction,
  updateSettingAction,
  getUserAction
} from '@/app/actions';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Task {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  total_keywords: number;
  current_keyword_index: number;
  total_leads: number;
  keywords: string;
  created_at: string;
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
  refreshUser: () => Promise<void>;
  loadedSession: { name: string, niche: string, keywords: string[] } | null;
  loadKeywordSession: (name: string, niche: string, keywords: string[]) => void;
  clearKeywordSession: () => void;
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
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
  const isRunningTask = useRef(false);
  const exportQueueRef = useRef<Promise<void>>(Promise.resolve());
  const exportStateRef = useRef<{ taskId: number | null; buffer: string; chunkIndex: number; taskName: string }>({
    taskId: null,
    buffer: '',
    chunkIndex: 0,
    taskName: '',
  });
  const exportSeenRef = useRef<Set<string>>(new Set());
  const taskLeadCountsRef = useRef<Map<number, number>>(new Map());

  // User Query
  const { data: user, isLoading: isLoadingUser, refetch: refreshUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await getUserAction();
      if (!res.success) return null;
      return res.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Tasks Query
  const { data: tasks = [], isLoading: isLoadingTasks, refetch: loadTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasksAction();
      if (!res.success) return [];
      return (res.data || []) as unknown as Task[];
    },
    refetchInterval: isRunningTask.current ? 3000 : 15000, // Poll faster if running
  });

  // Settings Query
  const { data: serverSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await getSettingsAction();
      if (!res.success) return { exportCityWise: false, fastMode: true, telegramExportEnabled: true };
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }
  } as any);

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

  const serializeLeads = (leads: any[]) => {
    const headers = [
      'Name', 'Category', 'City', 'Rating', 'Reviews', 'Phone', 'Website Phone', 
      'Email', 'Website Email', 'Website', 'Address', 'DirectionUrl', 
      'Latitude', 'Longitude', 'Monday Hours', 'Tuesday Hours', 'Wednesday Hours', 
      'Thursday Hours', 'Friday Hours', 'Saturday Hours', 'Sunday Hours',
      'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Pinterest', 'TikTok'
    ];
    const rows = leads.map((l: any) => [
      l.name, l.category, l.city, l.rating, l.reviewsCount ?? l.reviews_count, l.phone, l.website_phone,
      l.email, l.website_email, l.website, l.address, l.directionUrl ?? l.direction_url,
      l.latitude, l.longitude, l.monday_hours, l.tuesday_hours, l.wednesday_hours,
      l.thursday_hours, l.friday_hours, l.saturday_hours, l.sunday_hours,
      l.facebook, l.instagram, l.linkedin, l.twitter, l.youtube, l.pinterest, l.tiktok
    ]);
    const csvRows = rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
    return { headers, csvRows };
  };

  const enqueueExport = (fn: () => Promise<void>) => {
    exportQueueRef.current = exportQueueRef.current.then(fn).catch(() => {});
  };

  const handleFastModeLeads = (taskId: number, taskName: string, leads: any[]) => {
    if (!settings.fastMode || leads.length === 0) return;
    enqueueExport(async () => {
      const state = exportStateRef.current;
      if (state.taskId !== taskId) {
        exportStateRef.current = { taskId, buffer: '', chunkIndex: 0, taskName };
        exportSeenRef.current = new Set();
        taskLeadCountsRef.current.set(taskId, 0);
      }

      const dedupedLeads = leads.filter((lead) => {
        const key = lead.placeId || lead.place_id;
        if (!key) return true;
        if (exportSeenRef.current.has(key)) return false;
        exportSeenRef.current.add(key);
        return true;
      });

      if (dedupedLeads.length === 0) {
        return;
      }

      const prevCount = taskLeadCountsRef.current.get(taskId) || 0;
      const nextCount = prevCount + dedupedLeads.length;
      taskLeadCountsRef.current.set(taskId, nextCount);
      await updateTaskLeadCountAction(taskId, nextCount);
      loadTasks();

      if (!settings.telegramExportEnabled) {
        return;
      }

      const { headers, csvRows } = serializeLeads(dedupedLeads);
      const includeHeader = exportStateRef.current.chunkIndex === 0 && exportStateRef.current.buffer.length === 0;
      const prefix = includeHeader ? `${headers.join(',')}\n` : '';
      exportStateRef.current.buffer += prefix + csvRows.join('\n') + '\n';

      const maxBytes = 4 * 1024 * 1024;
      const bufferBytes = new Blob([exportStateRef.current.buffer]).size;
      if (bufferBytes >= maxBytes) {
        await uploadTaskExportChunkAction(
          taskId,
          exportStateRef.current.taskName,
          exportStateRef.current.buffer,
          exportStateRef.current.chunkIndex
        );
        exportStateRef.current.buffer = '';
        exportStateRef.current.chunkIndex += 1;
      }
    });
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

  const runTaskAutomation = async (taskId: number, keywords: string[], startIndexOverride?: number) => {
    if (isRunningTask.current) return;
    isRunningTask.current = true;
    
    await updateTaskStatusAction(taskId, 'running');
    await loadTasks();

    const taskRes = await getTasksAction();
    const taskObj = ((taskRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
    const startIndex = (startIndexOverride ?? taskObj?.current_keyword_index) || 0;
    const taskName = taskObj?.name || `Task-${taskId}`;
    const total = keywords.length;
    const concurrency = 3;
    let nextIndex = startIndex;
    let completed = startIndex;
    let inFlight = 0;
    let stopped = false;

    const processKeyword = async (keyword: string, index: number) => {
      const checkRes = await getTasksAction();
      const currentTask = ((checkRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
      if (!currentTask || currentTask.status === 'paused') {
        stopped = true;
        return;
      }

      const extractionRes = await handleSearch(undefined, keyword, taskId);
      const leads = (extractionRes as any)?.leads;
      if (leads && leads.length) {
        handleFastModeLeads(taskId, taskName, leads);
      }

      if (extractionRes?.limitReached) {
        stopped = true;
        await updateTaskStatusAction(taskId, 'paused', completed);
        toast.info("Credits exhausted. Task paused.", {
          description: "Add credits or upgrade to resume this campaign."
        });
        flushTelegramExport(taskId, taskName);
        return;
      }
      
      if (!(extractionRes && extractionRes.success) && extractionRes) {
        toast.error(`[${index + 1}/${total}] Failed: ${keyword}`, {
          description: extractionRes.error
        });
      }

      if (extractionRes?.success) {
        completed += 1;
        await updateTaskStatusAction(taskId, 'running', completed);
        loadTasks();
      }
    };

    const launchNext = () => {
      while (!stopped && inFlight < concurrency && nextIndex < total) {
        const idx = nextIndex;
        const keyword = keywords[idx];
        nextIndex += 1;
        inFlight += 1;
        processKeyword(keyword, idx)
          .catch(() => {})
          .finally(() => {
            inFlight -= 1;
            if (!stopped) {
              launchNext();
            }
            if (nextIndex >= total && inFlight === 0 && !stopped) {
              updateTaskStatusAction(taskId, 'completed', total).then(() => {
                flushTelegramExport(taskId, taskName);
                isRunningTask.current = false;
                loadTasks();
              });
            }
            if (stopped) {
              isRunningTask.current = false;
              loadTasks();
            }
          });
      }
    };

    launchNext();
  };

  const startNewTask = async (name: string, keywords: string[]) => {
    const largeListThreshold = 1000;
    if (keywords.length > largeListThreshold) {
      toast.info("Large keyword list detected. Starting task now and uploading keywords in background.");
      const createRes = await createTaskShellAction(name, keywords.length);
      if (!createRes.success || !createRes.taskId) {
        toast.error(`Failed to create task: ${createRes.error}`);
        return;
      }

      const taskId = Number(createRes.taskId);
      const chunkSize = 2000;

      const uploadKeywordsInBackground = async () => {
        for (let i = 0; i < keywords.length; i += chunkSize) {
          const chunk = keywords.slice(i, i + chunkSize);
          const appendRes = await appendTaskKeywordsAction(taskId, chunk);
          if (!appendRes.success) {
            toast.error(`Keyword upload paused: ${appendRes.error}`);
            return;
          }
        }
      };

      void uploadKeywordsInBackground();

      toast.success(`Automation task "${name}" started`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      runTaskAutomation(taskId, keywords);
      return;
    }

    const res = await createTaskAction(name, keywords);
    if (res.success && res.taskId) {
      toast.success(`Automation task "${name}" started`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      runTaskAutomation(Number(res.taskId), keywords);
    } else {
      toast.error(`Failed to create task: ${res.error}`);
    }
  };

  const handlePauseTask = async (taskId: number) => {
    await updateTaskStatusAction(taskId, 'paused');
    toast.info("Task paused");
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleResumeTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const limits: Record<string, number> = {
      free: 500,
      pro: 5000,
      premium: Infinity
    };
    const baseLimit = limits[user?.plan_type || 'free'] ?? 500;
    const bonus = (user as any)?.bonus_credits || 0;
    const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonus;
    const used = user?.leads_extracted || 0;
    const exhausted = currentLimit !== Infinity && used >= currentLimit;
    if (exhausted) {
      toast.info("Credits exhausted. Task cannot be resumed.", {
        description: "Add credits or upgrade to continue this campaign."
      });
      return;
    }
    
    await updateTaskStatusAction(taskId, 'running');
    toast.success("Task resumed");
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    
    if (!isRunningTask.current) {
        const keywords = JSON.parse(task.keywords);
        runTaskAutomation(taskId, keywords, task.current_keyword_index || 0);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await deleteTaskAction(taskId);
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
    return res;
  };

  // Auto-resume on start
  useEffect(() => {
    if (tasks.length > 0 && !isRunningTask.current) {
      const runningTask = tasks.find(t => t.status === 'running');
      if (runningTask) {
        toast.info(`Resuming task: ${runningTask.name}`);
        runTaskAutomation(runningTask.id, JSON.parse(runningTask.keywords), runningTask.current_keyword_index || 0);
      }
    }
  }, [tasks.length]);

  const loadKeywordSession = (name: string, niche: string, keywords: string[]) => {
    setLoadedSession({ name, niche, keywords });
  };

  const clearKeywordSession = () => {
    setLoadedSession(null);
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
        refreshUser: async () => { await refreshUser() },
        loadedSession,
        loadKeywordSession,
        clearKeywordSession,
        settings,
        updateSetting
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
