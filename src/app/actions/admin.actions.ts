'use server';

import { getSession } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { TaskService } from '@/services/task.service';
import { handleActionError } from './helpers';

export async function getAdminDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getDashboardStats();
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
    const tasks = await AdminService.startAllPendingTasks(session.id);
    // Kick off processing for the first task if found
    const userTasks = await TaskService.getTasks(session.id);
    const firstRunning = userTasks.find((t: any) => t.status === 'running');
    if (firstRunning) {
      void TaskService.processTaskStep(firstRunning.id, session.id);
    }
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
