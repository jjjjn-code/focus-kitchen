import { DISHES } from '../data/dishes';
import type { Dish, Rarity, Tier } from '../types';

/** Roll weight per rarity, shared between the dishes of that rarity in a tier. */
export const RARITY_WEIGHTS: Record<Rarity, number> = { common: 70, rare: 25, legendary: 5 };

/** Dishes that have never been cooked get this multiplier, so the collection keeps growing. */
export const NEW_DISH_BOOST = 2;

export function dishWeights(
  tier: Tier,
  cookedIds: ReadonlySet<string>,
  menu: readonly Dish[] = DISHES,
): { dish: Dish; weight: number }[] {
  const inTier = menu.filter((d) => d.tier === tier);
  return inTier.map((dish) => {
    const sameRarity = inTier.filter((d) => d.rarity === dish.rarity).length;
    const base = RARITY_WEIGHTS[dish.rarity] / sameRarity;
    return { dish, weight: cookedIds.has(dish.id) ? base : base * NEW_DISH_BOOST };
  });
}

/**
 * Pick a dish from a tier.
 * @param cookedIds ids of dishes already in the collection
 * @param rng returns a number in [0, 1), for example Math.random
 */
export function rollDish(
  tier: Tier,
  cookedIds: ReadonlySet<string>,
  rng: () => number,
  menu: readonly Dish[] = DISHES,
): Dish {
  const weighted = dishWeights(tier, cookedIds, menu);
  if (weighted.length === 0) throw new Error(`No dishes in tier ${tier}`);
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let point = rng() * total;
  for (const { dish, weight } of weighted) {
    if (point < weight) return dish;
    point -= weight;
  }
  return weighted[weighted.length - 1].dish;
}
