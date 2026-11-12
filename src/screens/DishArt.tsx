export type DishState = 'cooked' | 'raw' | 'burnt' | 'silhouette';

interface Props {
  dishId: string;
  state?: DishState;
  size?: number;
}

/**
 * A dish picture (clay render on a sand backdrop). Raw and burnt versions reuse
 * the cooked image with a colour treatment and a small sad face, until
 * dedicated raw and burnt images exist. Locked dishes are blurred into a hint.
 */
export default function DishArt({ dishId, state = 'cooked', size = 96 }: Props) {
  const folder = size <= 128 ? 256 : 512;
  return (
    <span
      className={`dish-art dish-art--${state}`}
      style={{ width: size, height: size, '--size': `${size}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <img
        className="dish-art__food"
        src={`${import.meta.env.BASE_URL}dishes/${folder}/${dishId}.webp`}
        alt=""
        width={size}
        height={size}
        draggable={false}
      />
      {(state === 'raw' || state === 'burnt') && (
        <svg className="dish-art__face" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill="#fbf6ee" />
          <circle cx="8" cy="10" r="1.6" fill="#3e3029" />
          <circle cx="16" cy="10" r="1.6" fill="#3e3029" />
          <path d="M8 17q4-4 8 0" fill="none" stroke="#3e3029" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}
