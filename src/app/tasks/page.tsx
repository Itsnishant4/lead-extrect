"use client"

import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasksAction, deleteTaskAction, updateTaskStatusAction, triggerTaskAutomationAction, getTaskLeadsAction } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Rocket, 
  Pause, 
  Play, 
  Trash2, 
  RefreshCw, 
  Download, 
  Clock,
  Loader2,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Progress } from 'radix-ui';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasksAction();
      if (res.success && 'data' in res) return (res.data as any[]) || [];
      return [];
    },
    refetchInterval: 5000
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number, status: string }) => {
      const res = await updateTaskStatusAction(taskId, status);
      if (res.success && status === 'running') {
        // Automatically trigger automation when resumed
        await triggerTaskAutomationAction(taskId);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const runMutation = useMutation({
    mutationFn: triggerTaskAutomationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task started');
    }
  });

  const handleExport = async (taskId: number, taskName: string) => {
    toast.info('Exporting leads...');
    try {
      const res = await getTaskLeadsAction(taskId);
      if (res.success && 'data' in res) {
        const leads = (res.data as any[]) || [];
        if (leads.length === 0) {
          toast.error('No leads found for this task');
          return;
        }
        
        const headers = ['Name', 'Phone', 'Email', 'Website', 'Address'];
        const csv = [
          headers.join(','),
          ...leads.map(l => [
            `"${(l.name || '').replace(/"/g, '""')}"`,
            `"${l.phone || ''}"`,
            `"${l.email || ''}"`,
            `"${l.website || ''}"`,
            `"${(l.address || '').replace(/"/g, '""')}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${taskName.replace(/\s+/g, '_')}_leads.csv`;
        a.click();
        toast.success('Export complete');
      }
    } catch (e) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50">
      <DashboardHeader activePage="campaigns" />
      
      <main className="pt-28 pb-20 max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl serif-font font-bold text-slate-900">Automation Tasks</h1>
            <p className="text-slate-500 mt-1">Monitor and manage your background extraction campaigns.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}>
            <RefreshCw size={16} /> Refresh
          </Button>
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
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Start a new automation from the Keyword Generator page.</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-5xl mx-auto">
            {tasks.map((task: any) => (
              <Card key={task.id} className="overflow-hidden !rounded-3xl  bg-gradient-to-b from-white to-gray-100 !border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 !rounded-2xl">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                      task.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                      task.status === 'running' ? "bg-indigo-100 text-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.2)]" :
                      task.status === 'failed' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <Rocket className={cn("h-6 w-6", task.status === 'running' && "animate-pulse")} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{task.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className={cn(
                          "capitalize text-[10px] font-black px-2 py-0.5 rounded-full border-none",
                          task.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" :
                          task.status === 'running' ? "bg-indigo-500/10 text-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.1)]" :
                          task.status === 'failed' ? "bg-rose-500/10 text-rose-600" : 
                          task.status === 'paused' ? "bg-amber-500/10 text-amber-600" :
                          "bg-slate-500/10 text-slate-500"
                        )}>
                          {task.status} {task.totalKeywords > 0 ? `• ${Math.round((task.currentKeywordIndex / task.totalKeywords) * 100)}%` : ''}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Clock size={12} className="text-slate-300" /> {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, HH:mm') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {task.status === 'pending' && (
                      <Button size="sm" className="bg-indigo-600" onClick={() => runMutation.mutate(task.id)}>
                        <Play size={14} className="mr-2" /> Start
                      </Button>
                    )}
                    {task.status === 'running' && (
                      <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ taskId: task.id, status: 'paused' })}>
                        <Pause size={14} className="mr-2" /> Pause
                      </Button>
                    )}
                    {task.status === 'paused' && (
                      <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ taskId: task.id, status: 'running' })}>
                        <Play size={14} className="mr-2" /> Resume
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleExport(task.id, task.name)}>
                      <Download size={14} className="mr-2" /> CSV
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => deleteMutation.mutate(task.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
            
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

