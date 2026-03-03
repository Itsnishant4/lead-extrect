import webpush from 'web-push';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Configure VAPID keys from environment
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@leadspotter.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export class PushService {
  /**
   * Save a push subscription for a user.
   * If the endpoint already exists, update it (could be a re-subscribe).
   */
  static async saveSubscription(userId: number, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    const { endpoint, keys } = subscription;

    // Upsert: delete old entry for same endpoint, then insert
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  /**
   * Remove a push subscription by endpoint
   */
  static async removeSubscription(endpoint: string) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  /**
   * Remove all push subscriptions for a user
   */
  static async removeAllSubscriptions(userId: number) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  /**
   * Check if a user has any active push subscriptions
   */
  static async hasSubscription(userId: number): Promise<boolean> {
    const rows = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .limit(1);
    return rows.length > 0;
  }

  /**
   * Send a push notification to all of a user's subscribed devices
   */
  static async sendToUser(userId: number, payload: { title: string; body: string; icon?: string; url?: string; tag?: string }) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('[PUSH] VAPID keys not configured, skipping push notification');
      return;
    }

    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subs.length === 0) return;

    const payloadStr = JSON.stringify(payload);

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payloadStr,
            { TTL: 60 * 60 } // 1 hour TTL
          );
        } catch (error: any) {
          // If subscription is expired or invalid (410 Gone, 404 Not Found), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[PUSH] Removing expired subscription for user ${userId}: ${sub.endpoint.slice(0, 50)}...`);
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.error(`[PUSH] Failed to send to user ${userId}:`, error.message || error);
          }
          throw error;
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      console.log(`[PUSH] User ${userId}: ${sent} sent, ${failed} failed`);
    }
  }
}
