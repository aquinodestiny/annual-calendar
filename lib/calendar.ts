import { addDays, endOfMonth, max, min, startOfMonth } from "date-fns";

export type RawEvent = {
  uid: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  allDay: boolean;
  categories?: string[];
};

export type MonthBar = {
  key: string;
  title: string;
  monthIndex: number; // 0-11
  startDay: number;   // 1-31
  endDay: number;     // 1-31
  lane: number;       // stacking
  colorKey: string;   // consistent color
};

export function toMonthBars(events: RawEvent[], year: number): MonthBar[] {
  const bars: MonthBar[] = [];
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  for (const ev of events) {
    const s = new Date(ev.start);
    const e = new Date(ev.end);

    const start = max([s, yearStart]);
    const end = min([e, yearEnd]);

    if (end <= yearStart || start >= yearEnd) continue;

    for (let m = 0; m < 12; m++) {
      const ms = startOfMonth(new Date(year, m, 1));
      const me = endOfMonth(ms);

      const segStart = max([start, ms]);
      const segEnd = min([end, addDays(me, 1)]);

      if (segEnd <= ms || segStart > me) continue;

      const startDay = segStart.getDate();
      const inclusiveEnd = addDays(segEnd, -1);
      const endDay = inclusiveEnd.getDate();

      bars.push({
        key: `${ev.uid}-${year}-${m}-${startDay}-${endDay}`,
        title: ev.title,
        monthIndex: m,
        startDay,
        endDay,
        lane: 0,
        colorKey: (ev.categories?.[0] || ev.title).toLowerCase(),
      });
    }
  }

  const byMonth = Array.from({ length: 12 }, () => [] as MonthBar[]);
  for (const b of bars) byMonth[b.monthIndex].push(b);

  for (let m = 0; m < 12; m++) {
    const monthBars = byMonth[m].sort((a, b) => a.startDay - b.startDay);
    const lanes: number[] = [];

    for (const bar of monthBars) {
      let placed = false;
      for (let lane = 0; lane < lanes.length; lane++) {
        if (bar.startDay > lanes[lane]) {
          bar.lane = lane;
          lanes[lane] = bar.endDay;
          placed = true;
          break;
        }
      }
      if (!placed) {
        bar.lane = lanes.length;
        lanes.push(bar.endDay);
      }
    }
  }

  return bars;
}

export function weekdayOf(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).getDay(); // 0 Sun ... 6 Sat
}

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
