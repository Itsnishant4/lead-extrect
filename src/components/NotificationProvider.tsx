'use client';

import { useEffect } from 'react';
import { useAutomation } from '@/context/AutomationContext';
import { subscribePushAction } from '@/app/actions';

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

/**
 * NotificationProvider handles:
 * 1. Registering the service worker on mount
 * 2. Subscribing to Web Push only when user explicitly enables it in Settings
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, settings } = useAutomation();

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });
  }, []);

  // Subscribe to push notifications — only when explicitly enabled in settings
  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (!('Notification' in window)) return;
    
    // Only subscribe if user explicitly enabled push notifications
    if (settings.pushNotificationsEnabled !== true) return;
    
    // Only subscribe if permission is already granted (user enabled it in settings page)
    if (Notification.permission !== 'granted') return;

    navigator.serviceWorker.ready.then(async (reg) => {
      try {
        let subscription = await reg.pushManager.getSubscription();
        if (!subscription) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }
        const subJson = subscription.toJSON();
        await subscribePushAction({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh || '',
            auth: subJson.keys?.auth || '',
          },
        });
      } catch (err) {
        console.error('[PUSH] Subscription failed:', err);
      }
    });
  }, [user, settings.pushNotificationsEnabled]);

  return <>{children}</>;
}
