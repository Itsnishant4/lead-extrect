import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Email Verification (structural) ──

const COMMON_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'live.com', 'msn.com', 'me.com', 'mac.com',
]);

const SUSPICIOUS_PATTERNS = [
  /^test@/i, /^example@/i, /^noreply@/i, /^no-reply@/i,
  /^admin@/i, /^info@/i, /^contact@/i, /^hello@/i,
  /^x+@/i, /^[0-9]+@/, /@.*\.(test|example|invalid|localhost)$/i,
];

export function verifyEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) return false;

  const [local, domain] = trimmed.split('@');

  // Domain must have a dot and valid TLD
  if (!domain || !domain.includes('.')) return false;
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || tld.length > 6) return false;

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // Local part must be 1-64 chars
  if (local.length < 1 || local.length > 64) return false;

  return true;
}

// ── Lead Score Computation ──

export function computeLeadScore(lead: {
  rating?: number | null;
  reviewsCount?: number | null;
  email?: string | null;
  websiteEmail?: string | null;
  phone?: string | null;
  websitePhone?: string | null;
}): number {
  let score = 0;

  // Rating: up to 50 points (5.0 = 50)
  if (lead.rating && lead.rating > 0) {
    score += Math.min(lead.rating * 10, 50);
  }

  // Reviews: up to 20 points (log scale)
  if (lead.reviewsCount && lead.reviewsCount > 0) {
    score += Math.min(Math.log(lead.reviewsCount + 1) * 10, 20);
  }

  // Email: 15 points
  if (lead.email || lead.websiteEmail) {
    score += 15;
  }

  // Phone: 15 points
  if (lead.phone || lead.websitePhone) {
    score += 15;
  }

  return Math.round(score);
}

// ── CSV Generation ──

const CSV_HEADERS = [
  'Name', 'Category', 'Rating', 'Reviews', 'Phone', 'Website Phone',
  'Email', 'Website Email', 'Website', 'Address', 'City',
  'Latitude', 'Longitude', 'Place ID',
  'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Pinterest', 'TikTok',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const CSV_HEADERS_WITH_SCORE = [...CSV_HEADERS, 'Lead Score'];
const CSV_HEADERS_WITH_EMAIL_VERIFIED = [...CSV_HEADERS, 'Email Verified'];
const CSV_HEADERS_WITH_BOTH = [...CSV_HEADERS, 'Lead Score', 'Email Verified'];

function escapeCsv(val: any, numeric = false): string {
  if (val === null || val === undefined) return '';
  if (numeric) {
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : '';
  }
  const str = String(val);
  if (/^[=+\-@]/.test(str)) return "'" + str;
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const E164_RE = /^\+[1-9]\d{6,14}$/;

/** Split multi-value field, keep only E164-shaped numbers, join with '; '. */
export function sanitizePhoneList(val: any, max = 3): string {
  if (val === null || val === undefined) return '';
  const parts = String(val)
    .split(/[,;]+/)
    .map((s) => s.trim().replace(/^'+/, ''))
    .filter((s) => E164_RE.test(s));
  return [...new Set(parts)].slice(0, max).join('; ');
}

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** First plausible email across email + websiteEmail (sanitized). */
export function firstEmail(lead: any): string | null {
  const all = [sanitizeEmailList(lead.email, 1), sanitizeEmailList(lead.websiteEmail, 1)].filter(Boolean);
  return all.length > 0 ? all[0] : null;
}

/** Split multi-value field, keep only plausible emails, join with '; '. */
export function sanitizeEmailList(val: any, max = 3): string {
  if (val === null || val === undefined) return '';
  const parts = String(val)
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter((s) => EMAIL_RE.test(s));
  return [...new Set(parts)].slice(0, max).join('; ');
}

function leadToCsvRow(lead: any, withScore: boolean, withEmailVerified: boolean): string {
  const base = [
    escapeCsv(lead.name), escapeCsv(lead.category),
    escapeCsv(lead.rating, true), escapeCsv(lead.reviewsCount, true),
    escapeCsv(lead.phone), escapeCsv(sanitizePhoneList(lead.websitePhone)),
    escapeCsv(sanitizeEmailList(lead.email)), escapeCsv(sanitizeEmailList(lead.websiteEmail)),
    escapeCsv(lead.website), escapeCsv(lead.address), escapeCsv(lead.city),
    escapeCsv(lead.latitude, true), escapeCsv(lead.longitude, true), escapeCsv(lead.placeId),
    escapeCsv(lead.facebook), escapeCsv(lead.instagram), escapeCsv(lead.linkedin),
    escapeCsv(lead.twitter), escapeCsv(lead.youtube), escapeCsv(lead.pinterest), escapeCsv(lead.tiktok),
    escapeCsv(lead.mondayHours), escapeCsv(lead.tuesdayHours), escapeCsv(lead.wednesdayHours),
    escapeCsv(lead.thursdayHours), escapeCsv(lead.fridayHours), escapeCsv(lead.saturdayHours),
    escapeCsv(lead.sundayHours),
  ];

  if (withScore) base.push(String(computeLeadScore(lead)));
  if (withEmailVerified) {
    const hasEmail = !!(lead.email || lead.websiteEmail);
    base.push(hasEmail ? (verifyEmail(lead.email || lead.websiteEmail) ? 'Yes' : 'No') : 'No Email');
  }

  return base.join(',');
}

export function generateCsv(leads: any[], withScore: boolean, withEmailVerified: boolean): string {
  let headers = CSV_HEADERS;
  if (withScore && withEmailVerified) headers = CSV_HEADERS_WITH_BOTH;
  else if (withScore) headers = CSV_HEADERS_WITH_SCORE;
  else if (withEmailVerified) headers = CSV_HEADERS_WITH_EMAIL_VERIFIED;

  const rows = leads.map(lead => leadToCsvRow(lead, withScore, withEmailVerified));
  return [headers.join(','), ...rows].join('\n');
}

// ── JSON Generation ──

export function generateJson(leads: any[], withScore: boolean, withEmailVerified: boolean): string {
  const data = leads.map(lead => {
    const obj: any = {
      name: lead.name, category: lead.category, rating: lead.rating, reviewsCount: lead.reviewsCount,
      phone: lead.phone, websitePhone: lead.websitePhone, email: lead.email, websiteEmail: lead.websiteEmail,
      website: lead.website, address: lead.address, city: lead.city,
      latitude: lead.latitude, longitude: lead.longitude, placeId: lead.placeId,
      facebook: lead.facebook, instagram: lead.instagram, linkedin: lead.linkedin,
      twitter: lead.twitter, youtube: lead.youtube, pinterest: lead.pinterest, tiktok: lead.tiktok,
      mondayHours: lead.mondayHours, tuesdayHours: lead.tuesdayHours, wednesdayHours: lead.wednesdayHours,
      thursdayHours: lead.thursdayHours, fridayHours: lead.fridayHours, saturdayHours: lead.saturdayHours, sundayHours: lead.sundayHours,
    };
    if (withScore) obj.leadScore = computeLeadScore(lead);
    if (withEmailVerified) {
      const hasEmail = !!(lead.email || lead.websiteEmail);
      obj.emailVerified = hasEmail ? verifyEmail(firstEmail(lead)) : null;
    }
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

// ── Excel Generation ──

export function generateExcel(leads: any[], withScore: boolean, withEmailVerified: boolean): Buffer {
  const rows = leads.map(lead => {
    const row: any = {
      'Name': lead.name, 'Category': lead.category, 'Rating': lead.rating, 'Reviews': lead.reviewsCount,
      'Phone': lead.phone, 'Website Phone': lead.websitePhone, 'Email': lead.email, 'Website Email': lead.websiteEmail,
      'Website': lead.website, 'Address': lead.address, 'City': lead.city,
      'Latitude': lead.latitude, 'Longitude': lead.longitude, 'Place ID': lead.placeId,
      'Facebook': lead.facebook, 'Instagram': lead.instagram, 'LinkedIn': lead.linkedin,
      'Twitter': lead.twitter, 'YouTube': lead.youtube, 'Pinterest': lead.pinterest, 'TikTok': lead.tiktok,
      'Monday': lead.mondayHours, 'Tuesday': lead.tuesdayHours, 'Wednesday': lead.wednesdayHours,
      'Thursday': lead.thursdayHours, 'Friday': lead.fridayHours, 'Saturday': lead.saturdayHours, 'Sunday': lead.sundayHours,
    };
    if (withScore) row['Lead Score'] = computeLeadScore(lead);
    if (withEmailVerified) {
      const hasEmail = !!(lead.email || lead.websiteEmail);
      row['Email Verified'] = hasEmail ? (verifyEmail(firstEmail(lead)) ? 'Yes' : 'No') : 'No Email';
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer;
}

// ── PDF Generation ──

export function generatePdf(leads: any[], withScore: boolean, withEmailVerified: boolean): Buffer {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.text('Lead Export', 14, 15);
  doc.setFontSize(10);
  doc.text(`${leads.length} leads exported`, 14, 22);

  // Build table headers
  const headers = ['Name', 'Category', 'Rating', 'Phone', 'Email', 'Website', 'City'];
  if (withScore) headers.push('Score');
  if (withEmailVerified) headers.push('Email Verified');

  // Build table rows
  const rows = leads.map(lead => {
    const row = [
      lead.name || '', lead.category || '', lead.rating?.toString() || '',
      lead.phone || lead.websitePhone || '', lead.email || lead.websiteEmail || '',
      lead.website || '', lead.city || '',
    ];
    if (withScore) row.push(String(computeLeadScore(lead)));
    if (withEmailVerified) {
      const hasEmail = !!(lead.email || lead.websiteEmail);
      row.push(hasEmail ? (verifyEmail(firstEmail(lead)) ? 'Yes' : 'No') : 'No Email');
    }
    return row;
  });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' as const },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    columnStyles: {
      0: { cellWidth: 35 },
    },
    margin: { top: 28, left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  return Buffer.from(doc.output('arraybuffer'));
}

// ── Format detection ──

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

export const FORMAT_CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: '.csv',
  json: '.json',
  xlsx: '.xlsx',
  pdf: '.pdf',
};

export const ALL_EXPORT_FORMATS: ExportFormat[] = ['csv', 'json', 'xlsx', 'pdf'];

export function hasFeature(features: string[] | null | undefined, feature: string): boolean {
  if (!features) return false;
  return features.includes(feature);
}
