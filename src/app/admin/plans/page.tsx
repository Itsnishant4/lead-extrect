"use client"

import { useState } from "react"
import {
  getAllPlansAdminAction,
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  permanentDeletePlanAction
} from "@/app/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  Lightning,
  Gift,
  Phone
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
  BreadcrumbSeparator
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

type PlanPeriod = "month" | "one-time" | "free" | "custom";

interface FormState {
  name: string;
  description: string;
  price: number;
  discount: number;
  period: PlanPeriod;
  leadsCredits: number;
  maxConcurrentTasks: number;
  features: string[];
  unavailableFeatures: string[];
  whatsappUrl: string;
  badge: string;
  sortOrder: number;
  isActive: boolean;
}

const defaultForm: FormState = {
  name: "",
  description: "",
  price: 0,
  discount: 0,
  period: "month",
  leadsCredits: 0,
  maxConcurrentTasks: 1,
  features: [],
  unavailableFeatures: [],
  whatsappUrl: "",
  badge: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const res = await getAllPlansAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newFeature, setNewFeature] = useState("");
  const [newUnavailable, setNewUnavailable] = useState("");
  const [formData, setFormData] = useState<FormState>({ ...defaultForm });

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setEditingPlan(null);
    setNewFeature("");
    setNewUnavailable("");
  };

  const openFreePreset = () => {
    resetForm();
    setFormData({
      ...defaultForm,
      name: "Starter",
      description: "Perfect for testing and small projects.",
      price: 0,
      period: "free",
      leadsCredits: 500,
      maxConcurrentTasks: 1,
      features: ["Up to 500 leads", "Localized search by area", "Basic email extraction", "Standard support"],
      unavailableFeatures: ["Priority support", "Bulk export history", "Advanced social enrichment", "API access"],
      badge: "",
    });
    setIsDialogOpen(true);
  };

  const openCustomPreset = () => {
    resetForm();
    setFormData({
      ...defaultForm,
      name: "Enterprise",
      description: "Scale without limits for your entire team.",
      price: 0,
      period: "custom",
      leadsCredits: 999999,
      maxConcurrentTasks: 5,
      features: ["Unlimited leads extraction", "Full API access", "Dedicated account manager", "Custom integration support"],
      unavailableFeatures: [],
      whatsappUrl: "https://wa.me/919773005701?text=Hi, I am interested in the Enterprise plan.",
      badge: "Enterprise",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price || 0,
      discount: plan.discount || 0,
      period: plan.period || "month",
      leadsCredits: plan.leadsCredits || 0,
      maxConcurrentTasks: plan.maxConcurrentTasks ?? 1,
      features: plan.features || [],
      unavailableFeatures: plan.unavailableFeatures || [],
      whatsappUrl: plan.whatsappUrl || "",
      badge: plan.badge || "",
      sortOrder: plan.sortOrder ?? 0,
      isActive: plan.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (formData.features.includes(trimmed)) { toast.error("Feature already added"); return; }
    setFormData(prev => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addUnavailable = () => {
    const trimmed = newUnavailable.trim();
    if (!trimmed) return;
    if (formData.unavailableFeatures.includes(trimmed)) { toast.error("Already added"); return; }
    setFormData(prev => ({ ...prev, unavailableFeatures: [...prev.unavailableFeatures, trimmed] }));
    setNewUnavailable("");
  };

  const removeUnavailable = (index: number) => {
    setFormData(prev => ({ ...prev, unavailableFeatures: prev.unavailableFeatures.filter((_, i) => i !== index) }));
  };

  const createMutation = useMutation({
    mutationFn: createPlanAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Plan created");
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to create plan");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updatePlanAction(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Plan updated");
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to update plan");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlanAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Plan deactivated");
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      } else {
        toast.error((res as any).error || "Failed to deactivate plan");
      }
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: permanentDeletePlanAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Plan permanently deleted");
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      } else {
        toast.error((res as any).error || "Failed to delete plan permanently");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Plan name is required"); return; }
    if (formData.period !== 'free' && formData.period !== 'custom' && formData.price <= 0) {
      toast.error("Price must be greater than 0 for paid plans"); return;
    }
    if (formData.leadsCredits <= 0) { toast.error("Credits must be greater than 0"); return; }

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const periodLabel = (p: string) => {
    switch (p) {
      case 'free': return 'Free';
      case 'custom': return 'Custom';
      case 'one-time': return 'One-Time';
      default: return 'Monthly';
    }
  };

  const isFreeOrCustom = formData.period === 'free' || formData.period === 'custom';

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
                <BreadcrumbPage>Plans & Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={openFreePreset}>
            <Gift size={16} />
            Free Plan
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={openCustomPreset}>
            <Phone size={16} />
            Custom Plan
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus size={16} />
            Paid Plan
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
              <h2 className="text-3xl font-bold tracking-tight">Plans & Pricing</h2>
              <p className="text-muted-foreground mt-1">
                Create and manage subscription plans. Add free, paid, or custom "Contact Sales" plans.
              </p>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>All Plans</CardTitle>
                <CardDescription>Manage your subscription tiers, free plans, and custom enterprise plans.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Concurrency</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan: any) => (
                      <TableRow key={plan.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              plan.period === 'free' ? 'bg-emerald-500/10 text-emerald-600' :
                              plan.period === 'custom' ? 'bg-violet-500/10 text-violet-600' :
                              'bg-indigo-500/10 text-indigo-600'
                            }`}>
                              {plan.period === 'free' ? <Gift size={16} /> : plan.period === 'custom' ? <Phone size={16} /> : <CreditCard size={16} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {plan.name}
                                {plan.badge && <Badge variant="outline" className="text-[9px] px-1.5 py-0">{plan.badge}</Badge>}
                              </div>
                              {plan.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-lg tabular-nums">
                          {plan.period === 'free' ? (
                            <span className="text-emerald-600">Free</span>
                          ) : plan.period === 'custom' ? (
                            <span className="text-violet-600">Custom</span>
                          ) : (
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-1.5">
                                <span>₹{plan.price}</span>
                                {plan.discount > 0 && plan.discount > plan.price && (
                                  <span className="text-xs text-muted-foreground line-through font-normal">₹{plan.discount}</span>
                                )}
                              </div>
                              {plan.discount > 0 && plan.discount > plan.price && (
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {Math.round(((plan.discount - plan.price) / plan.discount) * 100)}% off
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${
                            plan.period === 'free' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                            plan.period === 'custom' ? 'border-violet-200 text-violet-600 bg-violet-50' : ''
                          }`}>
                            {periodLabel(plan.period)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="tabular-nums">
                            {plan.period === 'custom' ? 'Unlimited' : `${plan.leadsCredits?.toLocaleString()} leads`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="tabular-nums font-mono text-xs text-slate-500 bg-slate-50">
                            {plan.maxConcurrentTasks || 1} {plan.maxConcurrentTasks === 1 ? 'task' : 'tasks'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {(plan.features || []).slice(0, 2).map((f: string, i: number) => (
                              <Badge key={`f-${i}`} variant="outline" className="text-[10px] gap-1">
                                <Check size={8} className="text-emerald-500" />{f}
                              </Badge>
                            ))}
                            {(plan.unavailableFeatures || []).slice(0, 1).map((f: string, i: number) => (
                              <Badge key={`u-${i}`} variant="outline" className="text-[10px] gap-1 text-muted-foreground line-through">
                                <X size={8} className="text-rose-400" />{f}
                              </Badge>
                            ))}
                            {((plan.features?.length || 0) + (plan.unavailableFeatures?.length || 0)) > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{(plan.features?.length || 0) + (plan.unavailableFeatures?.length || 0) - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan.isActive ? (
                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                              <CheckCircle size={12} />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle size={12} />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 text-primary">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(plan)} title="Edit Plan">
                              <PencilSimple size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${plan.isActive ? 'text-orange-500' : 'text-emerald-500'}`}
                              onClick={() => {
                                if (confirm(`${plan.isActive ? 'Deactivate' : 'Activate'} this plan?`)) {
                                  updateMutation.mutate({ id: plan.id, data: { isActive: !plan.isActive } });
                                }
                              }}
                              title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
                            >
                              {plan.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                if (confirm("PERMANENTLY DELETE this plan? This action cannot be undone and may fail if transactions exist.")) {
                                  permanentDeleteMutation.mutate(plan.id);
                                }
                              }}
                              title="Permanent Delete"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {plans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-[300px] text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center border border-dashed border-slate-300">
                              <CreditCard size={32} className="text-muted-foreground/40" />
                            </div>
                            <p className="text-lg font-bold text-foreground">No plans yet</p>
                            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
                              Use the buttons above to create a Free, Paid, or Custom plan.
                            </p>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto flex flex-col p-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-muted/20">
            <DialogTitle className="text-2xl font-bold">
              {editingPlan ? "Edit Plan" : formData.period === 'free' ? "Create Free Plan" : formData.period === 'custom' ? "Create Custom Plan" : "Create Paid Plan"}
            </DialogTitle>
            <DialogDescription>
              {formData.period === 'free'
                ? "A free plan for new users. Price is always 0."
                : formData.period === 'custom'
                ? "A contact-sales plan with a WhatsApp link."
                : "Set up a paid subscription or one-time purchase plan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 px-6 py-4 space-y-6">
              {/* Name & Description */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Plan Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Pro, Premium, Starter"
                    className="bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Best for growing teams"
                    className="bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Price, Period, Credits, Badge */}
              <div className={`grid gap-4 p-4 bg-muted/10 rounded-2xl ${isFreeOrCustom ? 'md:grid-cols-3' : 'md:grid-cols-3'}`}>
                {!isFreeOrCustom && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Price (INR)</Label>
                    <Input
                      type="number"
                      required
                      min={1}
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder="999"
                      className="h-9 text-sm bg-background border-none shadow-sm"
                    />
                  </div>
                )}
                {!isFreeOrCustom && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Original Price (Discount)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.discount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                      placeholder="1499 (strikethrough price, 0 = no discount)"
                      className="h-9 text-sm bg-background border-none shadow-sm"
                    />
                    <p className="text-[9px] text-muted-foreground">Set higher than price to show as crossed-out original price</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Billing Period</Label>
                  <Select value={formData.period} onValueChange={(val) => setFormData(prev => ({ ...prev, period: val as PlanPeriod, price: val === 'free' || val === 'custom' ? 0 : prev.price }))}>
                    <SelectTrigger className="h-9 text-sm bg-background border-none shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="one-time">One-Time</SelectItem>
                      <SelectItem value="custom">Custom (Contact Sales)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Lead Credits</Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formData.leadsCredits || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadsCredits: parseInt(e.target.value) || 0 }))}
                    placeholder="5000"
                    className="h-9 text-sm bg-background border-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Max Concurrent Tasks</Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formData.maxConcurrentTasks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrentTasks: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                    className="h-9 text-sm bg-background border-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Badge (optional)</Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="Most Popular"
                    className="h-9 text-sm bg-background border-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Sort Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0 = first"
                    className="h-9 text-sm bg-background border-none shadow-sm"
                  />
                  <p className="text-[9px] text-muted-foreground">Lower number = shown first</p>
                </div>
              </div>

              {/* WhatsApp URL for custom plans */}
              {formData.period === 'custom' && (
                <div className="space-y-2 p-4 bg-violet-50 dark:bg-violet-950/30 rounded-2xl border border-violet-200 dark:border-violet-800">
                  <Label className="text-[10px] font-black uppercase text-violet-500">WhatsApp / Contact URL</Label>
                  <Input
                    value={formData.whatsappUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappUrl: e.target.value }))}
                    placeholder="https://wa.me/919773005701?text=Hi..."
                    className="bg-white dark:bg-background border-none shadow-sm text-sm"
                  />
                  <p className="text-[10px] text-violet-400">Users will be redirected to this URL instead of payment gateway.</p>
                </div>
              )}

              {/* Included Features */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Lightning size={14} className="text-emerald-500" />
                  Included Features (shown with checkmark)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="e.g. Email Enrichment, Priority Support"
                    className="bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addFeature} className="shrink-0 gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1.5 py-1 px-3 text-sm bg-white dark:bg-background">
                        <Check size={12} className="text-emerald-500" />
                        {feature}
                        <button type="button" onClick={() => removeFeature(index)} className="ml-1 hover:text-destructive transition-colors">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Unavailable Features */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <XCircle size={14} className="text-rose-400" />
                  Unavailable Features (shown with X mark)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newUnavailable}
                    onChange={(e) => setNewUnavailable(e.target.value)}
                    placeholder="e.g. API access, White-label"
                    className="bg-muted/5 border-none shadow-sm focus-visible:ring-rose-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUnavailable(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addUnavailable} className="shrink-0 gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>
                {formData.unavailableFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900">
                    {formData.unavailableFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1.5 py-1 px-3 text-sm bg-white dark:bg-background text-muted-foreground line-through">
                        <X size={12} className="text-rose-400 no-underline" />
                        {feature}
                        <button type="button" onClick={() => removeUnavailable(index)} className="ml-1 hover:text-destructive transition-colors no-underline">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Plan Status</Label>
                  <p className="text-[10px] font-medium text-indigo-600/60 uppercase">
                    {formData.isActive ? "Visible on pricing page" : "Hidden from users"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black tracking-widest ${formData.isActive ? "text-indigo-600" : "text-slate-400"}`}>
                    {formData.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-3 border-t bg-muted/10">
              <Button type="button" variant="ghost" className="font-bold text-xs uppercase tracking-widest" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              <Button type="submit" className="px-8 font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
