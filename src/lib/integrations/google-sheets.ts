import { decrypt } from '@/lib/integrations/encryption';
import { refreshAccessToken } from '@/lib/integrations/oauth';

interface SheetRow {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  leadScore?: number;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

const HEADERS = [
  'Name', 'Address', 'City', 'Phone', 'Email', 'Website',
  'Rating', 'Reviews', 'Category', 'Lead Score',
  'Facebook', 'Instagram', 'LinkedIn', 'Twitter',
];

export async function syncToGoogleSheets(
  accessToken: string,
  refreshToken: string | null,
  tokenExpiry: number | null,
  config: any,
  leads: SheetRow[]
): Promise<{ success: boolean; error?: string; syncedCount: number }> {
  if (!leads.length) return { success: true, syncedCount: 0 };

  const spreadsheetId = config?.spreadsheetId;
  if (!spreadsheetId) {
    return { success: false, error: 'No spreadsheet ID configured', syncedCount: 0 };
  }

  const sheetName = config?.sheetName || 'Leads';

  try {
    let token = maybeDecryptToken(accessToken);
    const decryptedRefresh = refreshToken ? maybeDecryptToken(refreshToken) : null;
    const expiresAt = normalizeTokenExpiry(tokenExpiry);

    if (shouldRefreshToken(expiresAt, decryptedRefresh)) {
      token = await getRefreshedToken(decryptedRefresh!);
    }

    // Build rows
    const rows = leads.map(lead => [
      lead.name || '',
      lead.address || '',
      lead.city || '',
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.rating?.toString() || '',
      lead.reviewsCount?.toString() || '',
      lead.category || '',
      lead.leadScore?.toString() || '',
      lead.facebook || '',
      lead.instagram || '',
      lead.linkedin || '',
      lead.twitter || '',
    ]);

    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:N1`;
    let checkRes = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (checkRes.status === 401 && decryptedRefresh) {
      token = await getRefreshedToken(decryptedRefresh);
      checkRes = await fetch(checkUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (checkRes.status === 401) {
      const error = await checkRes.text();
      return { success: false, error: `Sheets API error: ${error}`, syncedCount: 0 };
    }

    // Check if sheet has headers (read first row)
    let needsHeaders = true;
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      needsHeaders = !checkData.values || checkData.values.length === 0;
    }

    // Append in batches of 1000 (API limit)
    const batchSize = 1000;
    let syncedCount = 0;

    if (needsHeaders) {
      // Write headers first
      const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:N1?valueInputOption=RAW`;
      const headerRes = await fetch(headerUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [HEADERS] }),
      });

      if (!headerRes.ok) {
        const error = await headerRes.text();
        return { success: false, error: `Sheets API error: ${error}`, syncedCount: 0 };
      }
    }

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: batch }),
      });

      if (!res.ok) {
        const error = await res.text();
        return { success: false, error: `Sheets API error: ${error}`, syncedCount };
      }

      syncedCount += batch.length;
    }

    return { success: true, syncedCount };
  } catch (error: any) {
    return { success: false, error: error.message, syncedCount: 0 };
  }
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

async function getRefreshedToken(refreshToken: string): Promise<string> {
  const refreshed = await refreshAccessToken('google', refreshToken);
  return refreshed.accessToken;
}
