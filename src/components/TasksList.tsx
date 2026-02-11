'use client';

import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Trash, 
  Calendar, 
  Stack, 
  CheckCircle, 
  Clock, 
  WarningCircle,
  Activity,
  CircleNotch
} from 'phosphor-react';
import { useState } from 'react';
import Link from 'next/link';
import { ExportFilters, FilterSettings } from './ExportFilters';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { getTaskLeadsAction } from '@/app/actions';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutomation } from '@/context/AutomationContext';

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

interface TasksListProps {
  tasks: Task[];
  onPause: (taskId: number) => void;
  onResume: (taskId: number) => void;
  onDelete: (taskId: number) => Promise<{ success: boolean; error?: string }>; // Modified onDelete to return a Promise
}

export default function TasksList({ tasks, onPause, onResume, onDelete }: TasksListProps) {
  const [deletingTasks, setDeletingTasks] = useState<Set<number>>(new Set());
  const { settings, user } = useAutomation();
  const limits: Record<string, number> = {
    free: 500,
    pro: 5000,
    premium: Infinity
  };
  const baseLimit = limits[user?.plan_type || "free"] ?? 500;
  const bonus = user?.bonus_credits || 0;
  const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonus;
  const used = user?.leads_extracted || 0;
  const creditsExhausted = currentLimit !== Infinity && used >= currentLimit;
  const runningCount = tasks.filter(t => t.status === 'running').length;
  const pausedCount = tasks.filter(t => t.status === 'paused').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const downloadTaskCSV = async (taskId: number, taskName: string, filters: FilterSettings) => {
    if (settings.fastMode) {
      const params = new URLSearchParams();
      if (filters.hasEmail) params.set("hasEmail", "1");
      if (filters.hasPhone) params.set("hasPhone", "1");
      if (filters.hasWebsite) params.set("hasWebsite", "1");
      if (filters.hasSocials) params.set("hasSocials", "1");
      if (filters.hasRating) params.set("hasRating", "1");
      if (filters.hasAddress) params.set("hasAddress", "1");
      const query = params.toString();
      const url = query ? `/api/task-export/${taskId}?${query}` : `/api/task-export/${taskId}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to download export");
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${taskName.replace(/\s+/g, "_")}_export.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      return;
    }
    const res = await getTaskLeadsAction(taskId);
    if (!res.success || !res.data) {
      toast.error(`Failed to download leads for task: ${taskName}`);
      return;
    }

    const leads = (res.data || []) as unknown as Lead[];
    
    // Apply filters
    let filteredLeads = [...leads];
    
    if (filters.hasEmail) {
      filteredLeads = filteredLeads.filter((l: Lead) => l.email || l.website_email);
    }
    if (filters.hasPhone) {
      filteredLeads = filteredLeads.filter((l: Lead) => l.phone || l.website_phone);
    }
    if (filters.hasWebsite) {
      filteredLeads = filteredLeads.filter((l: Lead) => l.website && l.website.startsWith('http'));
    }
    if (filters.hasSocials) {
      filteredLeads = filteredLeads.filter((l: Lead) => 
        l.facebook || l.instagram || l.linkedin || l.twitter || l.youtube || l.pinterest || l.tiktok
      );
    }
    if (filters.hasRating) {
      filteredLeads = filteredLeads.filter((l: Lead) => l.rating && l.rating > 0);
    }
    if (filters.hasAddress) {
      filteredLeads = filteredLeads.filter((l: Lead) => l.address && l.address.length > 5);
    }

    if (filteredLeads.length === 0) {
      toast.error("No leads match the selected filters");
      return;
    }

    const headers = [
      'Name', 'Category', 'City', 'Rating', 'Reviews', 'Phone', 'Website Phone', 
      'Email', 'Website Email', 'Website', 'Address', 'DirectionUrl', 
      'Latitude', 'Longitude', 'Monday Hours', 'Tuesday Hours', 'Wednesday Hours', 
      'Thursday Hours', 'Friday Hours', 'Saturday Hours', 'Sunday Hours',
      'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Pinterest', 'TikTok'
    ];
    const rows = filteredLeads.map((l: any) => [
      l.name, l.category, l.city, l.rating, l.reviews_count, l.phone, l.website_phone,
      l.email, l.website_email, l.website, l.address, l.direction_url,
      l.latitude, l.longitude, l.monday_hours, l.tuesday_hours, l.wednesday_hours,
      l.thursday_hours, l.friday_hours, l.saturday_hours, l.sunday_hours,
      l.facebook, l.instagram, l.linkedin, l.twitter, l.youtube, l.pinterest, l.tiktok
    ]);

    if (settings.exportCityWise) {
        // Group by city
        const cityGroups: Record<string, any[][]> = {};
        rows.forEach(row => {
          const city = row[2] || 'Unknown';
          if (!cityGroups[city]) cityGroups[city] = [];
          cityGroups[city].push(row);
        });

        Object.entries(cityGroups).forEach(([city, cityRows], index) => {
          const cityCsv = [headers, ...cityRows]
            .map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(","))
            .join("\n");
            
          const blob = new Blob([cityCsv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${taskName.replace(/\s+/g, '_')}_${city.replace(/\s+/g, '_')}_leads.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          
          // Delay each download slightly to prevent browser blocking or race conditions
          setTimeout(() => {
            link.click();
            document.body.removeChild(link);
          }, index * 200);
        });
        toast.success(`Exporting ${Object.keys(cityGroups).length} city-wise CSV files...`);
    } else {
        const csvContent = [headers, ...rows]
          .map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `task_${taskName.replace(/\s+/g, '_')}_leads.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${taskName} leads exported (${filteredLeads.length} leads)`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <div className="flex flex-col gap-1.5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1"><Activity className="h-3 w-3" /> Running</Badge>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 w-fit opacity-70">Running on Server</Badge>
          </div>
        );
      case 'paused':
        if (creditsExhausted) {
          return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><Clock className="h-3 w-3" /> Paused • Credits exhausted</Badge>;
        }
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1"><Clock className="h-3 w-3" /> Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-accent text-foreground border-border gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'failed': // Added failed status
        return <Badge variant="destructive" className="gap-1"><WarningCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Automation Tasks</CardTitle>
            <CardDescription>Monitor and manage your background extraction tasks.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{runningCount} running</Badge>
            <Badge variant="outline">{pausedCount} paused</Badge>
            <Badge variant="outline">{completedCount} completed</Badge>
          </div>
        </CardHeader>

        {tasks.length === 0 ? (
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-12 text-center text-muted-foreground">
              <Activity className="h-8 w-8 opacity-30" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">No automation tasks yet</p>
                <p className="text-sm">Generate keywords to launch your first campaign.</p>
              </div>
              <Button asChild className="mt-2">
                <Link href="/keywords">Create a campaign</Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="rounded-xl border border-border/60 text-card-foreground shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[300px]">Task Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="truncate max-w-[250px]" title={task.name}>
                            <span className="font-semibold">{task.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(task.status)}
                      </TableCell>
                      <TableCell>
                        {task.total_keywords} keywords
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[120px] max-w-[200px] pr-10">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{Math.round((task.current_keyword_index / task.total_keywords) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${task.status === 'running' ? 'bg-primary animate-pulse' : 'bg-primary/80'}`}
                              style={{ width: `${(task.current_keyword_index / task.total_keywords) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stack className="h-4 w-4 text-primary" />
                          <span className="font-medium">{task.total_leads}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipProvider>
                            {task.status === 'running' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPause(task.id)}>
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Pause Task</TooltipContent>
                              </Tooltip>
                            ) : task.status === 'paused' || task.status === 'pending' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onResume(task.id)}>
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Resume Task</TooltipContent>
                              </Tooltip>
                            ) : null}

                            <ExportFilters 
                              onExport={(f) => downloadTaskCSV(task.id, task.name, f)}
                              disabled={task.total_leads === 0}
                            />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors" 
                                  disabled={deletingTasks.has(task.id)}
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this task? All associated leads will be removed.')) {
                                      setDeletingTasks(prev => {
                                        const next = new Set(prev);
                                        next.add(task.id);
                                        return next;
                                      });
                                      try {
                                        const res = await onDelete(task.id);
                                        if (res.success) {
                                          toast.success("Task deleted successfully");
                                        } else {
                                          toast.error(`Failed to delete task: ${res.error}`);
                                        }
                                      } finally {
                                        setDeletingTasks(prev => {
                                          const next = new Set(prev);
                                          next.delete(task.id);
                                          return next;
                                        });
                                      }
                                    }
                                  }}
                                >
                                  {deletingTasks.has(task.id) ? (
                                    <CircleNotch className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Task</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
