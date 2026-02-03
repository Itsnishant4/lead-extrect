'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  getTasksAction, 
  createTaskAction, 
  updateTaskStatusAction, 
  deleteTaskAction, 
  searchLeadsAction,
  getLeadsAction,
  getSettingsAction,
  updateSettingAction
} from '@/app/actions';
import { toast } from 'sonner';

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
  loadedSession: { name: string, niche: string, keywords: string[] } | null;
  loadKeywordSession: (name: string, niche: string, keywords: string[]) => void;
  clearKeywordSession: () => void;
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export function AutomationProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [loadedSession, setLoadedSession] = useState<{ name: string, niche: string, keywords: string[] } | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({ exportCityWise: false });
  const isRunningTask = useRef(false);

  useEffect(() => {
    loadTasks();
    loadSettings();
    const interval = setInterval(loadTasks, 10000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    const res = await getSettingsAction();
    if (res.success && res.data) {
        setSettings(res.data);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await updateSettingAction(key, value);
  };

  const loadTasks = async () => {
    const res = await getTasksAction();
    if (res.success) {
      setTasks((res.data || []) as unknown as Task[]);
    }
    setIsLoadingTasks(false);
  };

  const handleSearch = async (e?: React.FormEvent, searchOverride?: string, taskId?: number) => {
    e?.preventDefault();
    const finalQuery = searchOverride;
    if (!finalQuery?.trim()) return;

    const res = await searchLeadsAction(finalQuery, taskId);
    return res;
  };

  const runTaskAutomation = async (taskId: number, keywords: string[]) => {
    if (isRunningTask.current) return;
    isRunningTask.current = true;
    
    await updateTaskStatusAction(taskId, 'running');
    await loadTasks();

    const taskRes = await getTasksAction();
    const taskObj = ((taskRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
    const startIndex = taskObj?.current_keyword_index || 0;

    for (let i = startIndex; i < keywords.length; i++) {
        // Double check status before each step
        const checkRes = await getTasksAction();
        const currentTask = ((checkRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
        if (!currentTask || currentTask.status === 'paused') {
            isRunningTask.current = false;
            return;
        }

        const keyword = keywords[i];
        await updateTaskStatusAction(taskId, 'running', i);
        loadTasks();

        const extractionRes = await handleSearch(undefined, keyword, taskId);
        
        if (!(extractionRes && extractionRes.success) && extractionRes) {
            toast.error(`[${i+1}/${keywords.length}] Failed: ${keyword}`, {
                description: extractionRes.error
            });
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }

    await updateTaskStatusAction(taskId, 'completed', keywords.length);
    isRunningTask.current = false;
    loadTasks();
  };

  const startNewTask = async (name: string, keywords: string[]) => {
    const res = await createTaskAction(name, keywords);
    if (res.success && res.taskId) {
      toast.success(`Automation task "${name}" started`);
      loadTasks();
      runTaskAutomation(Number(res.taskId), keywords);
    } else {
      toast.error(`Failed to create task: ${res.error}`);
    }
  };

  const handlePauseTask = async (taskId: number) => {
    await updateTaskStatusAction(taskId, 'paused');
    toast.info("Task paused");
    loadTasks();
  };

  const handleResumeTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    await updateTaskStatusAction(taskId, 'running');
    toast.success("Task resumed");
    loadTasks();
    
    if (!isRunningTask.current) {
        const keywords = JSON.parse(task.keywords);
        runTaskAutomation(taskId, keywords);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await deleteTaskAction(taskId);
    if (res.success) {
      loadTasks();
    }
    return res;
  };

  // Auto-resume on start
  useEffect(() => {
    if (tasks.length > 0 && !isRunningTask.current) {
      const runningTask = tasks.find(t => t.status === 'running');
      if (runningTask) {
        toast.info(`Resuming task: ${runningTask.name}`);
        runTaskAutomation(runningTask.id, JSON.parse(runningTask.keywords));
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
        loadTasks, 
        startNewTask, 
        handlePauseTask, 
        handleResumeTask, 
        handleDeleteTask,
        handleSearch,
        isLoadingTasks,
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
