'use client';

import { useState } from 'react';
import { MagnifyingGlass, MapPin, Phone, Star, Globe, DownloadSimple, Sparkle } from 'phosphor-react';
import { LoaderCircle } from "lucide-react";
import {
  searchLeadsAction,
  getLeadsAction,
  createSavedListFromLeadsAction,
  createSavedListAction,
} from '@/app/actions';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { AppPage } from '@/components/AppPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [searchId, setSearchId] = useState<number | undefined>(undefined);
  const [liveLeads, setLiveLeads] = useState<any[]>([]);
  const [listName, setListName] = useState('');
  const [isSavingList, setIsSavingList] = useState(false);

  const { data: storedLeads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads', searchId],
    queryFn: async () => {
      const res = await getLeadsAction(searchId);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!searchId && liveLeads.length === 0
  });

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await searchLeadsAction(searchQuery);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: (res: any) => {
      toast.success(`Found ${res.count} leads`);
      setSearchId(res.searchId as number);
      setLiveLeads(res.leads || []);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // Invaliding users usage
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(`Search failed: ${error.message}`);
    }
  });

  const isLoading = searchMutation.isPending || isLoadingLeads;
  const leads = liveLeads.length > 0 ? liveLeads : storedLeads;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setLiveLeads([]);
    searchMutation.mutate(query);
  };

  const downloadCSV = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating', 'Reviews'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.address || '',
      lead.rating || '',
      lead.reviews_count || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${leads.length} leads`);
  };

  const handleSaveList = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    setIsSavingList(true);
    let res;
    if (liveLeads.length > 0) {
      res = await createSavedListFromLeadsAction(listName.trim(), liveLeads);
    } else {
      const leadIds = leads.map((l: any) => l.id).filter(Boolean);
      if (leadIds.length === 0) {
        toast.error("No leads to save");
        setIsSavingList(false);
        return;
      }
      res = await createSavedListAction(listName.trim(), leadIds);
    }
    if (res.success) {
      toast.success("List saved");
      setListName("");
    } else {
      toast.error(res.error || "Failed to save list");
    }
    setIsSavingList(false);
  };

  const exampleQueries = [
    "Dentist in New York",
    "Cafes in Austin",
    "Plumbers in Chicago",
  ];

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Lead Extractor"
        description="Find and export high-quality business leads from Google Maps in minutes."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Lead Extractor" }]}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MagnifyingGlass className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Start a new extraction</CardTitle>
                  <CardDescription>
                    Type a search query and let us collect contacts, websites, and ratings.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Dentists in New York"
                  className="h-12 text-base"
                />
                <Button type="submit" className="h-12 gap-2">
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MagnifyingGlass className="h-4 w-4" />}
                  Search leads
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Sparkle className="h-3.5 w-3.5" />
                Quick examples:
                {exampleQueries.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setQuery(ex)}
                    className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs hover:bg-muted/50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Export options</CardTitle>
              <CardDescription>Download or save lists for outreach.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={downloadCSV}>
                <DownloadSimple className="h-4 w-4" />
                Download CSV
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Save to list</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save leads to list</DialogTitle>
                    <DialogDescription>Give this list a name for quick access later.</DialogDescription>
                  </DialogHeader>
                  <Input
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g. Q1 Outreach"
                  />
                  <DialogFooter>
                    <Button onClick={handleSaveList} disabled={isSavingList}>
                      {isSavingList ? "Saving..." : "Save list"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 mt-6">
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>Review, export, or save your results.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner message="Fetching leads..." />
            ) : leads.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No leads yet.</div>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: any, index: number) => (
                      <TableRow key={`${lead.place_id || lead.placeId || index}`}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>{lead.email || lead.website_email || '-'}</TableCell>
                        <TableCell>
                          {lead.website ? (
                            <a href={lead.website} target="_blank" className="text-primary underline underline-offset-4">
                              Website
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{lead.rating || '-'}</TableCell>
                        <TableCell>{lead.reviews_count || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <MapPin className="inline h-3.5 w-3.5 mr-1" />
                          {lead.city || lead.address || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </AppPage>
    </>
  );
}
