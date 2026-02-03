'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, Phone, Star, Mail, Globe, Download, Pause, Play, Trash2, LayoutDashboard, Database, ListChecks, History, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import {
  createTaskAction,
  getTasksAction,
  updateTaskStatusAction,
  pauseAllRunningTasksAction,
  deleteTaskAction,
  searchLeadsAction,
  getLeadsAction,
  getRecentSearchesAction,
} from './actions';
import { toast } from 'sonner';
import { useAutomation } from '@/context/AutomationContext';
import KeywordGenerator from '@/components/KeywordGenerator';
import TasksList from '@/components/TasksList';
import { AppSidebar } from '@/components/AppSidebar';
import { FilterSettings } from '@/components/ExportFilters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbList, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { settings } = useAutomation();
  const [status, setStatus] = useState('');

  const isRunningTask = useRef(false);

  useEffect(() => {
    const init = async () => {
      loadAllLeads();
      await pauseAllRunningTasksAction(); // Reset any stuck 'running' tasks
      const res = await getTasksAction();
      if (res.success && res.data) {
        const allTasks = (res.data || []) as unknown as Task[];
        setTasks(allTasks);
        
        // Auto-resume: Find the first unfinished task
        const taskToResume = allTasks.find(t => t.status === 'pending' || t.status === 'paused');
        if (taskToResume) {
          const keywords = JSON.parse(taskToResume.keywords);
          runTaskAutomation(taskToResume.id, keywords);
          toast.info(`Auto-resuming task: ${taskToResume.name}`);
        }
      }
    };
    init();

    const interval = setInterval(() => {
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadAllLeads = async (searchId?: number) => {
    const res = await getLeadsAction(searchId);
    if (res.success) setLeads(res.data || []);
  };

  const loadTasks = async () => {
    const res = await getTasksAction();
    if (res.success) setTasks((res.data || []) as unknown as Task[]);
  };

  const handleSearch = async (e?: React.FormEvent, searchOverride?: string, taskId?: number) => {
    e?.preventDefault();
    const finalQuery = searchOverride || query;
    if (!finalQuery.trim()) return;

    if (searchOverride && !taskId) setQuery(searchOverride);

    if (!taskId) {
        setIsLoading(true);
        setStatus('Searching Google Maps...');
    }

    const res = await searchLeadsAction(finalQuery, taskId);
    
    if (res.success) {
        if (!taskId) {
            setStatus(`Successfully found ${res.count} leads.`);
            toast.success(`Found ${res.count} leads for "${finalQuery}"`);
        }
        loadAllLeads(res.searchId as number);
    } else {
        if (!taskId) {
            setStatus(`Error: ${res.error}`);
            toast.error(`Search failed: ${res.error}`);
        }
    }

    if (!taskId) setIsLoading(false);
    return res;
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await deleteTaskAction(taskId);
    if (res.success) {
      loadTasks();
      loadAllLeads();
    }
    return res;
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

  const runTaskAutomation = async (taskId: number, keywords: string[]) => {
    isRunningTask.current = true;
    await updateTaskStatusAction(taskId, 'running');
    loadTasks();

    const taskRes = await getTasksAction();
    const taskObj = ((taskRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
    const startIndex = taskObj?.current_keyword_index || 0;

    for (let i = startIndex; i < keywords.length; i++) {
      const checkRes = await getTasksAction();
      const currentTask = ((checkRes.data || []) as unknown as Task[])?.find((t) => t.id === taskId);
      if (currentTask?.status === 'paused') {
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
    
    // Resume processing if not already running
    if (!isRunningTask.current) {
        const keywords = JSON.parse(task.keywords);
        runTaskAutomation(taskId, keywords);
    }
  };

  const exportToCSV = (filters: FilterSettings) => {
    if (leads.length === 0) return;
    
    // Apply filters
    let filteredLeads = [...leads];
    
    if (filters.hasEmail) {
      filteredLeads = filteredLeads.filter(l => l.email || l.website_email);
    }
    if (filters.hasPhone) {
      filteredLeads = filteredLeads.filter(l => l.phone || l.website_phone);
    }
    if (filters.hasWebsite) {
      filteredLeads = filteredLeads.filter(l => l.website && l.website.startsWith('http'));
    }
    if (filters.hasSocials) {
      filteredLeads = filteredLeads.filter(l => 
        l.facebook || l.instagram || l.linkedin || l.twitter || l.youtube || l.pinterest || l.tiktok
      );
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
    const rows = filteredLeads.map(l => [
      l.name, l.category, l.city, l.rating, l.reviews_count, l.phone, l.website_phone,
      l.email, l.website_email, l.website, l.address, l.direction_url,
      l.latitude, l.longitude, l.monday_hours, l.tuesday_hours, l.wednesday_hours,
      l.thursday_hours, l.friday_hours, l.saturday_hours, l.sunday_hours,
      l.facebook, l.instagram, l.linkedin, l.twitter, l.youtube, l.pinterest, l.tiktok
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(","))
      .join("\n");

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
          link.setAttribute("download", `export_${city.replace(/\s+/g, '_')}_leads.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          
          setTimeout(() => {
            link.click();
            document.body.removeChild(link);
          }, index * 200);
        });
        toast.success(`Exporting ${Object.keys(cityGroups).length} city-wise CSV files...`);
    } else {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_export_${new Date().getTime()}.csv`;
        link.click();
        toast.success(`Exported ${filteredLeads.length} leads`);
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Lead Extractor</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 md:max-w-[82vw] md:min-w-[82vw] ">
          <>
            <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-3xl font-bold tracking-tight">Extract Leads</CardTitle>
          <CardDescription className="text-base ">
          Search Google Maps and save business leads directly to your database.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Website designer in Rajkot"
                        className="pl-9 "
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className=" px-8">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                      {isLoading ? 'Extracting...' : 'Extract'}
                    </Button>
                  </form>
                  {status && (
                    <p className={`mt-3 text-xs font-medium ${status.includes('Error') ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'}`}>
                      {status}
                    </p>
                  )}
            </CardContent>
              </Card>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Recent Leads</h3>
                {leads.length > 10 && (
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground   font-bold">
                    Showing first 10 leads
                  </span>
                )}
              </div>
              <div className="border rounded-sm p text-card-foreground shadow-sm overflow-hidden">
                <Table className=''>
                  <TableHeader>
                    <TableRow className="bg-muted/50  ">
                      <TableHead className="w-[250px] ">Business Name</TableHead>
                      <TableHead>Contact </TableHead>
                      <TableHead>Website Data </TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.slice(0, 10).map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/50  transition-colors">
                        <TableCell>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{lead.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                             {lead.phone && <span className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> {lead.phone}</span>}
                             {lead.website && (
                               <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                                 <Globe className="h-3 w-3" /> {new URL(lead.website).hostname}
                               </a>
                             )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 max-w-[200px]">
                             {lead.website_email && (
                               <div className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded flex items-start gap-1">
                                 <Mail className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                 <span className="truncate" title={lead.website_email}>{lead.website_email}</span>
                               </div>
                             )}
                             {lead.website_phone && (
                               <div className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded flex items-start gap-1">
                                 <Phone className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                 <span className="truncate" title={lead.website_phone}>{lead.website_phone}</span>
                               </div>
                             )}
                             {!lead.website_email && !lead.website_phone && <span className="text-muted-foreground text-[10px] italic">No extra data found</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.rating ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{lead.rating}</span>
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs text-muted-foreground ml-1">({lead.reviews_count})</span>
                            </div>
                          ) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{lead.address}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32">
                          <LoadingSpinner message="Extracting leads..." />
                        </TableCell>
                      </TableRow>
                    )}
                    {leads.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No leads found. Start a search to see results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
          </>
        </div>
      </SidebarInset>
    </>
  );
}
