import { randomBytes, createHash } from 'crypto';

const PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: () => process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback?provider=google`,
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['crm.objects.contacts.write', 'crm.objects.contacts.read'],
    clientId: () => process.env.HUBSPOT_CLIENT_ID,
    clientSecret: () => process.env.HUBSPOT_CLIENT_SECRET,
    redirectUri: () => process.env.HUBSPOT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback?provider=hubspot`,
  },
  // Salesforce requires paid Salesforce account
  // salesforce: {
  //   authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
  //   tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
  //   scopes: ['api', 'refresh_token'],
  //   clientId: () => process.env.SALESFORCE_CLIENT_ID,
  //   clientSecret: () => process.env.SALESFORCE_CLIENT_SECRET,
  //   redirectUri: () => process.env.SALESFORCE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback?provider=salesforce`,
  // },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['incoming-webhook'],
    clientId: () => process.env.SLACK_CLIENT_ID,
    clientSecret: () => process.env.SLACK_CLIENT_SECRET,
    redirectUri: () => process.env.SLACK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback?provider=slack`,
  },
} as const;

export type OAuthProvider = keyof typeof PROVIDERS;

export function generateStateToken(): string {
  return randomBytes(32).toString('hex');
}

export function buildAuthUrl(provider: OAuthProvider, state: string): string {
  const config = PROVIDERS[provider];
  const clientId = config.clientId();
  if (!clientId) {
    throw new Error(`${provider.toUpperCase()}_CLIENT_ID environment variable is not set`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: config.redirectUri(),
    response_type: 'code',
    scope: config.scopes.join(provider === 'google' ? ' ' : ' '),
    state,
    access_type: 'offline',
    ...(provider === 'google' ? { prompt: 'consent' } : {}),
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  extra?: Record<string, any>;
}> {
  const config = PROVIDERS[provider];

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId()!,
    client_secret: config.clientSecret()!,
    redirect_uri: config.redirectUri(),
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${provider} token exchange failed: ${error}`);
  }

  const data = await response.json();

  let expiresAt: Date | undefined;
  if (data.expires_in) {
    expiresAt = new Date(Date.now() + data.expires_in * 1000);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    extra: data,
  };
}

export async function refreshAccessToken(
  provider: OAuthProvider,
  refreshToken: string
): Promise<{
  accessToken: string;
  expiresAt?: Date;
}> {
  const config = PROVIDERS[provider];

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId()!,
    client_secret: config.clientSecret()!,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${provider} token refresh failed: ${error}`);
  }

  const data = await response.json();

  let expiresAt: Date | undefined;
  if (data.expires_in) {
    expiresAt = new Date(Date.now() + data.expires_in * 1000);
  }

  return {
    accessToken: data.access_token,
    expiresAt,
  };
}

export function getProviderForSlug(slug: string): OAuthProvider | null {
  const map: Record<string, OAuthProvider> = {
    'google-sheets': 'google',
    'hubspot': 'hubspot',
    // 'salesforce': 'salesforce', // Requires paid Salesforce account
    'slack': 'slack',
  };
  return map[slug] || null;
}
