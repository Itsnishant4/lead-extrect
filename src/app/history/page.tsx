'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  Trash2,
  Calendar
} from 'lucide-react';
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
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadKeywordSession } = useAutomation();
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const res = await getKeywordHistoryAction();
    if (res.success) setHistory(res.data || []);
    setIsLoading(false);
  };

  const deleteHistory = async (id: number) => {
    const res = await deleteKeywordHistoryAction(id);
    if (res.success) {
      toast.success("History entry deleted");
      loadHistory();
    } else {
      toast.error("Failed to delete history");
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Generation History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 max-w-[76rem] w-full">
          <div className="space-y-8 animate-in fade-in duration-700">
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">Generation History</CardTitle>
                <CardDescription>
                  View and reload your previous keyword generations into the Bulk Generator.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 mt-6">
                {history.length > 0 ? (
                  <div className="rounded-sm border text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b bg-muted/50">
                          <TableHead className="w-[200px]">Automation Name</TableHead>
                          <TableHead>Niche</TableHead>
                          <TableHead className="text-center">Location</TableHead>
                          <TableHead className="text-center">Keywords</TableHead>
                          <TableHead className="text-center">Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((item) => {
                          const keywordCount = JSON.parse(item.keywords).length;
                          return (
                            <TableRow key={item.id} className="hover:bg-accent/5 transition-colors">
                              <TableCell className="py-4">
                                <span className="font-semibold text-foreground">{item.name}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="px-2 py-0.5 h-6 text-[10px]   font-bold">
                                  {item.niche}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center overflow-hidden gap-1 flex  justify-center items-center">
                                  <MapPin className="h-3.5 w-3.5" /> 
                                <span className="text-sm text-muted-foreground w-[150px] text-left truncate">
                                  {item.location}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-medium">{keywordCount}</span>
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
                                    className="h-8 pr-3 pl-2 gap-1.5 text-xs font-semibold  transition-all"
                                    onClick={() => {
                                      loadKeywordSession(item.name, item.niche || '', JSON.parse(item.keywords));
                                      toast.info(`Loaded generation: ${item.name}`);
                                      router.push('/keywords');
                                    }}
                                  >
                                    <History className="h-3.5 w-3.5" />
                                    Load
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 "
                                    onClick={() => deleteHistory(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
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
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/5 text-muted-foreground transition-all">
                    <div className="p-5 rounded-full bg-muted/10 mb-5">
                      <History className="h-10 w-10 opacity-30" />
                    </div>
                    <p className="text-lg font-semibold">No Generation History</p>
                    <p className="text-sm opacity-60">Your generated keywords will appear here for later use.</p>
                  </div>
                ) : (
                  <LoadingSpinner message="Loading history..." />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
