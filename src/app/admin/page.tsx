"use client"

import {
  getAdminDashboardStatsAction,
  getAdminChartDataAction,
  getAdminInsightsAction,
  getAdminTasksAction,
  updateTaskStatusAdminAction,
  bulkUpdateTasksAdminAction,
  updateUserPlanAction
} from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  MagnifyingGlass,
  Stack,
  Activity,
  TrendUp,
  FileText,
  ArrowUpRight,
  ChartPie,
  UsersThree,
  Pause,
  Play,
  ListBullets
} from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-muted-foreground text-[10px] font-bold mb-1">
          {label ? format(new Date(label), 'MMM dd, yyyy') : ''}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-foreground font-bold text-lg leading-none">
            {payload[0].value.toLocaleString()}
            <span className="text-muted-foreground text-xs font-medium ml-1">leads</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await getAdminDashboardStatsAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    }
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: async () => {
      const res = await getAdminChartDataAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    }
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['admin-insights'],
    queryFn: async () => {
      const res = await getAdminInsightsAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    }
  });

  const isLoading = isLoadingStats || isLoadingChart || isLoadingInsights;

  const { data: adminTasks = [] } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const res = await getAdminTasksAction();
      return res.success ? (res.data || []) : [];
    },
    refetchInterval: 10000,
  });

  const taskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const res = await updateTaskStatusAdminAction(taskId, status);
      if (!res.success) throw new Error(res.error || "Failed to update task");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    }
  });

  const bulkTaskMutation = useMutation({
    mutationFn: async (mode: "pause_running" | "resume_paused") => {
      const res = await bulkUpdateTasksAdminAction(mode);
      if (!res.success) throw new Error(res.error || "Failed to update tasks");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const planMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: number; plan: string }) => {
      const res = await updateUserPlanAction(userId, plan);
      if (!res.success) throw new Error(res.error || "Failed to update plan");
      return res;
    },
    onSuccess: () => {
      toast.success("User plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-insights'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    }
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.stats?.users || 0,
      icon: Users,
      description: "Registered users on platform",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Suspended Users",
      value: stats?.stats?.suspended || 0,
      icon: Users,
      description: "Currently suspended accounts",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Total Leads",
      value: stats?.stats?.leads?.toLocaleString() || 0,
      icon: MagnifyingGlass,
      description: "Leads extracted across all users",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Running Tasks",
      value: stats?.stats?.runningTasks || 0,
      icon: Activity,
      description: "Tasks active right now",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Active Tasks",
      value: stats?.stats?.tasks || 0,
      icon: Stack,
      description: "Automation tasks created",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Total Searches",
      value: stats?.stats?.searches || 0,
      icon: Activity,
      description: "Unique location searches",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ]

  return (
    <>
      <header className={`transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} flex h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}>
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Admin Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className={`flex-1 transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'} overflow-y-auto p-4 md:p-8 pt-6`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground font-medium mt-1">
                  System performance and growth metrics.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <Card key={card.title} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-none overflow-hidden group hover:border-border transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-md font-bold  text-foreground">{card.title}</CardTitle>
                    <div className={`${card.bg} p-2 rounded-lg`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tabular-nums text-foreground">{card.value}</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground/60 ">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      Updated just now
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 shadow-none border-border/50 bg-card/50">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <TrendUp className="h-4 w-4 text-primary" />
                    Lead Growth
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Daily lead volume over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] p-0 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData?.leadsGrowth || []} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="vercelGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        fontWeight="600"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        fontWeight="600"
                        tick={{ fill: 'var(--muted-foreground)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#vercelGradient)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 shadow-none border-border/50 bg-card/50">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    System Activity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Extraction and search operations</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] p-0 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData?.activityStats || []} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        fontWeight="600"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        fontWeight="600"
                        tick={{ fill: 'var(--muted-foreground)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--foreground)"
                        strokeWidth={2}
                        fillOpacity={0.05}
                        fill="currentColor"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ChartPie className="h-4 w-4 text-primary" />
                    Plan Mix
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                    Distribution of plans across users
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {insights?.planBreakdown?.map((plan: any) => (
                    <div key={plan.plan_type} className="flex items-center justify-between text-xs font-semibold">
                      <span className="capitalize text-muted-foreground">{plan.plan_type}</span>
                      <Badge variant="secondary" className="tabular-nums">{plan.count}</Badge>
                    </div>
                  ))}
                  {insights?.planBreakdown?.length === 0 && (
                    <div className="text-xs text-muted-foreground">No plan data yet.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <UsersThree className="h-4 w-4 text-primary" />
                    Top Users
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                    Most leads extracted
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {insights?.topUsers?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          <div className="text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={user.plan_type}
                            onValueChange={(val) => planMutation.mutate({ userId: user.id, plan: val })}
                            disabled={planMutation.isPending}
                          >
                            <SelectTrigger className="h-6 w-[80px] text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge variant="outline" className="tabular-nums">{user.leads_extracted || 0}</Badge>
                        </div>
                      </div>
                    ))}
                    {insights?.topUsers?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">No data yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ListBullets className="h-4 w-4 text-primary" />
                    Task Status
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                    Current task mix
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {insights?.taskStatusBreakdown?.map((row: any) => (
                    <div key={row.status} className="flex items-center justify-between text-xs font-semibold">
                      <span className="capitalize text-muted-foreground">{row.status}</span>
                      <Badge variant="secondary" className="tabular-nums">{row.count}</Badge>
                    </div>
                  ))}
                  {insights?.taskStatusBreakdown?.length === 0 && (
                    <div className="text-xs text-muted-foreground">No task data yet.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Recent Signups
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                    Latest users joining the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {insights?.recentSignups?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          <div className="text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <Select
                            defaultValue={user.plan_type}
                            onValueChange={(val) => planMutation.mutate({ userId: user.id, plan: val })}
                            disabled={planMutation.isPending}
                          >
                            <SelectTrigger className="h-7 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(user.created_at), 'MMM dd')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {insights?.recentSignups?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">No signups yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Admin Controls
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                  Bulk actions across the system
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => bulkTaskMutation.mutate("pause_running")}
                    disabled={bulkTaskMutation.isPending}
                  >
                    <Pause className="h-4 w-4" />
                    Pause All Running Tasks
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => bulkTaskMutation.mutate("resume_paused")}
                    disabled={bulkTaskMutation.isPending}
                  >
                    <Play className="h-4 w-4" />
                    Resume Eligible Tasks
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Resume respects suspended accounts and credit limits.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Task Monitor
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">
                  Live tasks across all users
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminTasks.map((task: any) => {
                        const pct = task.total_keywords > 0
                          ? Math.round((task.current_keyword_index / task.total_keywords) * 100)
                          : 0;
                        return (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.name}</TableCell>
                            <TableCell className="text-muted-foreground">{task.user_name} • {task.user_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{task.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{pct}%</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => taskStatusMutation.mutate({ taskId: task.id, status: "paused" })}
                                >
                                  Pause
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => taskStatusMutation.mutate({ taskId: task.id, status: "running" })}
                                >
                                  Resume
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {adminTasks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No tasks found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 shadow-none overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Recent Logs
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium tracking-tight">Real-time system audit streaming</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {stats?.recentLogs?.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-1 h-8 rounded-full transition-all group-hover:h-10",
                          log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                        )} />
                        <div>
                          <div className="font-bold text-sm text-foreground capitalize flex items-center gap-2">
                            {log.action.replace('_', ' ')}
                            <span className="text-[10px] font-black text-muted-foreground  px-1 border rounded">Log</span>
                          </div>
                          <div className="text-xs font-medium text-muted-foreground">{log.user_name} • <span className="opacity-50">{log.user_email}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground tabular-nums">{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                        <div className="text-[10px] font-bold text-muted-foreground">{format(new Date(log.created_at), 'MMM dd')}</div>
                      </div>
                    </div>
                  ))}
                  {stats?.recentLogs?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground font-bold">No active logs</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
