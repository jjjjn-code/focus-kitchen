import { DISH_EMOJI } from '../data/art';

export type DishState = 'cooked' | 'raw' | 'burnt' | 'silhouette';

interface Props {
  dishId: string;
  state?: DishState;
  size?: number;
}

/** Placeholder dish picture on a plate. Raw and burnt versions get a sad face. */
export default function DishArt({ dishId, state = 'cooked', size = 96 }: Props) {
  return (
    <span className={`dish-art dish-art--${state}`} style={{ width: size, height: size, fontSize: size * 0.56 }} aria-hidden="true">
      <span className="dish-art__food">{DISH_EMOJI[dishId] ?? '🍽️'}</span>
      {(state === 'raw' || state === 'burnt') && <span className="dish-art__face">😢</span>}
    </span>
  );
}
