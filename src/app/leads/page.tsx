'use client';

import React, { useState, useEffect } from 'react';
import { useAutomation } from '@/context/AutomationContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import {
  searchLeadsAction,
  getLeadsAction,
  createSavedListFromLeadsAction,
  createSavedListAction
} from '@/app/actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search, CheckCircle, Globe, Zap, ArrowLeft, Download, BookmarkPlus,
  Store, MapPin, Mail, Phone, Star, ExternalLink, MoreVertical,
} from 'lucide-react';

export default function LeadsPage() {
  const { user } = useAutomation();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | undefined>(undefined);
  const [liveLeads, setLiveLeads] = useState<any[]>([]);
  const [listName, setListName] = useState('');
  const [isSavingList, setIsSavingList] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearchInternal(q);
    }
  }, [searchParams]);

  const { data: storedLeads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads', searchId],
    queryFn: async () => {
      const res = await getLeadsAction(searchId);
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    },
    enabled: !!searchId && liveLeads.length === 0
  });

  const searchMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await searchLeadsAction(q);
      if (!res.success) throw new Error((res as any).error);
      return res;
    },
    onSuccess: (res: any) => {
      toast.success(`Found ${res.count} leads`);
      setSearchId(res.searchId as number);
      setLiveLeads(res.leads || []);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(`Search failed: ${error.message}`);
    }
  });

  const isLoading = searchMutation.isPending || isLoadingLeads;
  const leads = liveLeads.length > 0 ? liveLeads : storedLeads;

  const handleSearchInternal = (q: string) => {
    if (!q.trim()) return;
    setHasSearched(true);
    setLiveLeads([]);
    searchMutation.mutate(q);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    handleSearchInternal(searchQuery);
  };

  const resetSearch = () => {
    setHasSearched(false);
    setSearchQuery('');
    setLiveLeads([]);
    setSearchId(undefined);
  };

  const downloadCSV = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating', 'Reviews'];
    const rows = leads.map((lead: any) => [
      lead.name || '', lead.phone || '', lead.email || '', lead.website || '',
      lead.address || '', lead.rating || '', lead.reviews_count || ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => {
        let str = String(cell);
        if (/^[=+\-@]/.test(str)) str = "'" + str;
        return `"${str.replace(/"/g, '""')}"`;
      }).join(','))
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
    if (!listName.trim()) { toast.error("Please enter a list name"); return; }
    setIsSavingList(true);
    let res;
    if (liveLeads.length > 0) {
      res = await createSavedListFromLeadsAction(listName.trim(), liveLeads);
    } else {
      const leadIds = leads.map((l: any) => l.id).filter(Boolean);
      if (leadIds.length === 0) { toast.error("No leads to save"); setIsSavingList(false); return; }
      res = await createSavedListAction(listName.trim(), leadIds);
    }
    if (res.success) { toast.success("List saved"); setListName(""); }
    else { toast.error((res as any).error || "Failed to save list"); }
    setIsSavingList(false);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 text-foreground">
      <DashboardHeader activePage="search" navStyle="logoDashboard"/>

      {!hasSearched ? (
        <main className="flex-1 flex items-center justify-center px-4 md:px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px] -z-10" />
          
          <div className="w-full max-w-2xl text-center z-10 flex flex-col items-center">
            <div className="mb-10">
              <h1 className="text-3xl serif-font sm:text-5xl md:text-6xl font-medium tracking-tight text-indigo-950 mb-4">Find your next customer</h1>
              <p className="italic text-slate-500 text-base sm:text-lg md:text-xl opacity-80">Extract high-intent B2B leads from any location instantly.</p>
            </div>

            <form onSubmit={handleSearch} className="w-full glass-card rounded-full p-2 flex items-center focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all duration-300">
              <div className="pl-5 text-slate-400"><Search size={20} /></div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 bg-transparent border-none focus:ring-0 text-lg text-indigo-950 outline-none"
                placeholder="e.g. Dentists in New York"
                type="text"
              />
              <button disabled={isLoading} className="gradient-button text-white px-8 py-4 rounded-full font-semibold">
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-slate-400 w-full mb-1">Try a popular niche:</span>
              {['Real Estate Agents', 'Software Companies', 'Dentists', 'Restaurants', 'Digital Marketing'].map((niche) => (
                <button
                  key={niche}
                  onClick={() => {
                    setSearchQuery(`${niche} in Mumbai`);
                    handleSearchInternal(`${niche} in Mumbai`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/50 border border-indigo-100 text-[11px] font-medium text-indigo-600 hover:bg-white hover:border-indigo-300 transition-all"
                >
                  {niche}
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-8">
              {['Verified Emails', 'Worldwide Data', 'Direct Export'].map(badge => (
                <div key={badge} className="flex items-center gap-2 text-xs font-semibold text-slate-500/80 uppercase tracking-wider">
                  <CheckCircle size={14} className="text-indigo-500" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 pt-24 px-4 md:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <button onClick={resetSearch} className="text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 mb-4">
                  <ArrowLeft size={18} /> New search
                </button>
                <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-indigo-950">Results for "{searchQuery}"</h1>
                <p className="text-slate-500 mt-2 text-sm">{isLoading ? 'Searching...' : `${leads.length} leads found`}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={downloadCSV} className="flex items-center gap-1.5 px-4 py-2.5 bg-white/70 backdrop-blur border border-white/40 rounded-xl text-sm font-semibold shadow-sm">
                  <Download size={14} /> Export CSV
                </button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="gradient-button flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-bold rounded-xl">
                      <BookmarkPlus size={14} /> Save List
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save leads to list</DialogTitle>
                      <DialogDescription>Give this list a name for quick access later.</DialogDescription>
                    </DialogHeader>
                    <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="e.g. Q1 Outreach" className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none text-sm" />
                    <DialogFooter>
                      <button onClick={handleSaveList} disabled={isSavingList} className="gradient-button w-full text-white py-3 rounded-xl font-bold">
                        {isSavingList ? "Saving..." : "Save list"}
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div className="py-32 flex flex-col items-center gap-4">
                <LoadingSpinner />
                <p className="text-slate-400 text-sm font-medium animate-pulse">Extracting leads...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <div className="col-span-4">Business</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2 text-center">Rating</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {leads.map((lead: any, index: number) => (
                  <div key={index} className="group glass-card rounded-2xl p-4 md:px-6 md:py-4 transition-all hover:shadow-md grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    <div className="md:col-span-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Store size={20} /></div>
                      <div>
                        <h3 className="font-semibold text-indigo-950">{lead.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5"><MapPin size={14} className="text-slate-400" /><span className="text-xs text-slate-500">{lead.city || 'Unknown'}</span></div>
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /><span className="text-xs truncate">{lead.email || lead.website_email || 'Not found'}</span></div>
                      <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /><span className="text-xs">{lead.phone || 'No phone'}</span></div>
                    </div>
                    <div className="md:col-span-2 md:text-center flex md:block items-center gap-3">
                      <div className="inline-flex items-center gap-1.5"><Star size={14} className="text-amber-500 fill-amber-500" /><span className="text-sm font-semibold">{lead.rating || '-'}</span></div>
                      <p className="text-[10px] text-slate-400">{lead.reviews_count || 0} reviews</p>
                    </div>
                    <div className="md:col-span-3 flex md:justify-end items-center gap-3">
                      {lead.website && (
                        <a href={lead.website} target="_blank" className="gradient-button px-4 py-2 text-white text-xs font-bold rounded-lg">VISIT</a>
                      )}
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreVertical size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
