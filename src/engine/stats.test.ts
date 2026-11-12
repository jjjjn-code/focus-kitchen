import { describe, expect, it } from 'vitest';
import type { Session } from '../types';
import {
  cookCounts,
  dailyMinutes,
  formatDuration,
  formatShort,
  lastWeekMinutes,
  startOfWeek,
  streak,
  todayMinutes,
  totals,
  weekMinutes,
} from './stats';

// Thursday 12 November 2026, 10:00 local time.
const NOW = new Date(2026, 10, 12, 10, 0).getTime();
const at = (day: number, hour = 9) => new Date(2026, 10, day, hour, 0).getTime();

let n = 0;
const session = (startedAt: number, focusedMin: number, outcome: Session['outcome'] = 'cooked', extra: Partial<Session> = {}): Session => ({
  id: `s${n++}`,
  activity: 'reading',
  targetMin: 10,
  startedAt,
  endedAt: startedAt + focusedMin * 60_000,
  focusedMin,
  outcome,
  dishId: 'onigiri',
  closeCalls: 0,
  ...extra,
});

describe('time totals', () => {
  const sessions = [
    session(at(12, 8), 25),
    session(at(12, 9), 5, 'raw'),
    session(at(11), 40),
    session(at(9), 15), // Monday of this week
    session(at(8), 60), // Sunday, last week
    session(at(2), 30), // Monday of last week
    session(at(1), 99), // the week before
  ];

  it('adds up today, including failed sessions', () => {
    expect(todayMinutes(sessions, NOW)).toBe(30);
  });

  it('starts the week on Monday', () => {
    expect(new Date(startOfWeek(NOW)).getDate()).toBe(9);
    expect(weekMinutes(sessions, NOW)).toBe(85);
    expect(lastWeekMinutes(sessions, NOW)).toBe(90);
  });

  it('lists the last 14 days, oldest first', () => {
    const days = dailyMinutes(sessions, NOW);
    expect(days).toHaveLength(14);
    expect(days[13].minutes).toBe(30);
    expect(days[12].minutes).toBe(40);
    expect(days[11].minutes).toBe(0);
    expect(days[0].minutes).toBe(0); // 30 October
  });
});

describe('streak', () => {
  it('is zero with no cooked dishes', () => {
    expect(streak([session(at(12), 5, 'raw')], NOW)).toBe(0);
  });

  it('counts days in a row ending today', () => {
    expect(streak([session(at(12), 10), session(at(11), 10), session(at(10), 10), session(at(8), 10)], NOW)).toBe(3);
  });

  it('is not broken by today having no dish yet', () => {
    expect(streak([session(at(11), 10), session(at(10), 10)], NOW)).toBe(2);
  });

  it('ignores raw and burnt days', () => {
    expect(streak([session(at(12), 10), session(at(11), 8, 'burnt'), session(at(10), 10)], NOW)).toBe(1);
  });
});

describe('totals and counts', () => {
  const sessions = [
    session(at(12), 25, 'cooked', { closeCalls: 2 }),
    session(at(11), 70, 'cooked', { dishId: 'gyoza' }),
    session(at(10), 12, 'cooked'),
    session(at(9), 3, 'raw', { closeCalls: 1 }),
    session(at(8), 6, 'burnt'),
  ];

  it('sums minutes, longest session and close calls', () => {
    expect(totals(sessions)).toEqual({ totalMinutes: 116, longestMinutes: 70, closeCalls: 3, cooked: 3, raw: 1, burnt: 1 });
  });

  it('counts only cooked dishes', () => {
    const counts = cookCounts(sessions);
    expect(counts.get('onigiri')).toBe(2);
    expect(counts.get('gyoza')).toBe(1);
  });
});

describe('formatting', () => {
  it('writes durations in words', () => {
    expect(formatDuration(0)).toBe('0 minutes');
    expect(formatDuration(1)).toBe('1 minute');
    expect(formatDuration(45)).toBe('45 minutes');
    expect(formatDuration(60)).toBe('1 hour');
    expect(formatDuration(200)).toBe('3 hours 20 minutes');
  });

  it('writes short durations', () => {
    expect(formatShort(45)).toBe('45 min');
    expect(formatShort(120)).toBe('2 hr');
    expect(formatShort(135)).toBe('2 hr 15 min');
  });
});
