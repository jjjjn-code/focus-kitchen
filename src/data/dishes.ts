import type { Dish } from '../types';

export const DISHES: Dish[] = [
  { id: 'onigiri', name: 'Onigiri', tier: 1, rarity: 'common', blurb: 'A rice ball wrapped in crisp nori, made to be eaten with your hands.' },
  { id: 'tamagoyaki', name: 'Tamagoyaki', tier: 1, rarity: 'common', blurb: 'A sweet rolled omelette, folded layer by patient layer.' },
  { id: 'fruit-sando', name: 'Fruit sando', tier: 1, rarity: 'rare', blurb: 'Soft milk bread, whipped cream and fruit cut to show its best side.' },
  { id: 'mitarashi-dango', name: 'Mitarashi dango', tier: 1, rarity: 'legendary', blurb: 'Chewy rice dumplings on a skewer, glazed with sweet soy sauce.' },
  { id: 'omurice', name: 'Omurice', tier: 2, rarity: 'common', blurb: 'A soft omelette tucked over ketchup fried rice.' },
  { id: 'gyoza', name: 'Gyoza', tier: 2, rarity: 'common', blurb: 'Pan-fried dumplings with crisp bottoms and juicy middles.' },
  { id: 'fried-rice', name: 'Egg fried rice', tier: 2, rarity: 'rare', blurb: 'Every grain separate, golden and tossed over a high flame.' },
  { id: 'katsu-sando', name: 'Katsu sando', tier: 2, rarity: 'legendary', blurb: 'A thick, crunchy cutlet between pillowy slices of milk bread.' },
  { id: 'shoyu-ramen', name: 'Shoyu ramen', tier: 3, rarity: 'common', blurb: 'Springy noodles in a clear soy broth, topped with a jammy egg.' },
  { id: 'curry-rice', name: 'Japanese curry rice', tier: 3, rarity: 'common', blurb: 'Thick, mild curry that tastes even better the longer it simmers.', properNoun: true },
  { id: 'teriyaki-don', name: 'Chicken teriyaki don', tier: 3, rarity: 'rare', blurb: 'Glossy glazed chicken resting on a bowl of steaming rice.' },
  { id: 'xiao-long-bao', name: 'Xiao long bao', tier: 3, rarity: 'legendary', blurb: 'Delicate soup dumplings, each one pleated by hand.' },
  { id: 'sukiyaki', name: 'Sukiyaki', tier: 4, rarity: 'common', blurb: 'Thin beef and vegetables simmered in a sweet soy broth at the table.' },
  { id: 'tonkatsu-set', name: 'Tonkatsu set meal', tier: 4, rarity: 'common', blurb: 'A crisp pork cutlet with rice, miso soup and a mountain of cabbage.' },
  { id: 'dolsot-bibimbap', name: 'Stone pot bibimbap', tier: 4, rarity: 'rare', blurb: 'Rice crackling against hot stone under bright vegetables and an egg.' },
  { id: 'unagi-don', name: 'Unagi don', tier: 4, rarity: 'legendary', blurb: 'Grilled eel lacquered with sweet sauce over rice.' },
  { id: 'hot-pot', name: 'Yin-yang hot pot', tier: 5, rarity: 'common', blurb: 'Two broths, one pot, and plenty of time to share it.' },
  { id: 'sushi-platter', name: 'Sushi platter', tier: 5, rarity: 'common', blurb: 'A generous spread of nigiri and rolls, almost too neat to eat.' },
  { id: 'shortcake', name: 'Strawberry shortcake', tier: 5, rarity: 'rare', blurb: 'Light sponge, fresh cream and strawberries, saved for celebrations.' },
  { id: 'celebration-bento', name: 'Celebration jubako bento', tier: 5, rarity: 'legendary', blurb: 'Lacquered tiers packed with a little of everything good.' },
];

export function dishById(id: string): Dish | undefined {
  return DISHES.find((d) => d.id === id);
}

/** The dish name as it reads in the middle of a sentence ("Your shoyu ramen came out raw."). */
export function dishNameInSentence(dish: Dish): string {
  return dish.properNoun ? dish.name : dish.name.charAt(0).toLowerCase() + dish.name.slice(1);
}
