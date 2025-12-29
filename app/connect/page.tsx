"use client";

import { useEffect, useState } from "react";

const LS_KEY = "annual_calendar_ics_urls";

export default function ConnectPage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setUrls(JSON.parse(saved));
  }, []);

  function save(next: string[]) {
    setUrls(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  function addUrl() {
    const u = input.trim();
    if (!u) return;

    if (!u.startsWith("https://")) {
      alert("Please paste an https:// calendar link.");
      return;
    }

    if (urls.includes(u)) return;
    save([u, ...urls]);
    setInput("");
  }

  function removeUrl(u: string) {
    save(urls.filter((x) => x !== u));
  }

  return (
    <div style={{ padding: 16, maxWidth: 780, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Connect calendars</h1>
        <button onClick={() => (window.location.href = "/")} style={btn()}>
          Back
        </button>
      </div>

      <p style={{ opacity: 0.75, marginTop: 8 }}>
        Paste calendar subscription links (ICS). This works with Google Calendar and many iCloud public calendars.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://…/calendar.ics"
          style={{
            flex: 1,
            minWidth: 280,
            padding: "12px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        />
        <button onClick={addUrl} style={btn()}>
          Add
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {urls.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No links added yet.</div>
        ) : (
          urls.map((u) => (
            <div
              key={u}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ wordBreak: "break-all", fontSize: 13 }}>{u}</div>
              <button onClick={() => removeUrl(u)} style={btn()}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Where to find ICS links</div>
        <ul style={{ marginTop: 0 }}>
          <li><b>Google Calendar:</b> Settings → your calendar → “Integrate calendar” → copy “Secret address in iCal format”.</li>
          <li><b>iCloud Calendar:</b> share calendar → enable “Public Calendar” → copy the URL (usually ends with .ics).</li>
        </ul>
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
