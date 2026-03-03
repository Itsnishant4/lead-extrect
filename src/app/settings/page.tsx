'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Trash, 
  ShieldWarning, 
  SquaresFour,
  Bell,
  BellSlash
} from 'phosphor-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  wipeAllLeadsAction,
  subscribePushAction,
  unsubscribePushAction
} from '@/app/actions';
import { useAutomation } from '@/context/AutomationContext';
import ProxyManager from '@/components/ProxyManager';
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const { settings: appSettings, updateSetting } = useAutomation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Check push support and current subscription status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushSupported(false);
      return;
    }

    setPushSupported(true);
    setPushPermission(Notification.permission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setPushSubscribed(!!sub);
      });
    });
  }, []);

  const handleEnablePush = useCallback(async () => {
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission denied. Enable it from browser settings.');
        setPushLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subJson = subscription.toJSON();
      const res = await subscribePushAction({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || '',
          auth: subJson.keys?.auth || '',
        },
      });

      if (res.success) {
        setPushSubscribed(true);
        await updateSetting('pushNotificationsEnabled', true);
        toast.success('Push notifications enabled');
      } else {
        toast.error('Failed to save push subscription');
      }
    } catch (err: any) {
      console.error('[PUSH] Enable error:', err);
      toast.error('Failed to enable push notifications');
    }
    setPushLoading(false);
  }, [updateSetting]);

  const handleDisablePush = useCallback(async () => {
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePushAction(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setPushSubscribed(false);
      await updateSetting('pushNotificationsEnabled', false);
      toast.success('Push notifications disabled');
    } catch (err: any) {
      console.error('[PUSH] Disable error:', err);
      toast.error('Failed to disable push notifications');
    }
    setPushLoading(false);
  }, [updateSetting]);

  const handleWipeLeads = async () => {
    if (!window.confirm('EXTREME DANGER: This will delete ALL leads, tasks, and searches permanently. This cannot be undone. Are you absolutely sure?')) return;
    setIsProcessing(true);
    const res = await wipeAllLeadsAction();
    if (res.success) {
      toast.success("All data wiped successfully");
    } else {
      toast.error("Failed to wipe data");
    }
    setIsProcessing(false);
  };

  const toggleSetting = async (key: string) => {
    const newValue = !appSettings[key];
    await updateSetting(key, newValue);
    toast.success(`Setting updated`);
  };

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Settings"
        description="Configure notifications, exports, proxies, and data retention preferences."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      >
        <div className="grid gap-6">
          {/* Notification Settings */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive alerts for task completions, failures, and account events.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* In-app notifications */}
              <div className="flex items-start justify-between gap-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">In-app notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Show notification badge and dropdown in the header. These are always available.
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    Always on
                  </span>
                </div>
              </div>

              {/* Push notifications */}
              <div className="flex items-start justify-between gap-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Push notifications</div>
                  <div className="text-xs text-muted-foreground">
                    {!pushSupported
                      ? 'Push notifications are not supported in this browser.'
                      : pushPermission === 'denied'
                        ? 'Notifications are blocked by your browser. Go to browser site settings to allow.'
                        : pushSubscribed
                          ? 'You will receive desktop/mobile push notifications for task completions, failures, low credits, and payments.'
                          : 'Enable to receive Chrome/browser notifications even when you\'re not on the site.'
                    }
                  </div>
                </div>
                <div className="shrink-0">
                  {pushSupported && pushPermission !== 'denied' ? (
                    <Switch
                      checked={pushSubscribed}
                      disabled={pushLoading}
                      onCheckedChange={(checked) => {
                        if (checked) handleEnablePush();
                        else handleDisablePush();
                      }}
                    />
                  ) : pushPermission === 'denied' ? (
                    <div className="flex items-center">
                      <BellSlash className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Unsupported
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification types info */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="text-sm font-semibold mb-3">You'll be notified about:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Task completed', desc: 'When an extraction task finishes' },
                    { label: 'Task failed', desc: 'When a task encounters an error' },
                    { label: 'Credits running low', desc: 'When credits drop below 20%' },
                    { label: 'Payment successful', desc: 'After a plan purchase completes' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2 text-xs">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground"> — {item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <SquaresFour className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Export settings</CardTitle>
                  <CardDescription>Control how lead files are grouped and downloaded.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">City-wise export</div>
                  <div className="text-xs text-muted-foreground">
                    When enabled, multiple CSV files will be generated (one per city).
                  </div>
                </div>
                <Switch 
                  checked={appSettings.exportCityWise} 
                  onCheckedChange={() => toggleSetting('exportCityWise')}
                />
              </div>
            </CardContent>
          </Card>


          <ProxyManager />

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldWarning className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Danger zone</CardTitle>
                  <CardDescription className="text-destructive/70">
                    Irreversible actions that remove all data.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-background p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Factory reset</div>
                  <div className="text-xs text-muted-foreground">
                    Delete everything including leads, tasks, and settings.
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleWipeLeads} disabled={isProcessing}>
                  <Trash className="mr-2 h-4 w-4" />
                  Wipe All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppPage>
    </>
  );
}
