"use client"

import { useState, useEffect } from "react"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/actions/siteconfig.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gear } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
import { useSidebar } from "@/components/ui/sidebar"

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: async () => {
      const res = await getSystemSettingsAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    }
  });

  const [maxRetries, setMaxRetries] = useState(3);
  const [maxConcurrentTasks, setMaxConcurrentTasks] = useState(3);

  useEffect(() => {
    if (settings) {
      setMaxRetries(settings.maxRetries);
      setMaxConcurrentTasks(settings.maxConcurrentTasks);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await updateSystemSettingsAction({ maxRetries, maxConcurrentTasks });
      if (!res.success) throw new Error((res as any).error || "Failed to save");
      return res;
    },
    onSuccess: () => {
      toast.success("System settings saved");
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

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
                <BreadcrumbPage>System Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
              <p className="text-muted-foreground mt-1">
                Configure global system parameters, task retries, and concurrency limits.
              </p>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="h-5 w-5 text-primary" />
                  General Configuration
                </CardTitle>
                <CardDescription>System-wide settings that affect worker behavior and task processing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Max Task Auto-Retries</Label>
                  <Input
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(parseInt(e.target.value, 10))}
                    min={0}
                    max={10}
                    className="bg-muted/5 max-w-[200px]"
                  />
                  <p className="text-[10px] text-muted-foreground">Number of times a task will automatically retry if it crashes. Default is 3.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Max Concurrent Tasks (Per User)</Label>
                  <Input
                    type="number"
                    value={maxConcurrentTasks}
                    onChange={(e) => setMaxConcurrentTasks(parseInt(e.target.value, 10))}
                    min={1}
                    max={20}
                    className="bg-muted/5 max-w-[200px]"
                  />
                  <p className="text-[10px] text-muted-foreground">Limit the number of tasks a single user can run simultaneously. Default is 3.</p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="px-8 font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saveMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
