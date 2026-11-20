'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getAllSubscribersAction,
  sendNotificationToAllAction,
} from '@/app/actions';
import { Loader2, Users, Bell, Send, Search, Mail, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscribersPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      const res = await getAllSubscribersAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    },
    staleTime: 15_000,
    gcTime: 120_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: 30_000,
  });

  const filteredSubscribers = subscribers.filter((sub: any) =>
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendNotificationToAllAction(notifTitle, notifMessage);
      if (res.success) {
        toast.success(`Notification sent to ${(res as any).data.count} subscribers`);
        setIsDialogOpen(false);
        setNotifTitle('');
        setNotifMessage('');
      } else {
        toast.error((res as any).error || 'Failed to send notification');
      }
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-violet-100 text-violet-700',
    premium: 'bg-amber-100 text-amber-700',
    enterprise: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <>
      <header className={`flex transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <p className="text-sm font-bold">Subscribers</p>
            <p className="text-[10px] text-muted-foreground">Manage subscribers and send notifications</p>
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'}`}>
        <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
              <p className="text-muted-foreground mt-1">Manage subscribers and send notifications to all users.</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Bell size={16} />
              Send Notification
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{subscribers.length}</p>
                    <p className="text-xs text-muted-foreground">Total Subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Users size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{subscribers.filter((s: any) => !s.isSuspended).length}</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Users size={18} className="text-rose-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{subscribers.filter((s: any) => s.isSuspended).length}</p>
                    <p className="text-xs text-muted-foreground">Suspended Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscribers Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>All Subscribers</CardTitle>
                <CardDescription>Complete list of all registered users on the platform.</CardDescription>
                <div className="pt-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 max-w-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[250px]">User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Credits Used</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((sub: any) => (
                      <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {sub.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{sub.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{sub.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{sub.planType || 'free'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Zap size={12} className="text-amber-500" />
                            <span className="font-medium">{(sub.leadsExtracted || 0).toLocaleString()}</span>
                            <span className="text-muted-foreground">/ {(sub.bonusCredits || 0).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sub.createdAt ? format(new Date(sub.createdAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {sub.isSuspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredSubscribers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No subscribers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Send Notification Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell size={18} />
              Send Notification to All Subscribers
            </DialogTitle>
            <DialogDescription>
              This will send a notification to all {subscribers.length} active subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="Notification title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNotification} disabled={isSending} className="gap-2">
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send to {subscribers.length} Subscribers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
