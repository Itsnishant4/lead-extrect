import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { integrations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildAuthUrl, generateStateToken, getProviderForSlug } from '@/lib/integrations/oauth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Integration slug is required' }, { status: 400 });
    }

    // Find the integration
    const rows = await db.select().from(integrations).where(eq(integrations.slug, slug)).limit(1);
    const integration = rows[0];
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    if (!integration.isActive) {
      return NextResponse.json({ error: 'Integration is currently unavailable' }, { status: 400 });
    }
    if (!integration.oauthProvider) {
      return NextResponse.json({ error: 'This integration does not use OAuth' }, { status: 400 });
    }

    const provider = getProviderForSlug(slug);
    if (!provider) {
      return NextResponse.json({ error: 'Unsupported OAuth provider' }, { status: 400 });
    }

    // Generate state token and store it
    const state = generateStateToken();

    // Store state in a cookie for CSRF protection
    const response = NextResponse.json({ success: true, url: buildAuthUrl(provider, state) });
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });
    response.cookies.set('oauth_user_id', String(session.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    response.cookies.set('oauth_integration_slug', slug, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('OAuth initiate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
