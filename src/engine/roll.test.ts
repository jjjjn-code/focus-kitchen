import { describe, expect, it } from 'vitest';
import { DISHES } from '../data/dishes';
import { dishWeights, rollDish } from './roll';

const none = new Set<string>();
const weightOf = (tier: 1 | 2 | 3 | 4 | 5, id: string, cooked = none) =>
  dishWeights(tier, cooked).find((w) => w.dish.id === id)!.weight;

describe('menu', () => {
  it('has 20 dishes with unique ids, four per tier', () => {
    expect(DISHES).toHaveLength(20);
    expect(new Set(DISHES.map((d) => d.id)).size).toBe(20);
    for (const tier of [1, 2, 3, 4, 5]) {
      expect(DISHES.filter((d) => d.tier === tier)).toHaveLength(4);
    }
  });
});

describe('dishWeights', () => {
  it('shares the rarity weight between dishes of that rarity', () => {
    const cookedAll = new Set(DISHES.map((d) => d.id));
    expect(weightOf(1, 'onigiri', cookedAll)).toBe(35);
    expect(weightOf(1, 'tamagoyaki', cookedAll)).toBe(35);
    expect(weightOf(1, 'fruit-sando', cookedAll)).toBe(25);
    expect(weightOf(1, 'mitarashi-dango', cookedAll)).toBe(5);
  });

  it('doubles the weight of dishes never cooked', () => {
    const cooked = new Set(['onigiri']);
    expect(weightOf(1, 'onigiri', cooked)).toBe(35);
    expect(weightOf(1, 'tamagoyaki', cooked)).toBe(70);
    expect(weightOf(1, 'mitarashi-dango', cooked)).toBe(10);
  });
});

describe('rollDish', () => {
  it('only returns dishes from the requested tier', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollDish(3, none, () => i / 100).tier).toBe(3);
    }
  });

  it('maps the random number onto the weighted ranges', () => {
    // Tier 1, nothing cooked: onigiri 70, tamagoyaki 70, fruit sando 50, dango 10 (total 200).
    expect(rollDish(1, none, () => 0).id).toBe('onigiri');
    expect(rollDish(1, none, () => 0.349).id).toBe('onigiri');
    expect(rollDish(1, none, () => 0.35).id).toBe('tamagoyaki');
    expect(rollDish(1, none, () => 0.7).id).toBe('fruit-sando');
    expect(rollDish(1, none, () => 0.95).id).toBe('mitarashi-dango');
    expect(rollDish(1, none, () => 0.999999).id).toBe('mitarashi-dango');
  });

  it('roughly follows the weights over many rolls', () => {
    let seed = 42;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const cookedAll = new Set(DISHES.map((d) => d.id));
    const counts: Record<string, number> = {};
    for (let i = 0; i < 20000; i++) {
      const id = rollDish(2, cookedAll, rng).id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    expect(counts['omurice'] / 20000).toBeCloseTo(0.35, 1);
    expect(counts['fried-rice'] / 20000).toBeCloseTo(0.25, 1);
    expect(counts['katsu-sando'] / 20000).toBeCloseTo(0.05, 1);
  });
});
