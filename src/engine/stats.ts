import type { Session } from '../types';

/** Everything here is derived from the finished sessions; nothing is stored. */

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function addDays(dayStart: number, days: number): number {
  const d = new Date(dayStart);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Weeks start on Monday. */
export function startOfWeek(ts: number): number {
  const d = new Date(startOfDay(ts));
  return addDays(d.getTime(), -((d.getDay() + 6) % 7));
}

export function minutesBetween(sessions: readonly Session[], from: number, to: number): number {
  return sessions
    .filter((s) => s.startedAt >= from && s.startedAt < to)
    .reduce((sum, s) => sum + (s.focusedMin ?? 0), 0);
}

export function todayMinutes(sessions: readonly Session[], now: number): number {
  const from = startOfDay(now);
  return minutesBetween(sessions, from, addDays(from, 1));
}

export function weekMinutes(sessions: readonly Session[], now: number): number {
  const from = startOfWeek(now);
  return minutesBetween(sessions, from, addDays(from, 7));
}

export function lastWeekMinutes(sessions: readonly Session[], now: number): number {
  const thisWeek = startOfWeek(now);
  return minutesBetween(sessions, addDays(thisWeek, -7), thisWeek);
}

/** Days in a row with at least one cooked dish. Today not having one yet does not break it. */
export function streak(sessions: readonly Session[], now: number): number {
  const cookedDays = new Set(sessions.filter((s) => s.outcome === 'cooked').map((s) => startOfDay(s.startedAt)));
  let day = startOfDay(now);
  if (!cookedDays.has(day)) day = addDays(day, -1);
  let count = 0;
  while (cookedDays.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** Focus minutes per day, oldest first, ending today. */
export function dailyMinutes(
  sessions: readonly Session[],
  now: number,
  days = 14,
): { dayStart: number; minutes: number }[] {
  const today = startOfDay(now);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = addDays(today, -i);
    result.push({ dayStart, minutes: minutesBetween(sessions, dayStart, addDays(dayStart, 1)) });
  }
  return result;
}

export function totals(sessions: readonly Session[]) {
  return {
    totalMinutes: sessions.reduce((sum, s) => sum + (s.focusedMin ?? 0), 0),
    longestMinutes: sessions.reduce((max, s) => Math.max(max, s.focusedMin ?? 0), 0),
    closeCalls: sessions.reduce((sum, s) => sum + s.closeCalls, 0),
    cooked: sessions.filter((s) => s.outcome === 'cooked').length,
    raw: sessions.filter((s) => s.outcome === 'raw').length,
    burnt: sessions.filter((s) => s.outcome === 'burnt').length,
  };
}

/** How many times each dish has been cooked. */
export function cookCounts(sessions: readonly Session[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (s.outcome === 'cooked' && s.dishId) counts.set(s.dishId, (counts.get(s.dishId) ?? 0) + 1);
  }
  return counts;
}

/** "3 hours 20 minutes", "1 hour", "45 minutes". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts = [];
  if (h > 0) parts.push(h === 1 ? '1 hour' : `${h} hours`);
  if (m > 0 || h === 0) parts.push(m === 1 ? '1 minute' : `${m} minutes`);
  return parts.join(' ');
}

/** Compact form for tight spaces: "3 hr 20 min". */
export function formatShort(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
