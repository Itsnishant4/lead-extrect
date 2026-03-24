import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { integrations, userIntegrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens, getProviderForSlug } from '@/lib/integrations/oauth';
import { encrypt } from '@/lib/integrations/encryption';
import { IntegrationService } from '@/services/integration.service';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth error
  if (error) {
    const errorDescription = searchParams.get('error_description') || error;
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=Missing+authorization+code`
    );
  }

  // Validate state from cookie
  const storedState = request.cookies.get('oauth_state')?.value;
  const userId = request.cookies.get('oauth_user_id')?.value;
  const slug = request.cookies.get('oauth_integration_slug')?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=Invalid+state+token`
    );
  }

  if (!userId || !slug) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=Missing+session+data`
    );
  }

  try {
    const provider = getProviderForSlug(slug);
    if (!provider) {
      throw new Error('Unsupported OAuth provider');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);

    // Find the integration
    const rows = await db.select().from(integrations).where(eq(integrations.slug, slug)).limit(1);
    const integration = rows[0];
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Encrypt tokens before storing
    const encryptedAccess = encrypt(tokens.accessToken);
    const encryptedRefresh = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

    // Upsert user integration
    const existing = await db.select()
      .from(userIntegrations)
      .where(and(
        eq(userIntegrations.userId, Number(userId)),
        eq(userIntegrations.integrationId, integration.id)
      ))
      .limit(1);

    // Create config object. Google Sheets files are created at sync time so each task can
    // generate its own spreadsheet with a task-specific name.
    let config: any = existing[0]?.config || {};

    if (slug === 'slack') {
      config = {
        ...config,
        webhookUrl: tokens.extra?.incoming_webhook?.url || config.webhookUrl,
        channelId: tokens.extra?.incoming_webhook?.channel_id || config.channelId,
        channelName: tokens.extra?.incoming_webhook?.channel || config.channelName,
        workspaceName: tokens.extra?.team?.name || config.workspaceName,
      };
    }

    if (slug === 'hubspot') {
      config = {
        ...config,
        hubId: tokens.extra?.hub_id || config.hubId,
      };
    }

    if (existing.length > 0) {
      await db.update(userIntegrations).set({
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiry: tokens.expiresAt || null,
        isEnabled: true,
        lastError: null,
        config,
        updatedAt: sql`(unixepoch())`,
      }).where(eq(userIntegrations.id, existing[0].id));
    } else {
      await db.insert(userIntegrations).values({
        userId: Number(userId),
        integrationId: integration.id,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiry: tokens.expiresAt || null,
        config,
      });
    }

    // Log the connection
    await IntegrationService.addLog({
      userId: Number(userId),
      integrationId: integration.id,
      action: 'oauth_connect',
      status: 'success',
      metadata: { provider },
    });

    // Redirect with success
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?connected=${slug}`
    );

    // Clear OAuth cookies
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_user_id');
    response.cookies.delete('oauth_integration_slug');

    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(error.message)}`
    );
  }
}
