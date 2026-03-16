import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { tasks, leads as leadsTable, taskLeads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { handleApiError, validateRequest } from '@/lib/utils/api-error-handler';
import { z } from 'zod';

const exportFiltersSchema = z.object({
  hasEmail: z.coerce.boolean().optional(),
  hasPhone: z.coerce.boolean().optional(),
  hasWebsite: z.coerce.boolean().optional(),
  hasSocials: z.coerce.boolean().optional(),
  hasRating: z.coerce.boolean().optional(),
  hasAddress: z.coerce.boolean().optional(),
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

    const taskRows = await db.select({ 
      name: tasks.name, 
      exportFileIds: tasks.exportFileIds 
    }).from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, session.id))).limit(1);

    if (!taskRows[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = taskRows[0];

    const { hasEmail, hasPhone, hasWebsite, hasSocials, hasRating, hasAddress } = filters;
    const hasFilters = hasEmail || hasPhone || hasWebsite || hasSocials || hasRating || hasAddress;

    const fileIds = task.exportFileIds ? (() => {
      try {
        return JSON.parse(task.exportFileIds);
      } catch {
        return [];
      }
    })() : [];
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (fileIds.length > 0 && token) {
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

          // Parse CSV Row helper
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
              // Expected indices based on worker CSV structure:
              // 2: Rating, 4: Phone, 5: WebPhone, 6: Email, 7: WebEmail, 8: Website, 9: Address, 14-20: Socials
              if (hasEmail && !cols[6] && !cols[7]) return false;
              if (hasPhone && !cols[4] && !cols[5]) return false;
              if (hasWebsite && !cols[8]) return false;
              if (hasAddress && (!cols[9] || cols[9].length < 5)) return false;
              if (hasRating && (!cols[2] || Number(cols[2]) <= 0)) return false;
              if (hasSocials) {
                const hasAnySocial = cols.slice(14, 21).some(s => s && s.trim().length > 0);
                if (!hasAnySocial) return false;
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

    // 3. Build SQL Query
    const leadsRes = await db.select()
      .from(leadsTable)
      .innerJoin(taskLeads, eq(leadsTable.id, taskLeads.leadId))
      .where(eq(taskLeads.taskId, taskId));

    const filteredLeads = leadsRes.map(r => r.leads).filter(lead => {
      if (hasEmail && !lead.email && !lead.websiteEmail) return false;
      if (hasPhone && !lead.phone && !lead.websitePhone) return false;
      if (hasWebsite && !lead.website) return false;
      if (hasAddress && (!lead.address || lead.address.length < 5)) return false;
      if (hasRating && (!lead.rating || lead.rating <= 0)) return false;
      if (hasSocials) {
        const socials = [lead.facebook, lead.instagram, lead.linkedin, lead.twitter, lead.youtube, lead.pinterest, lead.tiktok];
        if (!socials.some(s => s && s.length > 0)) return false;
      }
      return true;
    });

    if (filteredLeads.length === 0) {
      return NextResponse.json({ error: 'No leads match filters' }, { status: 404 });
    }

    // 4. Generate CSV
    const header = [
      'Name', 'Category', 'Rating', 'Reviews',
      'Phone', 'Website Phone', 'Email', 'Website Email',
      'Website', 'Address', 'City', 'Latitude', 'Longitude', 'Place ID',
      'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Pinterest', 'TikTok',
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '';
      let stringValue = String(str);
      if (/^[=+\-@]/.test(stringValue)) stringValue = "'" + stringValue;
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = filteredLeads.map(lead => [
      lead.name, lead.category, lead.rating, lead.reviewsCount,
      lead.phone, lead.websitePhone, lead.email, lead.websiteEmail,
      lead.website, lead.address, lead.city, lead.latitude, lead.longitude, lead.placeId,
      lead.facebook, lead.instagram, lead.linkedin, lead.twitter, lead.youtube, lead.pinterest, lead.tiktok,
      lead.mondayHours, lead.tuesdayHours, lead.wednesdayHours, lead.thursdayHours, lead.fridayHours, lead.saturdayHours, lead.sundayHours
    ].map(escapeCsv).join(','));

    const output = [header.join(','), ...csvRows].join('\n');
    const filename = `${task.name?.replace(/\s+/g, '_') || 'task'}_export.csv`;

    return new NextResponse(output, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
