import { describe, expect, it } from 'vitest';
import { minutesToNextTier, tierFor } from './tiers';

describe('tierFor', () => {
  it('gives no tier under 5 minutes', () => {
    expect(tierFor(0)).toBeNull();
    expect(tierFor(4)).toBeNull();
  });

  it.each([
    [5, 0], [9, 0],
    [10, 1], [24, 1],
    [25, 2], [44, 2],
    [45, 3], [74, 3],
    [75, 4], [119, 4],
    [120, 5], [300, 5],
  ])('%i minutes is tier %i', (minutes, tier) => {
    expect(tierFor(minutes)).toBe(tier);
  });
});

describe('minutesToNextTier', () => {
  const min = 60_000;
  it('rounds up to whole minutes', () => {
    expect(minutesToNextTier(0)).toBe(5);
    expect(minutesToNextTier(5 * min)).toBe(5);
    expect(minutesToNextTier(10 * min)).toBe(15);
    expect(minutesToNextTier(24 * min + 1000)).toBe(1);
    expect(minutesToNextTier(25 * min)).toBe(20);
  });
  it('is null at the top tier', () => {
    expect(minutesToNextTier(120 * min)).toBeNull();
  });
});
