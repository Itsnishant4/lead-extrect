'use client';

import React, { useState, useEffect } from 'react';
import { useAutomation } from '@/context/AutomationContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { subscribePushAction } from '@/app/actions';
import { toast } from 'sonner';
import { Loader2, Bell } from 'lucide-react';
import AiCampaignWizard from '@/components/leads/AiCampaignWizard';

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

export default function LeadsForm() {
  const { updateSetting, settings } = useAutomation();

  const [showPushPopup, setShowPushPopup] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Show push notification popup if not enabled
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = sessionStorage.getItem('push-popup-dismissed');
    if (dismissed) return;

    // Check if browser supports push notifications
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    // Don't show if permission already denied
    if (Notification.permission === 'denied') return;

    // Don't show if push notifications are already enabled
    if (Notification.permission === 'granted' && settings.pushNotificationsEnabled === true) return;

    // Show popup after delay
    const timer = setTimeout(() => setShowPushPopup(true), 2000);
    return () => clearTimeout(timer);
  }, [settings.pushNotificationsEnabled]);

  const handleEnablePush = async () => {
    if (!VAPID_PUBLIC_KEY) {
      toast.error('Push notifications not configured');
      return;
    }
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setPushLoading(false);
        setShowPushPopup(false);
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
        await updateSetting('pushNotificationsEnabled', true);
        toast.success('Push notifications enabled!');
      }
    } catch (err) {
      console.error('[PUSH] Enable error:', err);
      toast.error('Failed to enable push notifications');
    }
    setPushLoading(false);
    setShowPushPopup(false);
  };

  const handleDismissPush = () => {
    sessionStorage.setItem('push-popup-dismissed', 'true');
    setShowPushPopup(false);
  };

  return (
    <div className="min-h-screen item-center justify-center my-auto flex flex-col bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 text-foreground">
      {/* Push Notification Popup */}
      {showPushPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Bell size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Enable Notifications</h3>
                <p className="text-sm text-muted-foreground">Stay updated with your leads</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Get instant notifications when your tasks complete and new leads are ready. Never miss an update!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDismissPush}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleEnablePush}
                disabled={pushLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {pushLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
      <DashboardHeader activePage="leads" />
      <main className="flex-1 w-full justify-center items-center max-w-5xl mx-auto p-4 md:p-8 lg:p-16 pt-24 lg:pt-28 flex flex-col items-center">
        <AiCampaignWizard />
      </main>
    </div>
  );
}
