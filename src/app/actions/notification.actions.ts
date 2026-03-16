'use server';

import { getSession } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';
import { PushService } from '@/services/push.service';
import { handleActionError } from './helpers';

export async function getNotificationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await NotificationService.getByUserId(session.id, 20);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUnreadNotificationCountAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const count = await NotificationService.getUnreadCount(session.id);
    return { success: true, count };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function markNotificationReadAction(notificationId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await NotificationService.markAsRead(session.id, notificationId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await NotificationService.markAllAsRead(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function subscribePushAction(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await PushService.saveSubscription(session.id, subscription);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function unsubscribePushAction(endpoint: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await PushService.removeSubscription(endpoint);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
