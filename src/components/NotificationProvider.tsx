'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAutomation } from '@/context/AutomationContext';
import { subscribePushAction, unsubscribePushAction } from '@/app/actions';

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
 * 2. Prompting for notification permission after login
 * 3. Subscribing to Web Push and sending the subscription to the server
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, settings } = useAutomation();
  const hasPrompted = useRef(false);

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });
  }, []);

  // Subscribe to push notifications — uses navigator.serviceWorker.ready
  // to avoid a race condition where the registration isn't ready yet.
  const subscribeToPush = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[PUSH] VAPID public key not set');
      return;
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      // This resolves only when the SW is active — no race condition
      const reg = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Send subscription to server
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
  }, []);

  // Prompt for permission when user is logged in
  useEffect(() => {
    if (!user || hasPrompted.current) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Check if push notifications are disabled in user settings
    if (settings.pushNotificationsEnabled === false) return;

    hasPrompted.current = true;

    const permission = Notification.permission;

    if (permission === 'granted') {
      // Already granted — subscribe silently
      subscribeToPush();
    } else if (permission === 'default') {
      // Slight delay so the page loads first and the prompt feels less aggressive
      const timer = setTimeout(() => {
        Notification.requestPermission().then((result) => {
          if (result === 'granted') {
            subscribeToPush();
          }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
    // If 'denied', don't prompt again (browser blocks it anyway)
  }, [user, settings.pushNotificationsEnabled, subscribeToPush]);

  return <>{children}</>;
}
