'use server';

import { getSession } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { TaskService } from '@/services/task.service';
import { handleActionError } from './helpers';
import { withCache, clearCacheByPrefix } from '@/lib/cache';

export async function getAdminDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    // 15s cache — matches 30s dashboard poll, absorbs multi-admin fan-out.
    const data = await withCache('admin-dashboard-stats', () => AdminService.getDashboardStats(), 15_000);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminChartDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getChartData();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminInsightsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getInsights();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getAdminTasks();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminTasksDetailedAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getAdminTasksDetailed();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllUsersAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const users = await AdminService.getAllUsers();
    return { success: true, data: users };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateTaskStatusAdminAction(taskId: number, status: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateTaskStatus(taskId, status);
    clearCacheByPrefix('admin-dashboard-stats');
    clearCacheByPrefix('admin-tasks');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function bulkUpdateTasksAdminAction(mode: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.bulkUpdateTasks(mode);
    clearCacheByPrefix('admin-dashboard-stats');
    clearCacheByPrefix('admin-tasks');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateUserPlanAction(targetUserId: number, newPlan: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(targetUserId, { planType: newPlan });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function suspendUserAction(userId: number, isSuspended: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(userId, { is_suspended: isSuspended });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function toggleUserAdminAction(userId: number, isAdmin: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(userId, { is_admin: isAdmin });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function startAllPendingTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.startAllPendingTasks(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateUserCreditsAction(userId: number, amount: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUserCredits(userId, amount);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function recalculateUserUsageAction(userId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const actualCount = await AdminService.recalculateUserUsage(userId);
    return { success: true, actualCount };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUserHistoryAdminAction(userId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getUserHistory(userId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUserLocationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    // Cache for 25 seconds - reduces redundant queries across admin/live and live-user-map
    const data = await withCache('admin-user-locations', () => AdminService.getUserLocations(), 25000);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllSubscribersAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const { db } = await import('@/lib/db/index');
    const { users } = await import('@/lib/db/schema');
    const { desc } = await import('drizzle-orm');
    
    const subscribers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      planType: users.planType,
      leadsExtracted: users.leadsExtracted,
      bonusCredits: users.bonusCredits,
      subscriptionExpiry: users.subscriptionExpiry,
      createdAt: users.createdAt,
      isSuspended: users.isSuspended,
    }).from(users).orderBy(desc(users.createdAt));
    
    return { success: true, data: subscribers };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function sendNotificationToAllAction(title: string, message: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const { db } = await import('@/lib/db/index');
    const { users } = await import('@/lib/db/schema');
    const { ne } = await import('drizzle-orm');
    const { NotificationService } = await import('@/services/notification.service');
    
    // Get all active users
    const allUsers = await db.select({ id: users.id })
      .from(users)
      .where(ne(users.isSuspended, true));
    
    // Create notification for each user using NotificationService (which also sends push)
    for (const user of allUsers) {
      await NotificationService.create({
        userId: user.id,
        type: 'general',
        title,
        message,
        pushUrl: '/dashboard',
      });
    }
    
    return { success: true, data: { count: allUsers.length } };
  } catch (error: any) {
    return handleActionError(error);
  }
}
