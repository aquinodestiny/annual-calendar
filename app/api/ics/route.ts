import { NextResponse } from "next/server";
import ical from "node-ical";

const MAX_BYTES = 2_000_000; // 2MB

function isSafeUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || !isSafeUrl(url)) {
    return NextResponse.json({ error: "Invalid or unsafe URL (must be https)." }, { status: 400 });
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch ICS." }, { status: 502 });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "ICS file too large." }, { status: 413 });
    }

    const text = buf.toString("utf8");
    const data = ical.parseICS(text);

    const events: Array<{
      uid: string;
      title: string;
      start: string;
      end: string;
      allDay: boolean;
      categories?: string[];
    }> = [];

    for (const k of Object.keys(data)) {
      const item: any = (data as any)[k];
      if (item?.type !== "VEVENT") continue;

      const start = item.start instanceof Date ? item.start : null;
      const end = item.end instanceof Date ? item.end : null;
      if (!start || !end) continue;

      const allDay =
        start.getHours() === 0 && start.getMinutes() === 0 &&
        end.getHours() === 0 && end.getMinutes() === 0;

      events.push({
        uid: item.uid || k,
        title: item.summary || "Untitled",
        start: start.toISOString(),
        end: end.toISOString(),
        allDay,
        categories: Array.isArray(item.categories)
          ? item.categories
          : item.categories
            ? [String(item.categories)]
            : undefined,
      });
    }

    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Parse error." }, { status: 500 });
  }
}
