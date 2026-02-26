"use client";

import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedListsAction, getSavedListLeadsAction, getExportTemplatesAction, createExportTemplateAction } from "@/app/actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DEFAULT_COLUMNS = [
  "name",
  "category",
  "city",
  "rating",
  "reviews_count",
  "phone",
  "website",
  "email",
  "address",
];
const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  category: "Category",
  city: "City",
  rating: "Rating",
  reviews_count: "Reviews",
  phone: "Phone",
  website: "Website",
  email: "Email",
  address: "Address",
  lead_score: "Score",
  website_email: "Website Email",
  website_phone: "Website Phone",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
};
const ALL_COLUMNS = Object.keys(COLUMN_LABELS);

export default function SavedListsPage() {
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [templateId, setTemplateId] = useState<string>("default");
  const [templateName, setTemplateName] = useState("");
  const [templateColumns, setTemplateColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ["saved-lists"],
    queryFn: async () => {
      const res = await getSavedListsAction();
      if (res.success && 'data' in res) {
        return (res.data as any[]) || [];
      }
      return [];
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["export-templates"],
    queryFn: async () => {
      const res = await getExportTemplatesAction();
      if (res.success && 'data' in res) {
        return (res.data as any[]) || [];
      }
      return [];
    },
  });

  const { data: listLeads = [] } = useQuery({
    queryKey: ["saved-list-leads", activeListId],
    enabled: !!activeListId,
    queryFn: async () => {
      const res = await getSavedListLeadsAction(activeListId as number);
      if (res.success && 'data' in res) {
        return (res.data as any[]) || [];
      }
      return [];
    },
  });

  const selectedTemplate = useMemo(() => {
    if (templateId === "default") return { name: "Default", columns: JSON.stringify(DEFAULT_COLUMNS) };
    return templates.find((t: any) => String(t.id) === templateId);
  }, [templateId, templates]);

  const handleExport = () => {
    if (!activeListId) {
      toast.error("Select a list first");
      return;
    }
    if (!listLeads.length) {
      toast.error("This list is empty");
      return;
    }

    const columns = selectedTemplate?.columns ? JSON.parse(selectedTemplate.columns) : DEFAULT_COLUMNS;

    const headers = columns.map((c: string) => c);
    const rows = listLeads.map((lead: any) => columns.map((c: string) => lead[c] ?? ""));

    const csvContent = [headers, ...rows]
      .map((row: any[]) => row.map((s) => {
        let str = String(s);
        if (/^[=+\-@]/.test(str)) str = "'" + str;
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `saved_list_${activeListId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported list");
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Enter a template name");
      return;
    }
    if (templateColumns.length === 0) {
      toast.error("Select at least one column");
      return;
    }
    setSavingTemplate(true);
    const res = await createExportTemplateAction(templateName.trim(), templateColumns);
    if (res.success) {
      toast.success("Template created");
      setTemplateName("");
      queryClient.invalidateQueries({ queryKey: ["export-templates"] });
    } else {
      toast.error((res as any).error || "Failed to create template");
    }
    setSavingTemplate(false);
  };

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Saved Lists"
        description="Organize leads into reusable lists and export with templates."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Saved Lists" }]}
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Your lists</CardTitle>
              <CardDescription>Select a list to review and export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lists.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                  No lists yet. Save a list from the Lead Extractor page.
                </div>
              )}
              {lists.map((list: any) => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(Number(list.id))}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    activeListId === Number(list.id)
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-muted/10 hover:bg-muted/30"
                  }`}
                >
                  <div className="text-sm font-semibold">{list.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Number(list.lead_count || 0)} leads
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Choose a template to export your list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Template</label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {templates.map((tpl: any) => (
                      <SelectItem key={tpl.id} value={String(tpl.id)}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Create template</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New export template</DialogTitle>
                      <DialogDescription>Select the columns to include.</DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="Template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {ALL_COLUMNS.map((col) => (
                        <label key={col} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={templateColumns.includes(col)}
                            onCheckedChange={(checked) => {
                              setTemplateColumns((prev) =>
                                checked ? [...prev, col] : prev.filter((c) => c !== col)
                              );
                            }}
                          />
                          {COLUMN_LABELS[col]}
                        </label>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateTemplate} disabled={savingTemplate}>
                        {savingTemplate ? "Saving..." : "Save template"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleExport} className="w-full">
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeListId && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>List preview</CardTitle>
              <CardDescription>
                Showing {listLeads.length} leads from the selected list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[220px]">Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listLeads.map((item: any) => {
                      const lead = item.lead || item;
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.category || "-"}</TableCell>
                          <TableCell>{lead.city || "-"}</TableCell>
                          <TableCell>{lead.rating || "-"}</TableCell>
                          <TableCell>{lead.leadScore ?? lead.lead_score ?? "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {listLeads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          This list has no leads yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </AppPage>
    </>
  );
}
