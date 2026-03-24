'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getMyIntegrationsAction,
  connectIntegrationAction,
  disconnectIntegrationAction,
  getCompletedTasksAction,
  syncTaskToIntegrationAction,
} from '@/app/actions';
import {
  CheckCircle,
  XCircle,
  Lock,
  Link as LinkIcon,
  Unlink,
  Loader2,
  ExternalLink,
  ArrowRight,
  Plug,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface IntegrationItem {
  id: number;
  slug: string;
  name: string;
  featureFlag: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  oauthProvider: string | null;
  isActive: boolean;
  connected: boolean;
  connection: {
    id: number;
    isEnabled: boolean;
    config: any;
    lastSyncedAt: string | null;
    totalSynced: number;
    lastError: string | null;
  } | null;
  hasAccess: boolean;
  locked: boolean;
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [planType, setPlanType] = useState('free');
  const [isLoading, setIsLoading] = useState(true);
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  interface TaskItem {
    id: number;
    name: string;
    status: string;
    totalLeads: number;
    createdAt: string | number;
  }

  const loadIntegrations = async () => {
    setIsLoading(true);
    const res = await getMyIntegrationsAction();
    if (res.success) {
      const data = (res as any).data;
      setIntegrations(data.integrations);
      setPlanType(data.planType);
    }
    setIsLoading(false);
  };

  const loadCompletedTasks = async () => {
    const res = await getCompletedTasksAction();
    if (res.success) {
      setTasks((res as any).data);
    }
  };

  useEffect(() => {
    loadIntegrations();
    loadCompletedTasks();
  }, []);

  // Handle OAuth callback redirect params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      toast.success(`${connected} connected successfully!`);
      // Clean URL
      window.history.replaceState({}, '', '/integrations');
      loadIntegrations();
    }
    if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, '', '/integrations');
    }
  }, [searchParams]);

  const handleConnect = async (integration: IntegrationItem) => {
    if (integration.locked) {
      toast.error(`Upgrade your plan to use ${integration.name}`);
      return;
    }

    setSelectedIntegration(integration);

    if (integration.oauthProvider) {
      setConnectingSlug(integration.slug);
      try {
        const res = await fetch('/api/integrations/oauth/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: integration.slug }),
        });
        const data = await res.json();

        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || 'Failed to start OAuth flow');
          setConnectingSlug(null);
        }
      } catch (err) {
        toast.error('Failed to start OAuth flow');
        setConnectingSlug(null);
      }
      return;
    }

    // Webhook / API key based: show dialog
    setWebhookUrl('');
    setIsDialogOpen(true);
  };

  const handleConnectSubmit = async () => {
    if (!selectedIntegration) return;
    setConnectingSlug(selectedIntegration.slug);

    const res = await connectIntegrationAction(selectedIntegration.slug, {
      webhookUrl: webhookUrl || undefined,
    });

    if (res.success) {
      toast.success(`${selectedIntegration.name} connected successfully`);
      setIsDialogOpen(false);
      loadIntegrations();
    } else {
      toast.error((res as any).error || 'Failed to connect');
    }
    setConnectingSlug(null);
  };

  const handleSyncSubmit = async () => {
    if (!selectedIntegration || !selectedTask) return;

    setIsSyncing(true);
    try {
      const res = await syncTaskToIntegrationAction(
        selectedIntegration.connection!.id,
        selectedTask.id
      );

      if (res.success) {
        const data = (res as any).data;
        
        if (data.sheetUrl) {
          toast.success(
            <div className="flex flex-col gap-1">
              <span>Synced {data.leadsSynced} leads to {data.integrationName}</span>
              <a 
                href={data.sheetUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Open Google Sheet
              </a>
            </div>,
            { duration: 8000 }
          );
        } else {
          toast.success(`Synced ${data.leadsSynced} leads to ${data.integrationName}`);
        }
        
        setIsTaskModalOpen(false);
        setSelectedTask(null);

        // Refresh integration data to show updated sync stats
        loadIntegrations();
      } else {
        toast.error((res as any).error || 'Failed to sync leads');
      }
    } catch (err) {
      toast.error('An error occurred while syncing');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (integration: IntegrationItem) => {
    if (!integration.connection) return;
    if (!confirm(`Disconnect ${integration.name}?`)) return;

    const res = await disconnectIntegrationAction(integration.connection.id);
    if (res.success) {
      toast.success(`${integration.name} disconnected`);
      loadIntegrations();
    } else {
      toast.error((res as any).error || 'Failed to disconnect');
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

  const connectedCount = integrations.filter(i => i.connected).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50">
        <DashboardHeader activePage="dashboard" />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50">
      <DashboardHeader activePage="dashboard" />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-500">
            Connect LeadSpotter to your favorite tools. {connectedCount > 0 && `${connectedCount} integration${connectedCount > 1 ? 's' : ''} connected.`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
            </Badge>
            {planType === 'free' && (
              <a href="/pricing" className="text-xs text-indigo-600 font-semibold hover:underline">
                Upgrade for more integrations <ArrowRight size={12} className="inline" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className={`border transition-all ${integration.locked
                  ? 'opacity-60 border-gray-200'
                  : integration.connected
                    ? 'border-emerald-200 bg-emerald-50/30 shadow-sm'
                    : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'
                }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                      {integration.iconUrl && (
                        <img src={integration.iconUrl} alt={integration.name} className=" w-8 h-8 object-contain" />
                      )}

                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{integration.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {categoryLabel(integration.category)}
                        </Badge>
                        {integration.oauthProvider && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-indigo-600 border-indigo-200">
                            <Globe size={9} className="mr-0.5" /> OAuth
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {integration.locked ? (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Lock size={16} />
                      <span className="text-xs font-semibold">Locked</span>
                    </div>
                  ) : integration.connected ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                      <CheckCircle size={12} /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle size={12} /> Not Connected
                    </Badge>
                  )}
                </div>

                {integration.description && (
                  <p className="text-sm text-gray-500 mb-4">{integration.description}</p>
                )}

                {/* Connected state details */}
                {integration.connected && integration.connection && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4 p-3 bg-white/60 rounded-lg">
                    {integration.connection.lastSyncedAt && (
                      <span>Last synced: {new Date(integration.connection.lastSyncedAt).toLocaleDateString()}</span>
                    )}
                    <span>{integration.connection.totalSynced} leads synced</span>
                    {integration.connection.lastError && (
                      <span className="text-red-500 font-medium">{integration.connection.lastError}</span>
                    )}
                    {integration.slug === 'google-sheets' && integration.connection.config?.spreadsheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${integration.connection.config.spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Open Sheet
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleDisconnect(integration)}
                      >
                        <Unlink size={14} /> Disconnect
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setIsTaskModalOpen(true);
                        }}
                        className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <RefreshCw size={16} /> Sync Task
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleConnect(integration)}
                      disabled={connectingSlug === integration.slug}
                    >
                      {connectingSlug === integration.slug ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <LinkIcon size={16} />
                      )}
                      Connect {integration.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {integrations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Plug size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No integrations available</h3>
              <p className="text-sm text-gray-500">Contact your admin to set up integrations.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Connect Dialog for webhook/API key integrations */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.slug === 'webhook' || selectedIntegration?.slug === 'zapier' || selectedIntegration?.slug === 'make'
                ? 'Enter the webhook URL where lead data should be sent.'
                : 'Enter your API credentials to connect.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(selectedIntegration?.slug === 'webhook' || selectedIntegration?.slug === 'zapier' || selectedIntegration?.slug === 'make') ? (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Webhook URL</Label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="bg-muted/5 border-none shadow-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Lead data will be POSTed as JSON to this URL after each task completes.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  OAuth-based integrations will redirect you to authorize in a future update.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleConnectSubmit} disabled={connectingSlug !== null} className="bg-indigo-600 hover:bg-indigo-700 text-xs uppercase tracking-widest">
              {connectingSlug ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Selection Modal for Sync */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg md:text-xl font-bold">
              Sync Task
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select a completed task to sync leads to {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto !min-h-0 py-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No completed tasks found.</p>
                <p className="text-xs mt-1">Complete a task first to enable syncing.</p>
              </div>
            ) : (
              <div className="space-y-2 h-[20vh] p-1 overflow-auto">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedTask?.id === task.id
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{task.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {task.totalLeads} leads
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                        COMPLETED
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsTaskModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSyncSubmit}
              disabled={isSyncing || !selectedTask}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {isSyncing ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Syncing...</>
              ) : (
                <> Sync {selectedTask ? `${selectedTask.totalLeads} Leads` : 'Leads'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
