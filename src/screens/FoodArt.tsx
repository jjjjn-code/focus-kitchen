/**
 * The pictures on the set up screen, one per tier. They show the kind of dish
 * a session of that length can cook, not the exact dish (that stays a surprise).
 */
export interface FoodStage {
  fromMin: number;
  label: string;
  colour: string;
  dishId: string;
}

/** One picture per tier, starting at the minute the tier starts. */
export const FOOD_STAGES: FoodStage[] = [
  { fromMin: 5, label: 'Nibble', colour: '#c7d6d3', dishId: 'fried-egg' },
  { fromMin: 10, label: 'Snack', colour: '#cfd8ba', dishId: 'onigiri' },
  { fromMin: 25, label: 'Light meal', colour: '#efd3a7', dishId: 'omurice' },
  { fromMin: 45, label: 'Main', colour: '#e8c2ad', dishId: 'shoyu-ramen' },
  { fromMin: 75, label: 'Hearty', colour: '#b9cbd6', dishId: 'sukiyaki' },
  { fromMin: 120, label: 'Feast', colour: '#eeccc6', dishId: 'shortcake' },
];

export function stageIndexFor(minutes: number): number {
  let index = 0;
  FOOD_STAGES.forEach((stage, i) => {
    if (minutes >= stage.fromMin) index = i;
  });
  return index;
}
