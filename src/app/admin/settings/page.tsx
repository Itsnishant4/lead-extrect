"use client"

import { useState, useEffect } from "react"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/actions/siteconfig.actions"
import { getAllProxiesAdminAction, addProxyAdminAction, deleteProxyAdminAction, toggleProxyAdminAction, bulkAddProxiesAdminAction } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Gear, Globe, Plus, Trash, ShieldCheck, ShieldWarning, Code } from "phosphor-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  const { data: proxies = [], isLoading: isLoadingProxies } = useQuery({
    queryKey: ['admin-proxies'],
    queryFn: async () => {
      const res = await getAllProxiesAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    }
  });

  const [maxRetries, setMaxRetries] = useState(3);
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkJsonInput, setBulkJsonInput] = useState("");
  const [newProxy, setNewProxy] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    protocol: 'http',
  });

  useEffect(() => {
    if (settings) {
      setMaxRetries(settings.maxRetries);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await updateSystemSettingsAction({ 
        maxRetries
      });
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

  const addProxyMutation = useMutation({
    mutationFn: async () => {
      if (!newProxy.host || !newProxy.port) {
        throw new Error("Host and port are required");
      }
      const res = await addProxyAdminAction({
        host: newProxy.host,
        port: parseInt(newProxy.port),
        username: newProxy.username || null,
        password: newProxy.password || null,
        protocol: newProxy.protocol,
        is_active: true,
      });
      if (!res.success) throw new Error((res as any).error || "Failed to add proxy");
      return res;
    },
    onSuccess: () => {
      toast.success("Proxy added successfully");
      setIsAddProxyOpen(false);
      setNewProxy({ host: '', port: '', username: '', password: '', protocol: 'http' });
      queryClient.invalidateQueries({ queryKey: ['admin-proxies'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const deleteProxyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteProxyAdminAction(id);
      if (!res.success) throw new Error((res as any).error || "Failed to delete proxy");
      return res;
    },
    onSuccess: () => {
      toast.success("Proxy deleted");
      queryClient.invalidateQueries({ queryKey: ['admin-proxies'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const toggleProxyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await toggleProxyAdminAction(id, isActive);
      if (!res.success) throw new Error((res as any).error || "Failed to toggle proxy");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proxies'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: async () => {
      try {
        const data = JSON.parse(bulkJsonInput);
        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of proxies");
        }
        const res = await bulkAddProxiesAdminAction(data);
        if (!res.success) throw new Error((res as any).error || "Failed to import proxies");
        return res;
      } catch (err: any) {
        throw new Error(err.message || "Invalid JSON format");
      }
    },
    onSuccess: (res: any) => {
      toast.success(`Successfully imported ${res.count} proxies`);
      setIsBulkImportOpen(false);
      setBulkJsonInput("");
      queryClient.invalidateQueries({ queryKey: ['admin-proxies'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const dummyProxiesJson = [
    { host: "proxy1.example.com", port: 8080, protocol: "http" },
    { host: "proxy2.example.com", port: 8080, username: "user", password: "pass", protocol: "https" },
    { host: "proxy3.example.com", port: 1080, protocol: "socks5" }
  ];

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
                Configure global system parameters that affect worker behavior.
              </p>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="h-5 w-5 text-primary" />
                  Task Configuration
                </CardTitle>
                <CardDescription>Settings that control how tasks behave when they fail.</CardDescription>
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

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Proxy Configuration
                    </CardTitle>
                    <CardDescription>Manage proxies for Google Maps scraping to avoid rate limiting.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => { setBulkJsonInput(JSON.stringify(dummyProxiesJson, null, 2)); setIsBulkImportOpen(true); }}
                    >
                      <Code size={16} />
                      Bulk Import
                    </Button>
                    <Dialog open={isAddProxyOpen} onOpenChange={setIsAddProxyOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={16} />
                        Add Proxy
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Proxy</DialogTitle>
                        <DialogDescription>Add a proxy to rotate requests and avoid 429 errors.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Host</Label>
                            <Input 
                              placeholder="proxy.example.com"
                              value={newProxy.host}
                              onChange={(e) => setNewProxy(prev => ({ ...prev, host: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Port</Label>
                            <Input 
                              placeholder="8080"
                              value={newProxy.port}
                              onChange={(e) => setNewProxy(prev => ({ ...prev, port: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Username (optional)</Label>
                            <Input 
                              placeholder="username"
                              value={newProxy.username}
                              onChange={(e) => setNewProxy(prev => ({ ...prev, username: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password (optional)</Label>
                            <Input 
                              type="password"
                              placeholder="password"
                              value={newProxy.password}
                              onChange={(e) => setNewProxy(prev => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Protocol</Label>
                          <Select value={newProxy.protocol} onValueChange={(val) => setNewProxy(prev => ({ ...prev, protocol: val }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="http">HTTP</SelectItem>
                              <SelectItem value="https">HTTPS</SelectItem>
                              <SelectItem value="socks4">SOCKS4</SelectItem>
                              <SelectItem value="socks5">SOCKS5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProxyOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={() => addProxyMutation.mutate()} 
                          disabled={addProxyMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {addProxyMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                          Add Proxy
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProxies ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : proxies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <ShieldWarning className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No proxies configured</p>
                    <p className="text-xs text-muted-foreground mt-1">Add proxies to avoid rate limiting</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proxies.map((proxy: any) => (
                      <div key={proxy.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${proxy.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-sm font-medium">{proxy.host}:{proxy.port}</p>
                            <p className="text-xs text-muted-foreground">{proxy.protocol} {proxy.username && `• ${proxy.username}`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={proxy.isActive}
                            onCheckedChange={(checked) => toggleProxyMutation.mutate({ id: proxy.id, isActive: checked })}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this proxy?")) {
                                deleteProxyMutation.mutate(proxy.id);
                              }
                            }}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
              <DialogContent className="sm:max-w-[700px] border-none shadow-2xl bg-white">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Code size={20} className="text-indigo-600" />
                    Bulk Proxy Import
                  </DialogTitle>
                  <DialogDescription>
                    Paste an array of proxies in JSON format. Click the button below to see the required structure.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">JSON Array Payload</span>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[10px] uppercase font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      onClick={() => setBulkJsonInput(JSON.stringify(dummyProxiesJson, null, 2))}
                    >
                      Load Dummy Structure
                    </Button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-indigo-100 shadow-inner">
                    <Textarea 
                      className="min-h-[300px] font-mono text-[11px] bg-slate-50/50 border-none focus-visible:ring-0 leading-relaxed p-4" 
                      placeholder='[{ "host": "proxy1.example.com", "port": 8080, "protocol": "http" }, { "host": "proxy2.example.com", "port": 8080, "username": "user", "password": "pass", "protocol": "https" }]'
                      value={bulkJsonInput}
                      onChange={(e) => setBulkJsonInput(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="bg-slate-50 p-6 rounded-b-lg border-t border-slate-100">
                  <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest hover:bg-slate-200" onClick={() => setIsBulkImportOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => bulkImportMutation.mutate()} 
                    className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-indigo-100"
                    disabled={bulkImportMutation.isPending}
                  >
                    {bulkImportMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Import All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </>
  )
}
