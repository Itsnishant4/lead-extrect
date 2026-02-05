'use client';

import { 
  ClockCounterClockwise, 
  MapPin, 
  Trash,
  Calendar
} from 'phosphor-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getKeywordHistoryAction, deleteKeywordHistoryAction } from '@/app/actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAutomation } from '@/context/AutomationContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { loadKeywordSession } = useAutomation();
  const router = useRouter();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['keyword-history'],
    queryFn: async () => {
      const res = await getKeywordHistoryAction();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteKeywordHistoryAction(id);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("History entry deleted");
      queryClient.invalidateQueries({ queryKey: ['keyword-history'] });
    },
    onError: () => {
      toast.error("Failed to delete history");
    }
  });

  const deleteHistory = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Generation History"
        description="Reload previous keyword sets and restart campaigns in seconds."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "History" }]}
      >
        <Card className="border-border/60">
          <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className='gap-1 flex flex-col'>
              <CardTitle>Saved keyword batches</CardTitle>
              <CardDescription>Each batch can be re-used to kick off automation tasks.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            {history.length > 0 ? (
              <div className="rounded-xl border border-border/60 text-card-foreground shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[220px]">Automation Name</TableHead>
                      <TableHead>Niche</TableHead>
                      <TableHead className="text-center">Location</TableHead>
                      <TableHead className="text-center">Keywords</TableHead>
                      <TableHead className="text-center">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => {
                      const storedKeywords = JSON.parse(item.keywords);
                      const keywordCount = item.total_keywords ?? storedKeywords.length;
                      return (
                        <TableRow key={item.id} className="hover:bg-accent/30 transition-colors">
                          <TableCell className="py-4">
                            <div className="truncate max-w-[220px]" title={item.name}>
                              <span className="font-semibold text-foreground">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="truncate max-w-[150px]" title={item.niche}>
                              <Badge variant="secondary" className="px-2 py-0.5 h-6 text-[10px] font-bold">
                                {item.niche}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center overflow-hidden gap-1 flex justify-center items-center">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm text-muted-foreground w-[150px] text-left truncate">
                              {item.location}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium">{keywordCount}</span>
                              {item.keywords_truncated && (
                                <Badge variant="outline" className="text-[10px]">Truncated</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 opacity-70">
                              <Calendar className="h-3.5 w-3.5" /> {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 pr-3 pl-2 gap-1.5 text-xs font-semibold"
                                onClick={() => {
                                  loadKeywordSession(item.name, item.niche || '', storedKeywords);
                                  if (item.keywords_truncated) {
                                    toast.info("Loaded preview keywords only.", {
                                      description: "Regenerate to get the full list."
                                    });
                                  }
                                  toast.info(`Loaded generation: ${item.name}`);
                                  router.push('/keywords');
                                }}
                              >
                                <ClockCounterClockwise className="h-3.5 w-3.5" />
                                Load
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteHistory(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : !isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground">
                <div className="p-5 rounded-full bg-muted/30 mb-5">
                  <ClockCounterClockwise className="h-10 w-10 opacity-30" />
                </div>
                <p className="text-lg font-semibold">No Generation History</p>
                <p className="text-sm opacity-60">Your generated keywords will appear here for later use.</p>
              </div>
            ) : (
              <LoadingSpinner message="Loading history..." />
            )}
          </CardContent>
        </Card>
      </AppPage>
    </>
  );
}
