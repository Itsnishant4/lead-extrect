import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { tasks, leads as leadsTable, taskLeads, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { handleApiError, validateRequest } from '@/lib/utils/api-error-handler';
import { z } from 'zod';
import { PlanService } from '@/services/plan.service';
import {
  generateCsv, generateJson, generateExcel, generatePdf,
  computeLeadScore, verifyEmail,
  type ExportFormat,
  FORMAT_CONTENT_TYPES, FORMAT_EXTENSIONS,
  hasFeature,
} from '@/lib/export-utils';

const exportFiltersSchema = z.object({
  hasEmail: z.coerce.boolean().optional(),
  hasPhone: z.coerce.boolean().optional(),
  hasWebsite: z.coerce.boolean().optional(),
  hasSocials: z.coerce.boolean().optional(),
  hasRating: z.coerce.boolean().optional(),
  hasAddress: z.coerce.boolean().optional(),
  hasVerifiedEmail: z.coerce.boolean().optional(),
  format: z.enum(['csv', 'json', 'xlsx', 'pdf']).optional().default('csv'),
});

const validateExportFilters = validateRequest(exportFiltersSchema);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const resolvedParams = await params;
    const rawId = resolvedParams?.taskId ?? url.pathname.split('/').pop() ?? '';
    const taskId = Number.parseInt(rawId, 10);

    if (!taskId || Number.isNaN(taskId) || taskId <= 0) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const filters = validateExportFilters(Object.fromEntries(url.searchParams));
    const format: ExportFormat = filters.format || 'csv';

    // ── Check user plan permissions ──
    const userRows = await db.select({ planType: users.planType }).from(users).where(eq(users.id, session.id)).limit(1);
    const userPlanType = userRows[0]?.planType || 'free';
    const plan = await PlanService.getPlanByName(userPlanType);
    const planFeatures: string[] = (plan?.features as string[]) || ['CSV Export'];

    // Validate format permission
    const formatFeatureMap: Record<ExportFormat, string> = {
      csv: 'CSV Export',
      json: 'JSON Export',
      xlsx: 'Excel Export',
      pdf: 'PDF Export',
    };
    if (!hasFeature(planFeatures, formatFeatureMap[format])) {
      return NextResponse.json({
        error: `${format.toUpperCase()} export is not available on your current plan. Please upgrade to access this format.`,
      }, { status: 403 });
    }

    // Check feature flags
    const hasLeadScoring = hasFeature(planFeatures, 'Lead Scoring');
    const hasEmailVerification = hasFeature(planFeatures, 'Email Verification');

    const taskRows = await db.select({
      name: tasks.name,
      exportFileIds: tasks.exportFileIds
    }).from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, session.id))).limit(1);

    if (!taskRows[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = taskRows[0];

    const { hasEmail, hasPhone, hasWebsite, hasSocials, hasRating, hasAddress, hasVerifiedEmail } = filters;
    const hasFilters = hasEmail || hasPhone || hasWebsite || hasSocials || hasRating || hasAddress || hasVerifiedEmail;

    // ── Try Telegram file merge first (CSV only) ──
    const fileIds = task.exportFileIds ? (() => {
      try { return JSON.parse(task.exportFileIds); } catch { return []; }
    })() : [];
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (fileIds.length > 0 && token && format === 'csv') {
      try {
        const files: string[] = [];
        for (const fileId of fileIds) {
          const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
          const fileJson = await fileRes.json();
          const filePath = fileJson?.result?.file_path;
          if (filePath) {
            const downloadRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
            const content = await downloadRes.text();
            files.push(content);
          }
        }

        if (files.length > 0) {
          let mergedLines: string[] = [];
          let headerLine = "";

          files.forEach((content, index) => {
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            if (lines.length === 0) return;
            if (index === 0) {
              headerLine = lines[0];
              mergedLines.push(...lines.slice(1));
            } else {
              mergedLines.push(...lines.slice(1));
            }
          });

          const parseCsvRow = (text: string) => {
            let p = '', row = [''], i = 0, s = !0, l;
            for (l of text) {
              if ('"' === l) {
                if (s && l === p) row[i] += l;
                s = !s;
              } else if (',' === l && s) l = row[++i] = '';
              else row[i] += l;
              p = l;
            }
            return row;
          };

          if (hasFilters) {
            mergedLines = mergedLines.filter(line => {
              const cols = parseCsvRow(line);
              if (hasEmail && !cols[6] && !cols[7]) return false;
              if (hasPhone && !cols[4] && !cols[5]) return false;
              if (hasWebsite && !cols[8]) return false;
              if (hasAddress && (!cols[9] || cols[9].length < 5)) return false;
              if (hasRating && (!cols[2] || Number(cols[2]) <= 0)) return false;
              if (hasSocials) {
                const hasAnySocial = cols.slice(14, 21).some(s => s && s.trim().length > 0);
                if (!hasAnySocial) return false;
              }
              if (hasVerifiedEmail) {
                const email = cols[6] || cols[7];
                if (!email || !verifyEmail(email)) return false;
              }
              return true;
            });
          }

          if (mergedLines.length === 0) {
            return NextResponse.json({ error: 'No leads match filters in the downloaded file' }, { status: 404 });
          }

          let output = [headerLine, ...mergedLines].join('\n');
          output = output
            .replace(/(^|,)"([=+\-@])/gm, '$1"\'$2')
            .replace(/(^|,)([=+\-@])/gm, "$1'$2");

          const filename = `${task.name?.replace(/\s+/g, '_') || 'task'}_export.csv`;
          return new NextResponse(output, {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        }
      } catch (e) {
        console.error('Failed to merge/filter telegram files, falling back to DB', e);
      }
    }

    // ── Database fallback ──
    const leadsRes = await db.select()
      .from(leadsTable)
      .innerJoin(taskLeads, eq(leadsTable.id, taskLeads.leadId))
      .where(eq(taskLeads.taskId, taskId));

    let filteredLeads = leadsRes.map(r => r.leads).filter(lead => {
      if (hasEmail && !lead.email && !lead.websiteEmail) return false;
      if (hasPhone && !lead.phone && !lead.websitePhone) return false;
      if (hasWebsite && !lead.website) return false;
      if (hasAddress && (!lead.address || lead.address.length < 5)) return false;
      if (hasRating && (!lead.rating || lead.rating <= 0)) return false;
      if (hasSocials) {
        const socials = [lead.facebook, lead.instagram, lead.linkedin, lead.twitter, lead.youtube, lead.pinterest, lead.tiktok];
        if (!socials.some(s => s && s.length > 0)) return false;
      }
      if (hasVerifiedEmail) {
        const email = lead.email || lead.websiteEmail;
        if (!email || !verifyEmail(email)) return false;
      }
      return true;
    });

    if (filteredLeads.length === 0) {
      return NextResponse.json({ error: 'No leads match filters' }, { status: 404 });
    }

    // ── Generate output in requested format ──
    const filename = `${task.name?.replace(/\s+/g, '_') || 'task'}_export${FORMAT_EXTENSIONS[format]}`;
    const contentType = FORMAT_CONTENT_TYPES[format];
    let body: BodyInit;

    switch (format) {
      case 'csv': {
        body = generateCsv(filteredLeads, hasLeadScoring, hasEmailVerification);
        break;
      }
      case 'json': {
        body = generateJson(filteredLeads, hasLeadScoring, hasEmailVerification);
        break;
      }
      case 'xlsx': {
        const xlsxBuf = generateExcel(filteredLeads, hasLeadScoring, hasEmailVerification);
        body = new Uint8Array(xlsxBuf as unknown as ArrayBuffer);
        break;
      }
      case 'pdf': {
        const pdfBuf = generatePdf(filteredLeads, hasLeadScoring, hasEmailVerification);
        body = new Uint8Array(pdfBuf as unknown as ArrayBuffer);
        break;
      }
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
