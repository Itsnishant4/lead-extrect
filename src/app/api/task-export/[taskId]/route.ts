import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(_request.url);
  const resolvedParams = await params;
  const rawId = resolvedParams?.taskId ?? url.pathname.split("/").pop() ?? "";
  const taskId = Number.parseInt(rawId, 10);

  if (!taskId || Number.isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  // 1. Verify Task Ownership
  const rows = await db`
    SELECT name, export_file_ids
    FROM tasks
    WHERE id = ${taskId} AND user_id = ${session.id}
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // --- TELEGRAM EXPORT MERGE LOGIC ---
  // If we have file IDs in the DB, prefer using them (as per user request)
  // BUT only if no specific filters are applied (since Telegram files are static/pre-filtered)
  const hasFilters = url.searchParams.has("hasEmail") || url.searchParams.has("hasPhone");
  const fileIds = rows[0].export_file_ids ? JSON.parse(rows[0].export_file_ids) : [];
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Utilize Telegram files if available and not filtering strict properties that might be missed in chunks
  // ( Actually user wants "merge all file and make export success", so we attempt this first )
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
        // Merge logic
        const merged = files
          .map((content, index) => {
            if (index === 0) return content; // Keep header of first file
            const lines = content.split("\n");
            // Assuming headers are present in all chunks, remove header from subsequent
            return lines.slice(1).join("\n");
          })
          .join("");

        // Clean up potentially empty lines from merge
        const output = merged.replace(/\n\s*\n/g, '\n');

        const filename = `${rows[0].name?.replace(/\s+/g, "_") || "task"}_export.csv`;
        return new NextResponse(output, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
    } catch (e) {
      console.error("Failed to merge telegram files, falling back to DB", e);
    }
  }
  // -----------------------------------

  // 2. Parse Filters
  const hasEmail = url.searchParams.get("hasEmail") === "1";
  const hasPhone = url.searchParams.get("hasPhone") === "1";
  const hasWebsite = url.searchParams.get("hasWebsite") === "1";
  const hasSocials = url.searchParams.get("hasSocials") === "1";
  const hasRating = url.searchParams.get("hasRating") === "1";
  const hasAddress = url.searchParams.get("hasAddress") === "1";

  // 3. Build SQL Query Dynamic Conditions
  // We use postgres.js helper for dynamic conditions if possible, or simple JS logic to build the query parts

  // Base query: Fetch leads joined with task_leads
  const leads = await db`
    SELECT 
      l.id, l.name, l.category, l.rating, l.reviews_count, 
      l.phone, l.website_phone, l.email, l.website_email,
      l.website, l.address, l.city, l.latitude, l.longitude, l.place_id,
      l.facebook, l.instagram, l.linkedin, l.twitter, l.youtube, l.pinterest, l.tiktok,
      l.monday_hours, l.tuesday_hours, l.wednesday_hours, l.thursday_hours, l.friday_hours, l.saturday_hours, l.sunday_hours
    FROM leads l
    JOIN task_leads tl ON l.id = tl.lead_id
    WHERE tl.task_id = ${taskId}
  `;

  // 4. Apply Filters in Memory (easier regarding complex logic like 'socials' checks)
  const filteredLeads = leads.filter(lead => {
    if (hasEmail && !lead.email && !lead.website_email) return false;
    if (hasPhone && !lead.phone && !lead.website_phone) return false;
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
    return NextResponse.json({ error: "No leads match filters" }, { status: 404 });
  }

  // 5. Generate CSV
  const header = [
    "Name", "Category", "Rating", "Reviews",
    "Phone", "Website Phone", "Email", "Website Email",
    "Website", "Address", "City", "Latitude", "Longitude", "Place ID",
    "Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube", "Pinterest", "TikTok",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return "";
    const stringValue = String(str);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvRows = filteredLeads.map(lead => [
    lead.name, lead.category, lead.rating, lead.reviews_count,
    lead.phone, lead.website_phone, lead.email, lead.website_email,
    lead.website, lead.address, lead.city, lead.latitude, lead.longitude, lead.place_id,
    lead.facebook, lead.instagram, lead.linkedin, lead.twitter, lead.youtube, lead.pinterest, lead.tiktok,
    lead.monday_hours, lead.tuesday_hours, lead.wednesday_hours, lead.thursday_hours, lead.friday_hours, lead.saturday_hours, lead.sunday_hours
  ].map(escapeCsv).join(","));

  const output = [header.join(","), ...csvRows].join("\n");

  const filename = `${rows[0].name?.replace(/\s+/g, "_") || "task"}_export.csv`;

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
