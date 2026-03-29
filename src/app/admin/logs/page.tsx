"use client"

import { useState } from "react"
import { getAdminDashboardStatsAction } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, MagnifyingGlass, Funnel, TerminalWindow } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query';
import { useSidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { open } = useSidebar();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await getAdminDashboardStatsAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    },
    refetchInterval: 30000
  });

  const logs = data?.recentLogs || [];
  const workerLogs = data?.workerLogs || [];

  const filteredLogs = logs.filter((log: any) =>
    (log.action?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const filteredWorkerLogs = workerLogs.filter((log: any) => 
    log.message?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <>
      <header className={`flex transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}>
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
                <BreadcrumbPage>System Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'}`}>
        {isLoading && !data ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                <p className="text-muted-foreground mt-1">
                  Monitor user activities and live background worker extraction loops.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9 bg-background border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="text-muted-foreground">
                  <Funnel className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="worker" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="worker" className="gap-2"><TerminalWindow size={16}/> Live Worker Logs</TabsTrigger>
                <TabsTrigger value="audit" className="gap-2"><FileText size={16}/> Audit Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="worker" className="mt-6">
                <Card className="border shadow-md bg-[#0D1117] text-gray-300 font-mono text-sm overflow-hidden">
                  <div className="bg-[#161B22] border-b border-gray-800 p-3 flex items-center gap-3 text-xs">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-gray-500 font-semibold tracking-wider">render-worker-extrect ~ zsh</span>
                  </div>
                  <CardContent className="p-4 h-[600px] overflow-y-auto">
                    <div className="space-y-1.5">
                      {filteredWorkerLogs.length === 0 ? (
                         <div className="text-gray-600 italic">No recent worker logs found...</div>
                      ) : (
                        filteredWorkerLogs.map((log: any) => (
                          <div key={log.id} className="flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded-md transition-colors">
                            <span className="text-gray-500 shrink-0 select-none">
                              [{format(new Date(log.createdAt), 'HH:mm:ss')}]
                            </span>
                            <span className={cn(
                              "font-bold shrink-0 w-20",
                              log.level === 'INFO' ? "text-blue-400" :
                              log.level === 'SUCCESS' ? "text-emerald-400" :
                              log.level === 'WARN' ? "text-amber-400" : "text-rose-400"
                            )}>
                              [{log.level}]
                            </span>
                            <span className="text-cyan-500 shrink-0">
                              [Task:{log.taskId || 'SYS'}]
                            </span>
                            <span className="text-gray-300 break-all">
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {filteredLogs.map((log: any) => (
                        <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-card/50 backdrop-blur-sm border rounded-2xl hover:bg-card transition-all group">
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-1 h-10 rounded-full transition-all group-hover:h-12",
                              log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                            )} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-foreground capitalize">{log.action?.replace(/_/g, ' ')}</span>
                                {log.status === 'success' ? (
                                  <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full ">Success</div>
                                ) : (
                                  <div className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full ">Failed</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <span className="text-muted-foreground/60">By</span>
                                <span className="text-foreground/80">{log.userName || 'System'}</span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="text-muted-foreground/60">{log.userEmail || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end gap-1">
                            <div className="text-base font-bold text-foreground tabular-nums">
                              {log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss') : '--:--:--'}
                            </div>
                            <div className="text-xs font-bold text-muted-foreground">
                              {log.createdAt ? format(new Date(log.createdAt), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredLogs.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-2xl">
                          <div className="bg-muted w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-foreground font-medium text-lg">No audit logs found for your search.</p>
                          <p className="text-muted-foreground text-sm mt-1">Try a different keyword or check back later.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </>
  )
}
