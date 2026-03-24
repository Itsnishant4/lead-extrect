import { db } from '@/lib/db/index';
import { integrations, userIntegrations, integrationLogs, plans, tasks, leads, taskLeads } from '@/lib/db/schema';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { decrypt } from '@/lib/integrations/encryption';
import { dispatchSync } from '@/lib/integrations/dispatcher';

export class IntegrationService {
  static async getAllIntegrationsAdmin() {
    return db.select().from(integrations).orderBy(integrations.sortOrder, integrations.name);
  }

  static async getAllIntegrations() {
    return db.select().from(integrations)
      .where(eq(integrations.isActive, true))
      .orderBy(integrations.sortOrder, integrations.name);
  }

  static async getBySlug(slug: string) {
    const rows = await db.select().from(integrations).where(eq(integrations.slug, slug)).limit(1);
    return rows[0] || null;
  }

  static async getById(id: number) {
    const rows = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
    return rows[0] || null;
  }

  static async createIntegration(data: {
    slug: string;
    name: string;
    featureFlag: string;
    category: string;
    description?: string;
    iconUrl?: string;
    oauthProvider?: string | null;
    configSchema?: any;
    sortOrder?: number;
  }) {
    const result = await db.insert(integrations).values({
      slug: data.slug,
      name: data.name,
      featureFlag: data.featureFlag,
      category: data.category,
      description: data.description || null,
      iconUrl: data.iconUrl || null,
      oauthProvider: data.oauthProvider || null,
      configSchema: data.configSchema || null,
      sortOrder: data.sortOrder ?? 0,
    }).returning({ id: integrations.id });
    return result[0].id;
  }

  static async updateIntegration(id: number, data: Partial<{
    name: string;
    featureFlag: string;
    category: string;
    description: string;
    iconUrl: string;
    oauthProvider: string | null;
    configSchema: any;
    sortOrder: number;
    isActive: boolean;
  }>) {
    await db.update(integrations).set({
      ...data,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(integrations.id, id));
  }

  static async toggleActive(id: number) {
    const current = await IntegrationService.getById(id);
    if (!current) throw new Error('Integration not found');
    await db.update(integrations).set({
      isActive: !current.isActive,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(integrations.id, id));
    return !current.isActive;
  }

  static async getUserIntegrations(userId: number) {
    return db.select({
      id: userIntegrations.id,
      integrationId: userIntegrations.integrationId,
      isEnabled: userIntegrations.isEnabled,
      config: userIntegrations.config,
      lastSyncedAt: userIntegrations.lastSyncedAt,
      totalSynced: userIntegrations.totalSynced,
      lastError: userIntegrations.lastError,
      createdAt: userIntegrations.createdAt,
      slug: integrations.slug,
      name: integrations.name,
      featureFlag: integrations.featureFlag,
      category: integrations.category,
      iconUrl: integrations.iconUrl,
      oauthProvider: integrations.oauthProvider,
      integrationIsActive: integrations.isActive,
    })
      .from(userIntegrations)
      .innerJoin(integrations, eq(userIntegrations.integrationId, integrations.id))
      .where(eq(userIntegrations.userId, userId))
      .orderBy(integrations.sortOrder);
  }

  static async getUserIntegration(userId: number, integrationId: number) {
    const rows = await db.select()
      .from(userIntegrations)
      .where(and(
        eq(userIntegrations.userId, userId),
        eq(userIntegrations.integrationId, integrationId)
      ))
      .limit(1);
    return rows[0] || null;
  }

  static async connectIntegration(userId: number, integrationId: number, config?: any) {
    const existing = await IntegrationService.getUserIntegration(userId, integrationId);
    if (existing) {
      await db.update(userIntegrations).set({
        isEnabled: true,
        config: config || existing.config,
        updatedAt: sql`(unixepoch())`,
      }).where(eq(userIntegrations.id, existing.id));
      return existing.id;
    }
    const result = await db.insert(userIntegrations).values({
      userId,
      integrationId,
      config: config || null,
    }).returning({ id: userIntegrations.id });
    return result[0].id;
  }

  static async disconnectIntegration(userId: number, userIntegrationId: number) {
    await db.delete(userIntegrations)
      .where(and(
        eq(userIntegrations.id, userIntegrationId),
        eq(userIntegrations.userId, userId)
      ));
  }

  static async updateOAuthTokens(userIntegrationId: number, accessToken: string, refreshToken?: string, tokenExpiry?: Date) {
    await db.update(userIntegrations).set({
      accessToken,
      refreshToken: refreshToken || null,
      tokenExpiry: tokenExpiry || null,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(userIntegrations.id, userIntegrationId));
  }

  static async updateConfig(userIntegrationId: number, config: any) {
    await db.update(userIntegrations).set({
      config,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(userIntegrations.id, userIntegrationId));
  }

  static async updateSyncStats(userIntegrationId: number, status: 'success' | 'failed', leadsCount: number = 0, errorMessage?: string) {
    const updates: any = {
      updatedAt: sql`(unixepoch())`,
    };
    if (status === 'success') {
      updates.lastSyncedAt = sql`(unixepoch())`;
      updates.totalSynced = sql`${userIntegrations.totalSynced} + ${leadsCount}`;
      updates.lastError = null;
    } else {
      updates.lastError = errorMessage || 'Unknown error';
    }
    await db.update(userIntegrations).set(updates).where(eq(userIntegrations.id, userIntegrationId));
  }

  static async addLog(data: {
    userId: number;
    integrationId: number;
    taskId?: number | null;
    action: string;
    status: string;
    leadsCount?: number;
    errorMessage?: string;
    metadata?: any;
  }) {
    await db.insert(integrationLogs).values({
      userId: data.userId,
      integrationId: data.integrationId,
      taskId: data.taskId || null,
      action: data.action,
      status: data.status,
      leadsCount: data.leadsCount || 0,
      errorMessage: data.errorMessage || null,
      metadata: data.metadata || null,
    });
  }

  static async getUserLogs(userId: number, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return db.select({
      id: integrationLogs.id,
      action: integrationLogs.action,
      status: integrationLogs.status,
      leadsCount: integrationLogs.leadsCount,
      errorMessage: integrationLogs.errorMessage,
      createdAt: integrationLogs.createdAt,
      integrationName: integrations.name,
      integrationSlug: integrations.slug,
    })
      .from(integrationLogs)
      .innerJoin(integrations, eq(integrationLogs.integrationId, integrations.id))
      .where(eq(integrationLogs.userId, userId))
      .orderBy(desc(integrationLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async getStats() {
    const activeConnections = await db.select({ count: count() })
      .from(userIntegrations)
      .where(eq(userIntegrations.isEnabled, true));

    const totalSyncs24h = await db.select({ count: count() })
      .from(integrationLogs)
      .where(and(
        eq(integrationLogs.action, 'sync'),
        sql`${integrationLogs.createdAt} > unixepoch() - 86400`
      ));

    const successRate = await db.select({
      total: count(),
      success: sql<number>`SUM(CASE WHEN ${integrationLogs.status} = 'success' THEN 1 ELSE 0 END)`,
    })
      .from(integrationLogs)
      .where(sql`${integrationLogs.createdAt} > unixepoch() - 604800`);

    const perIntegration = await db.select({
      integrationId: userIntegrations.integrationId,
      name: integrations.name,
      slug: integrations.slug,
      activeUsers: count(),
    })
      .from(userIntegrations)
      .innerJoin(integrations, eq(userIntegrations.integrationId, integrations.id))
      .groupBy(userIntegrations.integrationId, integrations.name, integrations.slug);

    const total = successRate[0]?.total || 0;
    const success = Number(successRate[0]?.success || 0);

    return {
      activeConnections: activeConnections[0]?.count || 0,
      totalSyncs24h: totalSyncs24h[0]?.count || 0,
      successRate: total > 0 ? Math.round((success / total) * 100) : 100,
      perIntegration,
    };
  }

  static async getPlanIntegrationMatrix() {
    const allPlans = await db.select({
      id: plans.id,
      name: plans.name,
      features: plans.features,
    }).from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder);

    const allIntegrations = await IntegrationService.getAllIntegrationsAdmin();

    const matrix = allIntegrations.map(integration => {
      const planAssignments = allPlans.map(plan => {
        const features = (plan.features as string[] | null) || [];
        return {
          planId: plan.id,
          planName: plan.name,
          assigned: features.includes(integration.featureFlag),
        };
      });
      return {
        integrationId: integration.id,
        integrationName: integration.name,
        featureFlag: integration.featureFlag,
        category: integration.category,
        isActive: integration.isActive,
        plans: planAssignments,
      };
    });

    return { matrix, plans: allPlans };
  }

  static async assignToPlan(featureFlag: string, planId: number) {
    const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan[0]) throw new Error('Plan not found');

    const features = (plan[0].features as string[] | null) || [];
    const unavailable = (plan[0].unavailableFeatures as string[] | null) || [];

    if (!features.includes(featureFlag)) {
      features.push(featureFlag);
    }
    const newUnavailable = unavailable.filter(f => f !== featureFlag);

    await db.update(plans).set({
      features,
      unavailableFeatures: newUnavailable,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(plans.id, planId));
  }

  static async unassignFromPlan(featureFlag: string, planId: number) {
    const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan[0]) throw new Error('Plan not found');

    const features = (plan[0].features as string[] | null) || [];
    const unavailable = (plan[0].unavailableFeatures as string[] | null) || [];

    const newFeatures = features.filter(f => f !== featureFlag);
    if (!unavailable.includes(featureFlag)) {
      unavailable.push(featureFlag);
    }

    await db.update(plans).set({
      features: newFeatures,
      unavailableFeatures: unavailable,
      updatedAt: sql`(unixepoch())`,
    }).where(eq(plans.id, planId));
  }

  static async seedDefaults() {
    const existing = await db.select({ count: count() }).from(integrations);
    if ((existing[0]?.count || 0) > 0) return;

    const defaults = [
      { slug: 'google-sheets', name: 'Google Sheets', featureFlag: 'Integration: Google Sheets', category: 'export', description: 'Export leads to Google Sheets.', oauthProvider: 'google' as const, iconUrl: '📊', sortOrder: 1 },
      { slug: 'hubspot', name: 'HubSpot CRM', featureFlag: 'Integration: HubSpot', category: 'crm', description: 'Push leads to HubSpot CRM.', oauthProvider: 'hubspot' as const, iconUrl: '🟧', sortOrder: 2 },
      { slug: 'zapier', name: 'Zapier', featureFlag: 'Integration: Zapier', category: 'automation', description: 'Connect to 5,000+ apps via Zapier.', oauthProvider: null, iconUrl: '⚡', sortOrder: 3 },
      { slug: 'make', name: 'Make', featureFlag: 'Integration: Make', category: 'automation', description: 'Automate with Make scenarios.', oauthProvider: null, iconUrl: '🔄', sortOrder: 4 },
      { slug: 'slack', name: 'Slack', featureFlag: 'Integration: Slack', category: 'notification', description: 'Get alerts in Slack.', oauthProvider: 'slack' as const, iconUrl: '💬', sortOrder: 5 },
      { slug: 'salesforce', name: 'Salesforce', featureFlag: 'Integration: Salesforce', category: 'crm', description: 'Push leads to Salesforce.', oauthProvider: 'salesforce' as const, iconUrl: '☁️', sortOrder: 6 },
      { slug: 'pipedrive', name: 'Pipedrive', featureFlag: 'Integration: Pipedrive', category: 'crm', description: 'Create contacts in Pipedrive.', oauthProvider: null, iconUrl: '🔴', sortOrder: 7 },
      { slug: 'webhook', name: 'Custom Webhook', featureFlag: 'Webhook: Basic', category: 'automation', description: 'Send data to any URL.', oauthProvider: null, iconUrl: '🔗', sortOrder: 8 },
    ];

    for (const d of defaults) {
      await db.insert(integrations).values(d).onConflictDoNothing();
    }
  }

  static async syncTaskData(
    userId: number,
    userIntegrationId: number,
    taskId: number,
    options: {
      ip: string;
      includeMetadata?: boolean;
      fieldMapping?: Record<string, string>;
    }
  ) {
    const userIntegration = await db.select({
      id: userIntegrations.id,
      integrationId: userIntegrations.integrationId,
      slug: integrations.slug,
      name: integrations.name,
      config: userIntegrations.config,
      accessToken: userIntegrations.accessToken,
      refreshToken: userIntegrations.refreshToken,
      tokenExpiry: userIntegrations.tokenExpiry,
      apiKey: userIntegrations.apiKey,
    })
      .from(userIntegrations)
      .innerJoin(integrations, eq(userIntegrations.integrationId, integrations.id))
      .where(and(
        eq(userIntegrations.id, userIntegrationId),
        eq(userIntegrations.userId, userId)
      ))
      .limit(1);

    if (!userIntegration[0]) {
      throw new Error('Integration not found or access denied');
    }

    const task = await db.select({
      id: tasks.id,
      name: tasks.name,
      totalLeads: tasks.totalLeads,
      status: tasks.status,
      exportFileIds: tasks.exportFileIds,
    })
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, userId),
        eq(tasks.status, 'completed')
      ))
      .limit(1);

    if (!task[0]) {
      throw new Error('Task not found or not completed');
    }

    // Try to get leads from database first
    let leadsArray: any[] = await db.select({
      id: leads.id,
      name: leads.name,
      address: leads.address,
      city: leads.city,
      website: leads.website,
      phone: leads.phone,
      email: leads.email,
      rating: leads.rating,
      reviewsCount: leads.reviewsCount,
      category: leads.category,
      leadScore: leads.leadScore,
      facebook: leads.facebook,
      instagram: leads.instagram,
      linkedin: leads.linkedin,
      twitter: leads.twitter,
    })
      .from(taskLeads)
      .innerJoin(leads, eq(taskLeads.leadId, leads.id))
      .where(eq(taskLeads.taskId, taskId));

    // If no leads in DB, try fetching from Telegram
    if (leadsArray.length === 0 && task[0].exportFileIds) {
      try {
        const fileIds = JSON.parse(task[0].exportFileIds);
        if (fileIds.length > 0) {
          const token = process.env.TELEGRAM_BOT_TOKEN;
          if (token) {
            for (const fileId of fileIds) {
              const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              
              if (fileData.ok && fileData.result?.file_path) {
                const downloadRes = await fetch(`https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`);
                const csvContent = await downloadRes.text();
                
                const lines = csvContent.split('\n').filter((line: string) => line.trim());
                if (lines.length > 1) {
                  const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, '').toLowerCase());
                  for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
                    const lead: any = {};
                    headers.forEach((h: string, idx: number) => {
                      lead[h] = values[idx] || '';
                    });
                    leadsArray.push({
                      id: i,
                      name: lead.name || lead['business name'] || '',
                      address: lead.address || '',
                      city: lead.city || '',
                      website: lead.website || '',
                      phone: lead.phone || '',
                      email: lead.email || '',
                      rating: parseFloat(lead.rating) || null,
                      reviewsCount: parseInt(lead.reviews || lead['reviews count']) || null,
                      category: lead.category || '',
                      leadScore: parseInt(lead.lead_score) || 0,
                      facebook: lead.facebook || '',
                      instagram: lead.instagram || '',
                      linkedin: lead.linkedin || '',
                      twitter: lead.twitter || '',
                    });
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch leads from Telegram:', e);
      }
    }

    const integration = userIntegration[0];
    const config = integration.config as any;
    let sheetUrl: string | null = null;
    let syncResult: { success: boolean; error?: string; syncedCount: number } = { success: false, syncedCount: 0 };

    // Sync based on integration type
    if (integration.slug === 'google-sheets') {
      // Google Sheets sync
      let spreadsheetId: string | null = null;
      sheetUrl = null;

      if (!integration.accessToken) {
        throw new Error('Google account not connected. Please reconnect your Google account.');
      }

      let accessToken: string;
      try {
        accessToken = decrypt(integration.accessToken);
      } catch {
        accessToken = integration.accessToken;
      }

      const spreadsheetTitle = buildLeadspotterSpreadsheetTitle(task[0].name);
      const sheetName = buildLeadspotterSheetName(task[0].name);
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: spreadsheetTitle },
          sheets: [{ properties: { title: sheetName } }],
        }),
      });

      if (createRes.ok) {
        const sheetData = await createRes.json();
        spreadsheetId = sheetData.spreadsheetId;

        // Keep the latest sheet info on the connection for the UI.
        await db.update(userIntegrations)
          .set({
            config: { ...config, spreadsheetId, sheetName },
            updatedAt: sql`(unixepoch())`,
          })
          .where(eq(userIntegrations.id, integration.id));
      } else {
        throw new Error('Failed to create Google Sheet. Please try reconnecting.');
      }

      const { syncToGoogleSheets } = await import('@/lib/integrations/google-sheets');
      const refreshToken = integration.refreshToken;
      const tokenExpiry = integration.tokenExpiry ? Math.floor(new Date(integration.tokenExpiry).getTime() / 1000) : null;

      syncResult = await syncToGoogleSheets(
        accessToken,
        refreshToken,
        tokenExpiry,
        { ...config, spreadsheetId, sheetName },
        leadsArray.map(l => ({
          name: l.name,
          address: l.address,
          city: l.city,
          phone: l.phone,
          email: l.email,
          website: l.website,
          rating: l.rating,
          reviewsCount: l.reviewsCount,
          category: l.category,
          leadScore: l.leadScore,
          facebook: l.facebook,
          instagram: l.instagram,
          linkedin: l.linkedin,
          twitter: l.twitter,
        }))
      );

      sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } else {
      let accessToken: string | null = null;
      if (integration.accessToken) {
        try {
          accessToken = decrypt(integration.accessToken);
        } catch {
          accessToken = integration.accessToken;
        }
      }

      const refreshToken = integration.refreshToken || null;
      const tokenExpiry = integration.tokenExpiry ? Math.floor(new Date(integration.tokenExpiry).getTime() / 1000) : null;

      syncResult = await dispatchSync(
        {
          userId,
          userIntegrationId,
          integrationId: integration.integrationId,
          slug: integration.slug,
          accessToken,
          refreshToken,
          tokenExpiry,
          config,
          apiKey: integration.apiKey,
        },
        leadsArray.map(l => ({
          name: l.name,
          address: l.address,
          city: l.city,
          phone: l.phone,
          email: l.email,
          website: l.website,
          rating: l.rating,
          reviewsCount: l.reviewsCount,
          category: l.category,
          leadScore: l.leadScore,
          facebook: l.facebook,
          instagram: l.instagram,
          linkedin: l.linkedin,
          twitter: l.twitter,
        }))
      );
    }

    // Log the sync
    await db.insert(integrationLogs).values({
      userId: userId,
      integrationId: integration.integrationId,
      taskId: taskId,
      action: 'sync',
      status: syncResult.success ? 'success' : 'failed',
      leadsCount: syncResult.syncedCount,
      errorMessage: syncResult.error || null,
    });

    // Update integration sync stats
    if (syncResult.success) {
      await db.update(userIntegrations)
        .set({
          lastSyncedAt: sql`(unixepoch())`,
          totalSynced: sql`${userIntegrations.totalSynced} + ${syncResult.syncedCount}`,
          lastError: null
        })
        .where(eq(userIntegrations.id, userIntegrationId));
    } else {
      await db.update(userIntegrations)
        .set({ lastError: syncResult.error || 'Sync failed' })
        .where(eq(userIntegrations.id, userIntegrationId));
    }

    return {
      success: syncResult.success,
      integration: integration.slug,
      integrationName: integration.name,
      task: task[0].name,
      leadsSynced: syncResult.syncedCount,
      sheetUrl,
      error: syncResult.error,
      timestamp: new Date().toISOString()
    };
  }
}

function buildLeadspotterSpreadsheetTitle(taskName: string): string {
  const cleanedTaskName = normalizeGoogleSheetTitle(taskName, 80);
  return normalizeGoogleSheetTitle(`LeadSpotter - ${cleanedTaskName}`, 100);
}

function buildLeadspotterSheetName(taskName: string): string {
  const cleanedTaskName = normalizeGoogleSheetTitle(taskName, 86);
  return normalizeGoogleSheetTitle(`LeadSpotter ${cleanedTaskName}`, 100);
}

function normalizeGoogleSheetTitle(value: string, maxLength: number): string {
  const cleaned = value
    .replace(/[\[\]\*\/\\\?\:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'LeadSpotter';
  }

  return cleaned.slice(0, maxLength).trim();
}
