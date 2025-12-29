"use client";

import React from "react";
import { daysInMonth, MonthBar, weekdayOf } from "@/lib/calendar";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function hashToHue(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

export default function YearGrid({ year, bars }: { year: number; bars: MonthBar[] }) {
  const today = new Date();
  const isThisYear = today.getFullYear() === year;
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const barsByMonth = Array.from({ length: 12 }, () => [] as MonthBar[]);
  for (const b of bars) barsByMonth[b.monthIndex].push(b);

  return (
    <div style={{ width: "100%" }}>
      <div style={styles.scroller}>
        <div style={styles.grid}>
          {/* Header */}
          <div style={styles.headerLeft} />
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} style={styles.headerCell}>{i + 1}</div>
          ))}

          {/* Months */}
          {MONTHS.map((mLabel, mIdx) => {
            const dim = daysInMonth(year, mIdx);
            const monthBars = barsByMonth[mIdx];

            return (
              <React.Fragment key={mLabel}>
                <div style={styles.monthCell}>{mLabel}</div>

                {Array.from({ length: 31 }, (_, dIdx) => {
                  const day = dIdx + 1;
                  const exists = day <= dim;
                  const wd = exists ? weekdayOf(year, mIdx, day) : null; // 0 Sun..6 Sat
                  const weekend = wd === 0 || wd === 6;

                  const isToday = isThisYear && mIdx === todayMonth && day === todayDay;

                  return (
                    <div
                      key={`${mIdx}-${day}`}
                      style={{
                        ...styles.dayCell,
                        background: !exists
                          ? "#ffffff"
                          : weekend
                            ? "rgba(30, 64, 175, 0.08)"
                            : "#ffffff",
                        outline: isToday
                          ? "2px solid rgba(59, 130, 246, 0.9)"
                          : "1px solid rgba(0,0,0,0.06)",
                        outlineOffset: isToday ? "-2px" : "-1px",
                      }}
                    >
                      {exists && (
                        <div style={styles.weekdayLabel}>
                          {["Su","Mo","Tu","We","Th","Fr","Sa"][wd!]}
                        </div>
                      )}

                      {/* Today marker (vertical) */}
                      {isThisYear && day === todayDay && (
                        <div style={styles.todayLine} />
                      )}
                    </div>
                  );
                })}

                {/* Overlay row for bars */}
                <div style={styles.overlayRow}>
                  {monthBars.map((b) => {
                    const left = 1 + (b.startDay - 1);
                    const span = b.endDay - b.startDay + 1;

                    const hue = hashToHue(b.colorKey);
                    const bg = `hsl(${hue} 80% 55%)`;

                    return (
                      <div
                        key={b.key}
                        title={`${b.title} (${MONTHS[b.monthIndex]} ${b.startDay}–${b.endDay})`}
                        style={{
                          ...styles.eventBar,
                          background: bg,
                          gridColumn: `${left + 1} / span ${span}`,
                          top: 6 + b.lane * 20,
                        }}
                      >
                        <span style={styles.eventText}>{b.title}</span>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scroller: {
    overflowX: "auto",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  grid: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "72px repeat(31, 44px)",
    gridAutoRows: "44px",
    minWidth: 72 + 31 * 44,
  },
  headerLeft: {
    position: "sticky",
    left: 0,
    background: "#fff",
    zIndex: 3,
    borderRight: "1px solid rgba(0,0,0,0.08)",
  },
  headerCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    background: "rgba(0,0,0,0.02)",
    borderLeft: "1px solid rgba(0,0,0,0.06)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  monthCell: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    borderRight: "1px solid rgba(0,0,0,0.08)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  dayCell: {
    position: "relative",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  weekdayLabel: {
    position: "absolute",
    top: 6,
    left: 6,
    fontSize: 10,
    opacity: 0.65,
    fontWeight: 600,
  },
  todayLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    transform: "translateX(-1px)",
    background: "rgba(59, 130, 246, 0.55)",
    pointerEvents: "none",
  },
  overlayRow: {
    gridColumn: "1 / -1",
    height: 0,
    position: "relative",
  },
  eventBar: {
    position: "absolute",
    height: 16,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
    overflow: "hidden",
    maxWidth: "100%",
  },
  eventText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
