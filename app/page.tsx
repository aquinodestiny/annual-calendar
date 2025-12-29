"use client";

import { useEffect, useMemo, useState } from "react";
import YearGrid from "@/components/YearGrid";
import { RawEvent, toMonthBars } from "@/lib/calendar";

const LS_KEY = "annual_calendar_ics_urls";

export default function HomePage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [urls, setUrls] = useState<string[]>([]);
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setUrls(JSON.parse(saved));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const all: RawEvent[] = [];
        for (const u of urls) {
          const res = await fetch(`/api/ics?url=${encodeURIComponent(u)}`);
          const json = await res.json();
          if (!res.ok) throw new Error(json?.error || "Fetch failed");
          all.push(...(json.events as RawEvent[]));
        }
        setEvents(all);
      } catch (e: any) {
        setError(e?.message || "Failed to load calendars.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    if (urls.length) load();
    else setEvents([]);
  }, [urls]);

  const bars = useMemo(() => toMonthBars(events, year), [events, year]);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logoDot} />
          <div style={{ fontWeight: 900 }}>Annual Calendar</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => (window.location.href = "/connect")} style={btn()}>
            Connect (ICS Links)
          </button>

          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={select()}>
            {Array.from({ length: 7 }, (_, i) => {
              const y = new Date().getFullYear() - 3 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div style={{ padding: 12, paddingTop: 0, display: "flex", gap: 10, alignItems: "center" }}>
        {loading && <span style={hint()}>Loading…</span>}
        {error && <span style={{ ...hint(), color: "crimson" }}>{error}</span>}
        {!urls.length && <span style={hint()}>No calendars connected yet — click “Connect”.</span>}
      </div>

      <YearGrid year={year} bars={bars} />

      <div style={styles.footerHint}>
        <span><b>Mobile:</b> swipe sideways to scroll.</span>
        <span><b>Weekend shading</b> is automatic.</span>
        <span><b>Today</b> is highlighted and marked.</span>
      </div>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  };
}
function select(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  };
}
function hint(): React.CSSProperties {
  return { fontSize: 12, opacity: 0.75 };
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 12,
    flexWrap: "wrap",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
  },
  footerHint: {
    padding: 12,
    fontSize: 12,
    opacity: 0.75,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
