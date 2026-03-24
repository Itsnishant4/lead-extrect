import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { userIntegrations, integrations, taskLeads, leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '@/lib/integrations/encryption';
import { dispatchSync } from '@/lib/integrations/dispatcher';
import { IntegrationService } from '@/services/integration.service';

// Called by the worker after task completion
// POST /api/integrations/sync { userId, taskId, leadCount }
export async function POST(request: NextRequest) {
  try {
    // Verify internal API key
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.INTERNAL_API_KEY;
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, taskId } = await request.json();
    if (!userId || !taskId) {
      return NextResponse.json({ error: 'userId and taskId are required' }, { status: 400 });
    }

    // Get user's active integrations
    const userInts = await db.select({
      id: userIntegrations.id,
      integrationId: userIntegrations.integrationId,
      accessToken: userIntegrations.accessToken,
      refreshToken: userIntegrations.refreshToken,
      tokenExpiry: userIntegrations.tokenExpiry,
      apiKey: userIntegrations.apiKey,
      config: userIntegrations.config,
      slug: integrations.slug,
      name: integrations.name,
    })
      .from(userIntegrations)
      .innerJoin(integrations, eq(userIntegrations.integrationId, integrations.id))
      .where(and(
        eq(userIntegrations.userId, userId),
        eq(userIntegrations.isEnabled, true),
        eq(integrations.isActive, true)
      ));

    if (userInts.length === 0) {
      return NextResponse.json({ success: true, message: 'No active integrations', synced: 0 });
    }

    // Fetch leads for this task
    const taskLeadsData = await db.select({
      name: leads.name,
      address: leads.address,
      city: leads.city,
      phone: leads.phone,
      email: leads.email,
      website: leads.website,
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

    let totalSynced = 0;
    const results: any[] = [];

    for (const ui of userInts) {
      // Decrypt tokens if present
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (ui.accessToken) {
        try {
          accessToken = decrypt(ui.accessToken);
        } catch {
          continue; // Skip if token can't be decrypted
        }
      }
      if (ui.refreshToken) {
        try {
          refreshToken = ui.refreshToken; // Keep encrypted for the dispatcher to handle
        } catch {}
      }

      const result = await dispatchSync(
        {
          userId,
          userIntegrationId: ui.id,
          integrationId: ui.integrationId,
          slug: ui.slug,
          accessToken,
          refreshToken,
          tokenExpiry: normalizeTokenExpiry(ui.tokenExpiry),
          config: ui.config,
          apiKey: ui.apiKey,
        },
        taskLeadsData
      );

      // Update sync stats
      await IntegrationService.updateSyncStats(
        ui.id,
        result.success ? 'success' : 'failed',
        result.syncedCount,
        result.error
      );

      // Log the sync
      await IntegrationService.addLog({
        userId,
        integrationId: ui.integrationId,
        taskId,
        action: 'sync',
        status: result.success ? 'success' : 'failed',
        leadsCount: result.syncedCount,
        errorMessage: result.error,
      });

      if (result.success) totalSynced += result.syncedCount;
      results.push({
        integration: ui.slug,
        success: result.success,
        synced: result.syncedCount,
        error: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      totalSynced,
      results,
    });
  } catch (error: any) {
    console.error('Integration sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function normalizeTokenExpiry(value: unknown): number | null {
  if (typeof value === 'number') {
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value;
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  return null;
}
