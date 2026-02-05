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

  const rows = await db`
    SELECT export_file_ids, name
    FROM tasks
    WHERE id = ${taskId} AND user_id = ${session.id}
  `;
  if (!rows[0]) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const fileIds = rows[0].export_file_ids ? JSON.parse(rows[0].export_file_ids) : [];
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return NextResponse.json({ error: "Export not ready" }, { status: 404 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
  }

  const files: string[] = [];
  for (const fileId of fileIds) {
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileJson = await fileRes.json();
    const filePath = fileJson?.result?.file_path;
    if (!filePath) continue;

    const downloadRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const content = await downloadRes.text();
    files.push(content);
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }

  const merged = files
    .map((content, index) => {
      if (index === 0) return content;
      const lines = content.split("\n");
      return lines.slice(1).join("\n");
    })
    .join("");

  const dedupeLines = (csv: string) => {
    const lines = csv.split("\n").filter((line) => line.length > 0);
    if (lines.length === 0) return csv;
    const header = lines[0];
    const data = lines.slice(1);
    const seen = new Set<string>();
    const deduped = data.filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
    return [header, ...deduped].join("\n") + "\n";
  };

  const filters = {
    hasEmail: url.searchParams.get("hasEmail") === "1",
    hasPhone: url.searchParams.get("hasPhone") === "1",
    hasWebsite: url.searchParams.get("hasWebsite") === "1",
    hasSocials: url.searchParams.get("hasSocials") === "1",
    hasRating: url.searchParams.get("hasRating") === "1",
    hasAddress: url.searchParams.get("hasAddress") === "1",
  };

  const filterActive = Object.values(filters).some(Boolean);
  let output = dedupeLines(merged);

  if (filterActive) {
    const lines = output.split("\n").filter((line) => line.length > 0);
    const header = lines[0];
    const dataLines = lines.slice(1);

    const parseLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current);
      return values.map((v) => v.replace(/^"|"$/g, "").trim());
    };

    const hasValue = (value?: string) => {
      if (!value) return false;
      const normalized = value.trim();
      return normalized.length > 0 && normalized.toLowerCase() !== "null";
    };

    const filtered = dataLines.filter((line) => {
      const cols = parseLine(line);
      const email = cols[7];
      const websiteEmail = cols[8];
      const phone = cols[5];
      const websitePhone = cols[6];
      const website = cols[9];
      const address = cols[10];
      const rating = parseFloat(cols[3] || "0");
      const socials = cols.slice(21, 28); // Facebook to TikTok

      if (filters.hasEmail && !hasValue(email) && !hasValue(websiteEmail)) return false;
      if (filters.hasPhone && !hasValue(phone) && !hasValue(websitePhone)) return false;
      if (filters.hasWebsite && (!hasValue(website) || !website.startsWith("http"))) return false;
      if (filters.hasAddress && (!hasValue(address) || address.length <= 5)) return false;
      if (filters.hasRating && (isNaN(rating) || rating <= 0)) return false;
      if (filters.hasSocials && !socials.some(hasValue)) return false;
      return true;
    });

    if (filtered.length === 0) {
      return NextResponse.json({ error: "No leads match filters" }, { status: 404 });
    }

    output = [header, ...filtered].join("\n") + "\n";
  }

  const filename = `${rows[0].name?.replace(/\s+/g, "_") || "task"}_export.csv`;
  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
