import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { getClientIp } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const payload = decodeJWT(token);
    const { email, name } = payload;

    if (!email) {
      return NextResponse.json({ success: false, error: 'No email in token' }, { status: 400 });
    }

    const ip = await getClientIp(request.headers);
    await AuthService.googleLogin(email, name || email.split('@')[0], ip);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google auth callback error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_auth_params`
    );
  }

  const storedState = request.cookies.get('google_auth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    if (!userInfo.email) {
      throw new Error('No email received from Google');
    }

    const ip = await getClientIp(request.headers);
    await AuthService.googleLogin(userInfo.email, userInfo.name || userInfo.email.split('@')[0], ip);

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/leads?welcome=google`
    );

    response.cookies.delete('google_auth_state');
    response.cookies.delete('google_auth_type');

    return response;
  } catch (error: any) {
    console.error('Google auth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error.message)}`
    );
  }
}

function decodeJWT(token: string): { email?: string; name?: string } {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

async function exchangeCodeForTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}