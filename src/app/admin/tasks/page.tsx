"use client"

import { useState } from "react"
import {
  getAdminTasksDetailedAction,
  updateTaskStatusAdminAction,
  bulkUpdateTasksAdminAction,
} from "@/app/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  MagnifyingGlass,
  Play,
  Pause,
  Lightning,
  ListChecks,
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  User,
  ArrowsClockwise,
} from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20" },
  running: { label: "Running", class: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20" },
  completed: { label: "Completed", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" },
  failed: { label: "Failed", class: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20" },
  paused: { label: "Paused", class: "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20" },
}

export default function AdminTasksPage() {
  const queryClient = useQueryClient()
  const { open } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedTask, setExpandedTask] = useState<number | null>(null)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin-tasks-detailed"],
    queryFn: async () => {
      const res = await getAdminTasksDetailedAction()
      if (!res.success) throw new Error((res as any).error)
      return (res as any).data || []
    },
    staleTime: 2_000,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      return (data && data.some((t: any) => t.status === 'running' || t.status === 'pending' || t.status === 'uploading')) ? 2_000 : 15_000;
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const res = await updateTaskStatusAdminAction(taskId, status)
      if (!res.success) throw new Error((res as any).error || "Failed to update task")
      return res
    },
    onSuccess: () => {
      toast.success("Task status updated")
      queryClient.invalidateQueries({ queryKey: ["admin-tasks-detailed"] })
    },
    onError: (error: any) => toast.error(error.message),
  })

  const bulkMutation = useMutation({
    mutationFn: async (mode: string) => {
      const res = await bulkUpdateTasksAdminAction(mode)
      if (!res.success) throw new Error((res as any).error || "Bulk update failed")
      return res
    },
    onSuccess: (_, mode) => {
      toast.success(mode === "pause_running" ? "All running tasks paused" : "Paused tasks resumed")
      queryClient.invalidateQueries({ queryKey: ["admin-tasks-detailed"] })
    },
    onError: (error: any) => toast.error(error.message),
  })

  // Filters
  const filteredTasks = tasks.filter((t: any) => {
    const matchesSearch =
      !searchTerm ||
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.id).includes(searchTerm)
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalTasks = tasks.length
  const runningCount = tasks.filter((t: any) => t.status === "running").length
  const completedCount = tasks.filter((t: any) => t.status === "completed").length
  const failedCount = tasks.filter((t: any) => t.status === "failed").length
  const pausedCount = tasks.filter((t: any) => t.status === "paused").length
  const totalCreditsConsumed = tasks.reduce((sum: number, t: any) => sum + (Number(t.creditsConsumed) || 0), 0)

  return (
    <>
      <header
        className={`flex transition-all ease-in-out duration-300 ${open ? "md:ml-[250px]" : "md:ml-[60px]"} h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Task Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => bulkMutation.mutate("pause_running")}
            disabled={bulkMutation.isPending || runningCount === 0}
          >
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pause All
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => bulkMutation.mutate("resume_paused")}
            disabled={bulkMutation.isPending || pausedCount === 0}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Resume All
          </Button>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 ${open ? "md:ml-[250px]" : "md:ml-[30px]"}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
              <p className="text-muted-foreground mt-1">
                View all tasks with user details, progress, and credit consumption.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Total</CardTitle>
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <ListChecks className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{totalTasks}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">All tasks</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Running</CardTitle>
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <ArrowsClockwise className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{runningCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Active now</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Completed</CardTitle>
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{completedCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Finished</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Failed</CardTitle>
                  <div className="bg-rose-500/10 p-2 rounded-lg">
                    <XCircle className="h-4 w-4 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{failedCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Errored</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Paused</CardTitle>
                  <div className="bg-slate-500/10 p-2 rounded-lg">
                    <Pause className="h-4 w-4 text-slate-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{pausedCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">On hold</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Credits Used</CardTitle>
                  <div className="bg-violet-500/10 p-2 rounded-lg">
                    <Lightning className="h-4 w-4 text-violet-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{totalCreditsConsumed.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Leads extracted</p>
                </CardContent>
              </Card>
            </div>

            {/* Tasks Table */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Detailed view of every task with user info and credit consumption.</CardDescription>
                <div className="grid gap-3 pt-4 md:grid-cols-3">
                  <div className="relative md:col-span-2">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by task name, user name, email, or task ID..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Credits Used</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task: any) => {
                      const progress = task.totalKeywords > 0
                        ? Math.round(((task.currentKeywordIndex || 0) / task.totalKeywords) * 100)
                        : 0
                      const isExpanded = expandedTask === task.id
                      const cfg = statusConfig[task.status] || { label: task.status, class: "bg-muted" }

                      return (
                        <>
                          <TableRow
                            key={task.id}
                            className={cn(
                              "hover:bg-muted/30 transition-colors cursor-pointer",
                              task.status === "running" && "bg-blue-500/[0.03]",
                              task.status === "failed" && "bg-rose-500/[0.03]",
                            )}
                            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{task.id}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-sm truncate">{task.name}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {task.totalKeywords} keyword{task.totalKeywords !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{task.userName || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{task.userEmail || ""}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cfg.class}>{cfg.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                  <span>{task.currentKeywordIndex || 0}/{task.totalKeywords}</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-bold tabular-nums text-sm">
                                {Number(task.creditsConsumed || 0).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-muted-foreground">leads</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {task.createdAt ? format(new Date(task.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                {(task.status === "paused" || task.status === "failed" || task.status === "pending") && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: "running" })}
                                    disabled={updateStatusMutation.isPending}
                                    title="Resume task"
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {task.status === "running" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                    onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: "paused" })}
                                    disabled={updateStatusMutation.isPending}
                                    title="Pause task"
                                  >
                                    <Pause className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded details row */}
                          {isExpanded && (
                            <TableRow key={`${task.id}-detail`} className="bg-muted/20 hover:bg-muted/30">
                              <TableCell colSpan={8} className="py-4 px-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                  {/* User Details */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5" />
                                      User Details
                                    </h4>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium">{task.userName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium text-xs">{task.userEmail}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Plan</span>
                                        <Badge variant="secondary" className="capitalize text-[10px]">
                                          {task.userPlan || "free"}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Extracted</span>
                                        <span className="font-bold tabular-nums">{(task.userLeadsExtracted || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Credit Limit</span>
                                        <span className="font-bold tabular-nums">
                                          {task.userPlan === "premium" || task.userPlan === "enterprise"
                                            ? "Unlimited"
                                            : (task.userBonusCredits || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Task Details */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                      <ListChecks className="h-3.5 w-3.5" />
                                      Task Details
                                    </h4>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Task ID</span>
                                        <span className="font-mono text-xs">#{task.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Keywords</span>
                                        <span className="font-bold tabular-nums">{task.currentKeywordIndex || 0} / {task.totalKeywords}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Credits Used</span>
                                        <span className="font-bold tabular-nums text-violet-600">{Number(task.creditsConsumed || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge className={cfg.class}>{cfg.label}</Badge>
                                      </div>
                                      {task.statusReason && (
                                        <div className="mt-2 p-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
                                          <Warning className="h-3 w-3 inline mr-1" />
                                          {task.statusReason}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Timestamps */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5" />
                                      Timestamps
                                    </h4>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created</span>
                                        <span className="text-xs">
                                          {task.createdAt ? format(new Date(task.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Updated</span>
                                        <span className="text-xs">
                                          {task.updatedAt ? format(new Date(task.updatedAt), "MMM dd, yyyy HH:mm") : "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )
                    })}
                    {filteredTasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ListChecks className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-muted-foreground text-sm">No tasks found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
