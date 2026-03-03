'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  wipeAllLeadsAction,
  subscribePushAction,
  unsubscribePushAction
} from '@/app/actions';
import { useAutomation } from '@/context/AutomationContext';
import {
  Bell, BellOff, Download, Shield, Trash2, AlertTriangle,
  CheckCircle2, XCircle, CreditCard, Loader2, Settings, Zap, Database,
  RotateCcw,
} from 'lucide-react';

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
  const { settings: appSettings, updateSetting, user, isLoadingUser } = useAutomation();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushSupported(false);
      return;
    }
    setPushSupported(true);
    setPushPermission(Notification.permission);
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
        keys: { p256dh: subJson.keys?.p256dh || '', auth: subJson.keys?.auth || '' },
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
      toast.success('All data wiped successfully');
    } else {
      toast.error('Failed to wipe data');
    }
    setIsProcessing(false);
  };

  const toggleSetting = async (key: string) => {
    const newValue = !appSettings[key];
    await updateSetting(key, newValue);
    toast.success('Setting updated');
  };

  const handleReplayTour = async () => {
    await updateSetting('onboardingCompleted', false);
    router.push('/leads');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground">
      <DashboardHeader activePage="search" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16">
        {isLoadingUser ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-300 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="mb-10">
              <h1 className="serif-font text-3xl md:text-4xl text-slate-900 dark:text-foreground">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                Configure notifications, exports, and manage your data.
              </p>
            </div>

            <div className="space-y-6">
              {/* ── Notifications ── */}
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">Notifications</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Choose how you receive alerts.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* In-app */}
                  <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-slate-400 dark:text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">In-app notifications</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Badge and dropdown in the header.</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                      Always on
                    </span>
                  </div>

                  {/* Push */}
                  <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                      {pushSubscribed ? (
                        <Bell size={18} className="text-indigo-500" />
                      ) : (
                        <BellOff size={18} className="text-slate-400 dark:text-slate-500" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Push notifications</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {!pushSupported
                            ? 'Not supported in this browser.'
                            : pushPermission === 'denied'
                              ? 'Blocked by browser. Update in site settings.'
                              : pushSubscribed
                                ? 'Receiving desktop/mobile push alerts.'
                                : 'Get Chrome notifications for task events.'}
                        </p>
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
                        <BellOff size={18} className="text-slate-400" />
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>

                  {/* What you get notified about */}
                  <div className="bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500   mb-3">You'll be notified about</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { icon: CheckCircle2, label: 'Task completed', desc: 'When extraction finishes', color: 'text-emerald-500' },
                        { icon: XCircle, label: 'Task failed', desc: 'When a task errors out', color: 'text-rose-500' },
                        { icon: AlertTriangle, label: 'Credits low', desc: 'Below 20% remaining', color: 'text-amber-500' },
                        { icon: CreditCard, label: 'Payment success', desc: 'After plan purchase', color: 'text-indigo-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5 text-xs">
                          <item.icon size={14} className={item.color} />
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                            <span className="text-slate-400 dark:text-slate-500"> — {item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Export Settings ── */}
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">Export Settings</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Control how lead files are generated.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">City-wise export</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Generate separate CSV files per city.</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.exportCityWise}
                    onCheckedChange={() => toggleSetting('exportCityWise')}
                  />
                </div>
              </div>

              {/* ── Extraction Settings ── */}
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">Extraction Settings</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Configure how lead extraction works.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    {appSettings.fastMode ? (
                      <Zap size={18} className="text-amber-500" />
                    ) : (
                      <Database size={18} className="text-indigo-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fast mode</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                        {appSettings.fastMode
                          ? 'Leads are exported directly without saving to the database. Faster extraction.'
                          : 'Leads are saved to the database for later viewing. Slightly slower.'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.fastMode}
                    onCheckedChange={() => toggleSetting('fastMode')}
                  />
                </div>
              </div>

              {/* ── General ── */}
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">General</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">App preferences and help.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw size={18} className="text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Replay onboarding tour</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Walk through the app features again.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReplayTour}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 border border-indigo-200/50 dark:border-indigo-800/50 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Replay Tour
                  </button>
                </div>
              </div>

              {/* ── Danger Zone ── */}
              <div className="glass-card rounded-3xl p-8 border border-rose-200/30 dark:border-rose-800/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-rose-100/80 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Irreversible actions that remove all data.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-rose-200/40 dark:border-rose-800/40 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-rose-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Factory reset</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Delete all leads, tasks, searches, and settings permanently.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleWipeLeads}
                    disabled={isProcessing}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Wipe All Data
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="w-full py-8 border-t border-white/20 dark:border-slate-800 flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm mt-auto">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase" />
      </footer>
    </div>
  );
}
