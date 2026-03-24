import { syncToGoogleSheets } from './google-sheets';
import { syncToHubSpot } from './hubspot';

interface SyncContext {
  userId: number;
  userIntegrationId: number;
  integrationId: number;
  slug: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  config: any;
  apiKey: string | null;
}

type SyncHandler = (ctx: SyncContext, leads: any[]) => Promise<{ success: boolean; error?: string; syncedCount: number }>;

const HANDLERS: Record<string, SyncHandler> = {
  'google-sheets': async (ctx, leads) => {
    if (!ctx.accessToken) return { success: false, error: 'Not authenticated', syncedCount: 0 };
    return syncToGoogleSheets(
      ctx.accessToken,
      ctx.refreshToken,
      ctx.tokenExpiry,
      ctx.config,
      leads
    );
  },
  'hubspot': async (ctx, leads) => {
    if (!ctx.accessToken) return { success: false, error: 'Not authenticated', syncedCount: 0 };
    return syncToHubSpot(
      ctx.accessToken,
      ctx.refreshToken,
      ctx.tokenExpiry,
      leads
    );
  },
  'zapier': async (ctx, leads) => sendWebhook(ctx, leads),
  'make': async (ctx, leads) => sendWebhook(ctx, leads),
  'webhook': async (ctx, leads) => sendWebhook(ctx, leads),
  'slack': async (ctx, leads) => sendSlackNotification(ctx, leads),
};

async function sendWebhook(ctx: SyncContext, leads: any[]): Promise<{ success: boolean; error?: string; syncedCount: number }> {
  const webhookUrl = ctx.config?.webhookUrl;
  if (!webhookUrl) return { success: false, error: 'No webhook URL configured', syncedCount: 0 };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'task.completed',
        leads: leads.slice(0, 100), // Limit payload
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Webhook returned ${res.status}`, syncedCount: leads.length };
    }

    return { success: true, syncedCount: leads.length };
  } catch (error: any) {
    return { success: false, error: error.message, syncedCount: 0 };
  }
}

async function sendSlackNotification(ctx: SyncContext, leads: any[]): Promise<{ success: boolean; error?: string; syncedCount: number }> {
  const webhookUrl = ctx.config?.webhookUrl;
  if (!webhookUrl) return { success: false, error: 'No Slack webhook URL configured', syncedCount: 0 };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Task Completed*\n*Leads:* ${leads.length}\n*Time:* ${new Date().toLocaleString()}`,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Slack returned ${res.status}`, syncedCount: 0 };
    }

    return { success: true, syncedCount: leads.length };
  } catch (error: any) {
    return { success: false, error: error.message, syncedCount: 0 };
  }
}

export async function dispatchSync(ctx: SyncContext, leads: any[]): Promise<{ success: boolean; error?: string; syncedCount: number }> {
  const handler = HANDLERS[ctx.slug];
  if (!handler) {
    return { success: false, error: `No sync handler for: ${ctx.slug}`, syncedCount: 0 };
  }
  return handler(ctx, leads);
}
