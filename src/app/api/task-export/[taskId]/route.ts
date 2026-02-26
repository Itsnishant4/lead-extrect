import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { tasks, leads as leadsTable, taskLeads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(_request.url);
  const resolvedParams = await params;
  const rawId = resolvedParams?.taskId ?? url.pathname.split('/').pop() ?? '';
  const taskId = Number.parseInt(rawId, 10);

  if (!taskId || Number.isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
  }

  // 1. Verify Task Ownership
  const taskRows = await db.select({ 
    name: tasks.name, 
    exportFileIds: tasks.exportFileIds 
  }).from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, session.id))).limit(1);

  if (!taskRows[0]) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const task = taskRows[0];

  // --- TELEGRAM EXPORT MERGE LOGIC ---
  const hasFilters = url.searchParams.has('hasEmail') || url.searchParams.has('hasPhone');
  const fileIds = task.exportFileIds ? JSON.parse(task.exportFileIds) : [];
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!hasFilters && fileIds.length > 0 && token) {
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
        const merged = files
          .map((content, index) => {
            if (index === 0) return content;
            const lines = content.split('\n');
            return lines.slice(1).join('\n');
          })
          .join('');

        let output = merged.replace(/\n\s*\n/g, '\n');
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
      console.error('Failed to merge telegram files, falling back to DB', e);
    }
  }

  // 2. Parse Filters
  const hasEmail = url.searchParams.get('hasEmail') === '1';
  const hasPhone = url.searchParams.get('hasPhone') === '1';
  const hasWebsite = url.searchParams.get('hasWebsite') === '1';
  const hasSocials = url.searchParams.get('hasSocials') === '1';
  const hasRating = url.searchParams.get('hasRating') === '1';
  const hasAddress = url.searchParams.get('hasAddress') === '1';

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
}
