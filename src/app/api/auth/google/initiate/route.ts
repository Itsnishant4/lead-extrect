import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { buildAuthUrl, generateStateToken } from '@/lib/integrations/oauth';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json(); // 'login' or 'signup'
    
    const state = generateStateToken();
    
    // Build Google OAuth URL for authentication (different from Sheets scopes)
    const googleAuthUrl = buildGoogleAuthUrl(state);
    
    const response = NextResponse.json({ success: true, url: googleAuthUrl });
    
    // Store state and type in cookies for validation
    response.cookies.set('google_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });
    response.cookies.set('google_auth_type', type || 'login', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google auth initiate error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start Google auth' }, { status: 500 });
  }
}

function buildGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}