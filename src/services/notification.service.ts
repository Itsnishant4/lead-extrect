import { db } from '@/lib/db';
import { notifications, users } from '@/lib/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { PushService } from './push.service';

export type NotificationType =
  | 'task_completed'
  | 'task_failed'
  | 'credits_low'
  | 'payment_success'
  | 'subscription_expiring'
  | 'general';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async create(params: CreateNotificationParams) {
    const [result] = await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || null,
    }).returning({ id: notifications.id });

    // Fire-and-forget browser push notification
    PushService.sendToUser(params.userId, {
      title: params.title,
      body: params.message,
      tag: `${params.type}-${result.id}`,
      url: '/leads',
    }).catch((err) => {
      console.error('[NOTIFICATION] Push send error:', err.message || err);
    });

    return result.id;
  }

  /**
   * Get notifications for a user (paginated, newest first)
   */
  static async getByUserId(userId: number, limit = 20, offset = 0) {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
    return rows;
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(userId: number, notificationId: number) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  /**
   * Delete old notifications (retention: 30 days)
   */
  static async cleanup() {
    await db.delete(notifications).where(
      sql`${notifications.createdAt} < NOW() - INTERVAL '30 days'`
    );
  }

  // ──────────────────────────────────────────
  // Auto-trigger helpers (called from other services)
  // ──────────────────────────────────────────

  static async notifyTaskCompleted(userId: number, taskName: string, totalLeads: number, taskId: number) {
    await this.create({
      userId,
      type: 'task_completed',
      title: 'Task Completed',
      message: `"${taskName}" finished successfully with ${totalLeads.toLocaleString()} leads extracted.`,
      metadata: { taskId },
    });
  }

  static async notifyTaskFailed(userId: number, taskName: string, reason: string, taskId: number) {
    await this.create({
      userId,
      type: 'task_failed',
      title: 'Task Failed',
      message: `"${taskName}" failed: ${reason}`,
      metadata: { taskId },
    });
  }

  static async notifyCreditsLow(userId: number, remaining: number, total: number) {
    // Avoid spamming — only notify once per threshold
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, 'credits_low'),
        eq(notifications.isRead, false),
      ))
      .limit(1);

    if (existing.length > 0) return; // Already has an unread credits_low notification

    const percent = total > 0 ? Math.round((remaining / total) * 100) : 0;
    await this.create({
      userId,
      type: 'credits_low',
      title: 'Credits Running Low',
      message: `You have ${remaining.toLocaleString()} credits remaining (${percent}%). Upgrade your plan to continue extracting leads.`,
      metadata: { remaining, total, percent },
    });
  }

  static async notifyPaymentSuccess(userId: number, planName: string, amount: string) {
    await this.create({
      userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ₹${amount} for the ${planName} plan was successful. Credits have been added to your account.`,
      metadata: { planName, amount },
    });
  }

  static async notifySubscriptionExpiring(userId: number, daysLeft: number) {
    // Avoid spamming — only notify once while an unread expiry notification exists
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, 'subscription_expiring'),
        eq(notifications.isRead, false),
      ))
      .limit(1);

    if (existing.length > 0) return; // Already has an unread subscription_expiring notification

    await this.create({
      userId,
      type: 'subscription_expiring',
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew now to avoid losing access.`,
      metadata: { daysLeft },
    });
  }

  /**
   * Check if user's credits are below 20% and send a notification
   */
  static async checkAndNotifyCreditsLow(userId: number) {
    const user = await db
      .select({
        planType: users.planType,
        leadsExtracted: users.leadsExtracted,
        bonusCredits: users.bonusCredits,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(r => r[0]);

    if (!user) return;

    const isUnlimited = user.planType === 'premium' || user.planType === 'enterprise';
    if (isUnlimited) return;

    const total = user.bonusCredits || 0;
    const used = user.leadsExtracted || 0;
    const remaining = Math.max(total - used, 0);
    const percent = total > 0 ? (remaining / total) * 100 : 100;

    if (percent <= 20 && total > 0) {
      await this.notifyCreditsLow(userId, remaining, total);
    }
  }
}
