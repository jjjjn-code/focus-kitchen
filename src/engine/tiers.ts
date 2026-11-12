import type { Tier } from '../types';

export const TIERS: { tier: Tier; name: string; minMinutes: number }[] = [
  { tier: 1, name: 'Snack', minMinutes: 10 },
  { tier: 2, name: 'Light meal', minMinutes: 25 },
  { tier: 3, name: 'Main', minMinutes: 45 },
  { tier: 4, name: 'Hearty', minMinutes: 75 },
  { tier: 5, name: 'Feast', minMinutes: 120 },
];

/** Sessions under this many focused minutes never produce a cooked dish. */
export const MIN_COOKED_MINUTES = TIERS[0].minMinutes;

/** The tier for a number of focused minutes, or null if under the minimum. */
export function tierFor(minutes: number): Tier | null {
  let result: Tier | null = null;
  for (const t of TIERS) {
    if (minutes >= t.minMinutes) result = t.tier;
  }
  return result;
}

export function tierName(tier: Tier): string {
  return TIERS[tier - 1].name;
}

/** Whole minutes (rounded up) until the next tier starts, or null at the top tier. */
export function minutesToNextTier(elapsedMs: number): number | null {
  const next = TIERS.find((t) => t.minMinutes * 60_000 > elapsedMs);
  if (!next) return null;
  return Math.ceil((next.minMinutes * 60_000 - elapsedMs) / 60_000);
}
