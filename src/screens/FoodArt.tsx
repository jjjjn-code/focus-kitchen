import type { ReactNode } from 'react';

/**
 * Placeholder food pictures for the set up screen, one per tier. They show the
 * kind of dish a session of that length can cook, not the exact dish (that
 * stays a surprise). To be replaced by the clay renders in M3.
 */
export interface FoodStage {
  fromMin: number;
  label: string;
  colour: string;
  art: ReactNode;
}

const INK = '#3e3029';

const Shadow = () => <ellipse cx="100" cy="172" rx="62" ry="9" fill="#3e3029" opacity="0.12" />;

const Eyes = ({ y, gap = 14 }: { y: number; gap?: number }) => (
  <g fill={INK}>
    <circle cx={100 - gap} cy={y} r="3.2" />
    <circle cx={100 + gap} cy={y} r="3.2" />
    <path d={`M${100 - 5} ${y + 5}q5 5 10 0`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
  </g>
);

const Egg = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <path
      d="M52 112c-16-30 8-62 40-58 14-18 52-12 58 14 26 6 30 44 6 58-4 28-44 38-62 22-26 10-52-8-42-36z"
      fill="#fbf6ee"
    />
    <circle cx="104" cy="106" r="30" fill="#f2b03c" />
    <path d="M86 98a20 20 0 0 1 22-14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const Onigiri = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <path d="M100 34c12 0 20 8 30 26l34 62c12 22 0 44-26 44H62c-26 0-38-22-26-44l34-62c10-18 18-26 30-26z" fill="#fbf6ee" />
    <path d="M70 124h60v42H70z" fill="#3b4a3f" />
    <Eyes y={98} />
    <circle cx="76" cy="106" r="6" fill="#e9a8a0" opacity="0.7" />
    <circle cx="124" cy="106" r="6" fill="#e9a8a0" opacity="0.7" />
  </svg>
);

const Omurice = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <ellipse cx="100" cy="150" rx="84" ry="20" fill="#fbf6ee" />
    <ellipse cx="100" cy="146" rx="62" ry="12" fill="#eadfce" />
    <path d="M38 138c0-40 28-66 62-66s62 26 62 66c0 12-124 12-124 0z" fill="#f2c24e" />
    <path d="M70 110q10-14 20 0t20 0 20 0" fill="none" stroke="#c9553f" strokeWidth="8" strokeLinecap="round" />
    <path d="M150 128l14-22" stroke="#6e9a78" strokeWidth="6" strokeLinecap="round" />
    <circle cx="166" cy="102" r="7" fill="#6e9a78" />
  </svg>
);

const Ramen = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <path d="M70 52c-8-10 8-16 0-28M100 48c-8-10 8-16 0-28M130 52c-8-10 8-16 0-28" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
    <path d="M22 96h156c0 44-30 74-78 74s-78-30-78-74z" fill="#5e8ca8" />
    <ellipse cx="100" cy="96" rx="78" ry="20" fill="#4d7690" />
    <ellipse cx="100" cy="96" rx="68" ry="15" fill="#e3b07a" />
    <path d="M50 96q10-8 20 0t20 0 20 0M56 102q10-6 20 0t20 0" fill="none" stroke="#f6dfa6" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="126" cy="92" rx="15" ry="10" fill="#fbf6ee" />
    <ellipse cx="126" cy="92" rx="7" ry="5" fill="#f2b03c" />
    <path d="M146 78h18v20h-18z" fill="#3b4a3f" />
    <path d="M30 60l92 30M38 50l88 38" stroke="#8a5a44" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Pot = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <path d="M76 50c-8-10 8-16 0-28M124 50c-8-10 8-16 0-28" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
    <rect x="8" y="92" width="30" height="16" rx="8" fill="#2f2622" />
    <rect x="162" y="92" width="30" height="16" rx="8" fill="#2f2622" />
    <path d="M28 84h144v40c0 28-22 46-50 46H78c-28 0-50-18-50-46z" fill="#4a3b34" />
    <ellipse cx="100" cy="84" rx="72" ry="20" fill="#2f2622" />
    <ellipse cx="100" cy="84" rx="64" ry="15" fill="#fbf6ee" />
    <path d="M100 69a64 15 0 0 1 0 30z" fill="#6e9a78" />
    <path d="M100 69a64 15 0 0 0-52 6l52 9z" fill="#c9553f" />
    <path d="M48 75a64 15 0 0 0 52 24V84z" fill="#f2c24e" />
    <ellipse cx="100" cy="84" rx="13" ry="8" fill="#fbf6ee" />
    <ellipse cx="100" cy="84" rx="6" ry="4" fill="#f2b03c" />
  </svg>
);

const Cake = (
  <svg viewBox="0 0 200 200">
    <Shadow />
    <ellipse cx="100" cy="160" rx="80" ry="12" fill="#fbf6ee" />
    <path d="M34 96h132v56c0 10-132 10-132 0z" fill="#f6dfa6" />
    <path d="M34 118h132v12H34z" fill="#fbf6ee" />
    <path d="M34 124h132" stroke="#d9705f" strokeWidth="4" strokeDasharray="10 12" />
    <path d="M34 96c0-10 132-10 132 0v14c-10 10-18-6-28 2s-18 8-28 0-18-6-28 2-18 6-28-2-14 2-20-2z" fill="#fbf6ee" />
    <ellipse cx="100" cy="90" rx="66" ry="12" fill="#fbf6ee" />
    {[58, 100, 142].map((x) => (
      <g key={x}>
        <path d={`M${x - 13} 76c0-16 26-16 26 0 0 12-8 20-13 20s-13-8-13-20z`} fill="#d9553f" />
        <path d={`M${x - 6} 64l6-6 6 6`} fill="none" stroke="#6e9a78" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ))}
  </svg>
);

/** One picture per tier, starting at the minute the tier starts. */
export const FOOD_STAGES: FoodStage[] = [
  { fromMin: 5, label: 'Nibble', colour: '#c7d6d3', art: Egg },
  { fromMin: 10, label: 'Snack', colour: '#cfd8ba', art: Onigiri },
  { fromMin: 25, label: 'Light meal', colour: '#efd3a7', art: Omurice },
  { fromMin: 45, label: 'Main', colour: '#e8c2ad', art: Ramen },
  { fromMin: 75, label: 'Hearty', colour: '#b9cbd6', art: Pot },
  { fromMin: 120, label: 'Feast', colour: '#eeccc6', art: Cake },
];

export function stageIndexFor(minutes: number): number {
  let index = 0;
  FOOD_STAGES.forEach((stage, i) => {
    if (minutes >= stage.fromMin) index = i;
  });
  return index;
}
