import { describe, expect, it } from 'vitest';
import type { Session } from '../types';
import { pickMessage, statMessages } from './messages';

const NOW = new Date(2026, 10, 12, 10, 0).getTime();
const at = (day: number) => new Date(2026, 10, day, 9, 0).getTime();
let n = 0;
const cooked = (startedAt: number, focusedMin: number, dishId = 'onigiri'): Session => ({
  id: `m${n++}`,
  activity: 'reading',
  targetMin: 10,
  startedAt,
  focusedMin,
  outcome: 'cooked',
  dishId,
  closeCalls: 0,
});

describe('statMessages', () => {
  it('welcomes the first dish', () => {
    const s = cooked(at(12), 10);
    expect(statMessages(s, [s], NOW)).toEqual(['Dish 1 of 23 in your recipe book.']);
  });

  it('notices the longest session', () => {
    const before = cooked(at(11), 20);
    const s = cooked(at(12), 30);
    expect(statMessages(s, [before, s], NOW)).toContain('Your longest session yet!');
  });

  it('compares with last week only when this week is ahead', () => {
    const lastWeek = cooked(at(3), 20);
    const s = cooked(at(12), 60);
    expect(statMessages(s, [lastWeek, s], NOW)).toContain('40 minutes more than last week already.');
    const small = cooked(at(12), 10);
    expect(statMessages(small, [lastWeek, small], NOW).join(' ')).not.toContain('last week');
  });

  it('mentions a streak of two days or more', () => {
    const yesterday = cooked(at(11), 30);
    const s = cooked(at(12), 10);
    expect(statMessages(s, [yesterday, s], NOW)).toContain('2 days in a row with a cooked dish.');
  });

  it('falls back to the dish count', () => {
    const a = cooked(at(12), 30);
    const b = cooked(at(12), 10);
    expect(statMessages(b, [a, b], NOW)).toEqual(['That is 2 dishes from your kitchen.']);
  });
});

describe('pickMessage', () => {
  it('picks one of the true messages', () => {
    const before = cooked(at(11), 20);
    const s = cooked(at(12), 30, 'gyoza');
    const options = statMessages(s, [before, s], NOW);
    expect(options.length).toBeGreaterThan(1);
    expect(pickMessage(s, [before, s], NOW, () => 0).text).toBe(options[0]);
    expect(pickMessage(s, [before, s], NOW, () => 0.999).text).toBe(options[options.length - 1]);
  });
});
