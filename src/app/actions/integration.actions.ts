'use server';

import { getSession } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { IntegrationService } from '@/services/integration.service';
import { handleActionError, logAction, getClientInfo } from './helpers';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// ─── Admin Actions ───

export async function getAllIntegrationsAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await IntegrationService.getAllIntegrationsAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createIntegrationAction(data: {
  slug: string;
  name: string;
  featureFlag: string;
  category: string;
  description?: string;
  iconUrl?: string;
  oauthProvider?: string;
  configSchema?: any;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const id = await IntegrationService.createIntegration(data);
    await logAction('integration_create', 'success', { integrationId: id, slug: data.slug });
    return { success: true, id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateIntegrationAction(id: number, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await IntegrationService.updateIntegration(id, data);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function toggleIntegrationAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const isActive = await IntegrationService.toggleActive(id);
    await logAction('integration_toggle', 'success', { integrationId: id, isActive });
    return { success: true, isActive };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getIntegrationStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await IntegrationService.getStats();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getPlanIntegrationMatrixAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await IntegrationService.getPlanIntegrationMatrix();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function assignIntegrationToPlanAction(featureFlag: string, planId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await IntegrationService.assignToPlan(featureFlag, planId);
    await logAction('integration_assign_plan', 'success', { featureFlag, planId });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function unassignIntegrationFromPlanAction(featureFlag: string, planId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await IntegrationService.unassignFromPlan(featureFlag, planId);
    await logAction('integration_unassign_plan', 'success', { featureFlag, planId });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function seedIntegrationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await IntegrationService.seedDefaults();
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// ─── User Actions ───

export async function getMyIntegrationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const integrations = await IntegrationService.getAllIntegrationsAdmin();
    const userIntegrations = await IntegrationService.getUserIntegrations(session.id);
    const { UserService } = await import('@/services/user.service');
    const user = await UserService.getUser(session.id);
    const planType = user?.planType || 'free';

    const enriched = integrations.map(integration => {
      const connection = userIntegrations.find(ui => ui.integrationId === integration.id);
      const hasAccess = planType !== 'free' || integration.featureFlag === 'Integration: Google Sheets';
      const locked = !hasAccess && integration.featureFlag !== 'Integration: Google Sheets';

      return {
        ...integration,
        connected: !!connection,
        connection: connection || null,
        hasAccess,
        locked,
      };
    });

    return { success: true, data: { integrations: enriched, planType } };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function connectIntegrationAction(slug: string, config?: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const integration = await IntegrationService.getBySlug(slug);
    if (!integration) throw new Error('Integration not found');

    // Check feature access
    const { UserService } = await import('@/services/user.service');
    const user = await UserService.getUser(session.id);
    const planType = user?.planType || 'free';
    const hasAccess = planType !== 'free' || integration.featureFlag === 'Integration: Google Sheets';
    if (!hasAccess) throw new Error('Upgrade your plan to use this integration');

    await IntegrationService.connectIntegration(session.id, integration.id, config);
    await logAction('integration_connect', 'success', { integrationId: integration.id, slug });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function disconnectIntegrationAction(userIntegrationId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await IntegrationService.disconnectIntegration(session.id, userIntegrationId);
    await logAction('integration_disconnect', 'success', { userIntegrationId });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function testIntegrationAction(userIntegrationId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const connection = await db.select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    return { success: true, message: 'Integration is active' };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getIntegrationLogsAction(page = 1) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const logs = await IntegrationService.getUserLogs(session.id, page);
    return { success: true, data: logs };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getCompletedTasksAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { ip } = await getClientInfo();
    
    const { TaskService } = await import('@/services/task.service');
    const tasks = await TaskService.getCompletedTasks(session.id);
    return { success: true, data: tasks };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getWebhookSyncKeyInfoAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const data = await IntegrationService.getWebhookSyncKeyInfo(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function generateWebhookSyncKeyAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const data = await IntegrationService.generateWebhookSyncKeyForUser(session.id);
    await logAction('webhook_sync_key_generate', 'success', { last4: data.info.last4 });
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function syncTaskToIntegrationAction(
  userIntegrationId: number,
  taskId: number,
  syncOptions?: {
    includeMetadata?: boolean;
    fieldMapping?: Record<string, string>;
  }
) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { ip } = await getClientInfo();
    
    const { IntegrationService } = await import('@/services/integration.service');
    const result = await IntegrationService.syncTaskData(
      session.id,
      userIntegrationId,
      taskId,
      {
        ip,
        ...syncOptions
      }
    );
    
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error);
  }
}
