import { decrypt } from '@/lib/integrations/encryption';
import { refreshAccessToken } from '@/lib/integrations/oauth';

interface HubSpotLead {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export async function syncToHubSpot(
  accessToken: string,
  refreshToken: string | null,
  tokenExpiry: number | null,
  leads: HubSpotLead[]
): Promise<{ success: boolean; error?: string; syncedCount: number; refreshedToken?: { accessToken: string; expiresAt?: Date } }> {
  if (!leads.length) return { success: true, syncedCount: 0 };

  try {
    let token = maybeDecryptToken(accessToken);
    const decryptedRefresh = refreshToken ? maybeDecryptToken(refreshToken) : null;
    const expiresAt = normalizeTokenExpiry(tokenExpiry);

    let refreshedTokenInfo: { accessToken: string; expiresAt?: Date } | undefined;

    const getRefreshedTokenLocal = async (rt: string) => {
      const refreshed = await refreshAccessToken('hubspot', rt);
      refreshedTokenInfo = {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      };
      return refreshed.accessToken;
    };

    if (shouldRefreshToken(expiresAt, decryptedRefresh)) {
      token = await getRefreshedTokenLocal(decryptedRefresh!);
    }

    let syncedCount = 0;
    let lastError: string | undefined;

    for (const lead of leads) {
      const properties = buildHubSpotContactProperties(lead);

      if (Object.keys(properties).length === 0) {
        continue;
      }

      let response = await createHubSpotContact(token, properties);
      if (response.status === 401 && decryptedRefresh) {
        token = await getRefreshedTokenLocal(decryptedRefresh);
        response = await createHubSpotContact(token, properties);
      }

      if (response.ok) {
        syncedCount += 1;
        continue;
      }

      const errorBody = await response.text();
      lastError = `HubSpot API error: ${errorBody}`;
    }

    if (syncedCount === 0 && lastError) {
      return { success: false, error: lastError, syncedCount: 0 };
    }

    if (lastError) {
      return {
        success: true,
        error: `${lastError} Some leads may have been skipped.`,
        syncedCount,
        refreshedToken: refreshedTokenInfo,
      };
    }

    return { success: true, syncedCount, refreshedToken: refreshedTokenInfo };
  } catch (error: any) {
    return { success: false, error: error.message, syncedCount: 0 };
  }
}

async function createHubSpotContact(token: string, properties: Record<string, string>) {
  return fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties,
    }),
  });
}

function buildHubSpotContactProperties(lead: HubSpotLead): Record<string, string> {
  const properties: Record<string, string> = {};

  if (lead.name) {
    properties.firstname = lead.name.trim().slice(0, 255);
    properties.company = lead.name.trim().slice(0, 255);
  }
  if (lead.email) properties.email = lead.email.trim();
  if (lead.phone) properties.phone = lead.phone.trim();
  if (lead.website) properties.website = lead.website.trim();
  if (lead.city) properties.city = lead.city.trim();
  if (lead.address) properties.address = lead.address.trim();

  properties.lifecyclestage = 'lead';

  return properties;
}

function maybeDecryptToken(token: string): string {
  try {
    return decrypt(token);
  } catch {
    return token;
  }
}

function normalizeTokenExpiry(tokenExpiry: number | null): number | null {
  if (!tokenExpiry) return null;
  return tokenExpiry > 1_000_000_000_000 ? Math.floor(tokenExpiry / 1000) : tokenExpiry;
}

function shouldRefreshToken(tokenExpiry: number | null, refreshToken: string | null): boolean {
  if (!tokenExpiry || !refreshToken) return false;
  return Date.now() / 1000 > tokenExpiry - 300;
}
