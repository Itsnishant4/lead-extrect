"use client"

import { useState } from "react"
import {
  getAllIntegrationsAdminAction,
  createIntegrationAction,
  updateIntegrationAction,
  toggleIntegrationAction,
  getPlanIntegrationMatrixAction,
  assignIntegrationToPlanAction,
  unassignIntegrationFromPlanAction,
  getIntegrationStatsAction,
  seedIntegrationsAction,
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
import {
  Plugs,
  Plus,
  PencilSimple,
  CheckCircle,
  XCircle,
  Lightning,
  Globe,
  ChartBar,
  LinkBreak,
} from "phosphor-react"
import { LoaderCircle, X, Check } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface IntegrationForm {
  slug: string;
  name: string;
  featureFlag: string;
  category: string;
  description: string;
  iconUrl: string;
  oauthProvider: string;
  sortOrder: number;
}

const defaultForm: IntegrationForm = {
  slug: "",
  name: "",
  featureFlag: "",
  category: "automation",
  description: "",
  iconUrl: "",
  oauthProvider: "",
  sortOrder: 0,
};

function isImageLogo(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

export default function AdminIntegrationsPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [formData, setFormData] = useState<IntegrationForm>({ ...defaultForm });

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: async () => {
      const res = await getAllIntegrationsAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-integration-stats'],
    queryFn: async () => {
      const res = await getIntegrationStatsAction();
      if (!res.success) return null;
      return (res as any).data;
    },
  });

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['admin-integration-matrix'],
    queryFn: async () => {
      const res = await getPlanIntegrationMatrixAction();
      if (!res.success) return null;
      return (res as any).data;
    },
  });

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setEditingIntegration(null);
  };

  const handleEdit = (integration: any) => {
    setEditingIntegration(integration);
    setFormData({
      slug: integration.slug || "",
      name: integration.name || "",
      featureFlag: integration.featureFlag || "",
      category: integration.category || "automation",
      description: integration.description || "",
      iconUrl: integration.iconUrl || "",
      oauthProvider: integration.oauthProvider || "",
      sortOrder: integration.sortOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingIntegration ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      featureFlag: editingIntegration ? prev.featureFlag : `Integration: ${name}`,
    }));
  };

  const createMutation = useMutation({
    mutationFn: createIntegrationAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Integration created");
        queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
        queryClient.invalidateQueries({ queryKey: ['admin-integration-matrix'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to create");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateIntegrationAction(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Integration updated");
        queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
        queryClient.invalidateQueries({ queryKey: ['admin-integration-matrix'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to update");
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleIntegrationAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Integration toggled");
        queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      } else {
        toast.error((res as any).error || "Failed to toggle");
      }
    },
  });

  const seedMutation = useMutation({
    mutationFn: seedIntegrationsAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Default integrations seeded");
        queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
        queryClient.invalidateQueries({ queryKey: ['admin-integration-matrix'] });
      } else {
        toast.error((res as any).error || "Failed to seed");
      }
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ featureFlag, planId }: { featureFlag: string; planId: number }) =>
      assignIntegrationToPlanAction(featureFlag, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integration-matrix'] });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: ({ featureFlag, planId }: { featureFlag: string; planId: number }) =>
      unassignIntegrationFromPlanAction(featureFlag, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integration-matrix'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Name is required"); return; }
    if (!formData.slug.trim()) { toast.error("Slug is required"); return; }
    if (!formData.featureFlag.trim()) { toast.error("Feature flag is required"); return; }

    if (editingIntegration) {
      updateMutation.mutate({ id: editingIntegration.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categoryLabel = (c: string) => {
    switch (c) {
      case 'crm': return 'CRM';
      case 'automation': return 'Automation';
      case 'export': return 'Export';
      case 'notification': return 'Notification';
      default: return c;
    }
  };

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
                <BreadcrumbPage>Integrations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          {integrations.length === 0 && (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Lightning size={16} />}
              Seed Defaults
            </Button>
          )}
          <Button size="sm" className="gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus size={16} />
            Add Integration
          </Button>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
              <p className="text-muted-foreground mt-1">
                Manage third-party integrations, assign them to plans, and monitor usage.
              </p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.activeConnections}</div>
                    <p className="text-xs text-muted-foreground">Active Connections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.totalSyncs24h}</div>
                    <p className="text-xs text-muted-foreground">Syncs (24h)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.successRate}%</div>
                    <p className="text-xs text-muted-foreground">Success Rate (7d)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{integrations.filter((i: any) => i.isActive).length}/{integrations.length}</div>
                    <p className="text-xs text-muted-foreground">Active Integrations</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="registry" className="space-y-6">
              <TabsList>
                <TabsTrigger value="registry">Integration Registry</TabsTrigger>
                <TabsTrigger value="matrix">Plan Assignment</TabsTrigger>
              </TabsList>

              {/* Tab 1: Registry */}
              <TabsContent value="registry">
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Integration Registry</CardTitle>
                    <CardDescription>All registered integrations. Toggle active/inactive, edit details.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Integration</TableHead>
                          <TableHead>Feature Flag</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>OAuth</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {integrations.map((integration: any) => (
                          <TableRow key={integration.id} className="hover:bg-muted/30 transition-colors">
<TableCell className="font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white overflow-hidden border border-slate-200">
                  {integration.iconUrl ? (
                    isImageLogo(integration.iconUrl) ? (
                      <img src={integration.iconUrl} alt={integration.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-base leading-none">{integration.iconUrl}</span>
                    )
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{integration.name?.charAt(0) || "?"}</span>
                  )}
                </div>
                                <div>
                                  <div>{integration.name}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{integration.slug}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-[10px]">{integration.featureFlag}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{categoryLabel(integration.category)}</Badge>
                            </TableCell>
                            <TableCell>
                              {integration.oauthProvider ? (
                                <Badge variant="outline" className="gap-1 text-indigo-600 border-indigo-200 bg-indigo-50">
                                  <Globe size={10} />
                                  {integration.oauthProvider}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 h-7"
                                onClick={() => toggleMutation.mutate(integration.id)}
                              >
                                {integration.isActive ? (
                                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                                    <CheckCircle size={12} /> Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="gap-1">
                                    <XCircle size={12} /> Inactive
                                  </Badge>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(integration)} title="Edit">
                                <PencilSimple size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {integrations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="h-[200px] text-center">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center border border-dashed border-slate-300">
                                  <Plugs size={32} className="text-muted-foreground/40" />
                                </div>
                                <p className="text-lg font-bold text-foreground">No integrations yet</p>
                                <p className="text-sm text-muted-foreground">Click "Seed Defaults" to add standard integrations, or "Add Integration" to create one.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Plan Assignment Matrix */}
              <TabsContent value="matrix">
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Plan Assignment Matrix</CardTitle>
                    <CardDescription>Toggle which integrations are available in each plan.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matrixLoading ? (
                      <div className="flex h-[200px] items-center justify-center">
                        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : matrixData ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="min-w-[200px]">Integration</TableHead>
                              {matrixData.plans.map((plan: any) => (
                                <TableHead key={plan.id} className="text-center min-w-[120px]">{plan.name}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {matrixData.matrix.map((row: any) => (
                              <TableRow key={row.integrationId}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span>{row.integrationName}</span>
                                    {!row.isActive && <Badge variant="secondary" className="text-[9px]">Inactive</Badge>}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-mono">{row.featureFlag}</div>
                                </TableCell>
                                {row.plans.map((planAssignment: any) => (
                                  <TableCell key={planAssignment.planId} className="text-center">
                                    <Switch
                                      checked={planAssignment.assigned}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          assignMutation.mutate({ featureFlag: row.featureFlag, planId: planAssignment.planId });
                                        } else {
                                          unassignMutation.mutate({ featureFlag: row.featureFlag, planId: planAssignment.planId });
                                        }
                                      }}
                                      className="data-[state=checked]:bg-indigo-600"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-8">No data. Add integrations first.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingIntegration ? "Edit Integration" : "Add Integration"}
            </DialogTitle>
            <DialogDescription>
              {editingIntegration ? "Update integration details." : "Register a new third-party integration."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Google Sheets"
                  className="bg-muted/5 border-none shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Slug</Label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="google-sheets"
                  className="bg-muted/5 border-none shadow-sm font-mono text-sm"
                  disabled={!!editingIntegration}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Feature Flag</Label>
                <Input
                  required
                  value={formData.featureFlag}
                  onChange={(e) => setFormData(prev => ({ ...prev, featureFlag: e.target.value }))}
                  placeholder="Integration: Google Sheets"
                  className="bg-muted/5 border-none shadow-sm font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                  <SelectTrigger className="bg-muted/5 border-none shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this integration"
                className="bg-muted/5 border-none shadow-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Logo URL / Icon</Label>
                <Input
                  value={formData.iconUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png or 📊"
                  className="bg-muted/5 border-none shadow-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Use an image URL for a hosted logo, or a short emoji/icon fallback.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">OAuth Provider</Label>
                <Select value={formData.oauthProvider} onValueChange={(val) => setFormData(prev => ({ ...prev, oauthProvider: val === 'none' ? '' : val }))}>
                  <SelectTrigger className="bg-muted/5 border-none shadow-sm">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Sort Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="bg-muted/5 border-none shadow-sm"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="font-bold text-xs uppercase tracking-widest" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="px-8 font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {editingIntegration ? "Save Changes" : "Create Integration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
