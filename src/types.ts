export type Activity = 'reading' | 'study' | 'work' | 'creative' | 'other';
export type Outcome = 'active' | 'cooked' | 'raw' | 'burnt';
export type Rarity = 'common' | 'rare' | 'legendary';
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export interface Session {
  id: string;
  activity: Activity;
  goalId?: string;
  targetMin: number;
  startedAt: number; // epoch ms
  endedAt?: number;
  focusedMin?: number; // whole minutes, computed at the end
  outcome: Outcome;
  dishId?: string; // cooked dish, or the failed dish for raw/burnt
  tier?: Tier;
  hiddenAt?: number; // set while the page is hidden
  lastSeenAt?: number; // heartbeat while visible, used if the page is killed without warning
  leftKitchen?: boolean; // ended because she left the app (cooked sessions only; burnt implies it)
  closeCalls: number; // returns within the grace period
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  activity: Activity;
  createdAt: number;
  finishedAt?: number;
}

export interface Settings {
  graceSeconds: number;
  sound: boolean;
  notifyExperiment: boolean;
  lastTargetMin: number;
  /** New sessions count towards this goal. */
  activeGoalId?: string;
}

export interface Dish {
  id: string;
  name: string;
  tier: Tier;
  rarity: Rarity;
  blurb: string;
  /** Keep the capital letter mid-sentence (for names that start with a proper noun). */
  properNoun?: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  graceSeconds: 10,
  sound: false,
  notifyExperiment: false,
  lastTargetMin: 15,
};

/** The target time slider: 5 minutes is the least that can produce a cooked dish. */
export const MIN_TARGET_MIN = 5;
export const MAX_TARGET_MIN = 180;
export const TARGET_STEP_MIN = 5;
export const GRACE_OPTIONS = [5, 10, 20] as const;
/** Popular targets offered as buttons under the slider. */
export const TARGET_PRESETS = [5, 15, 30, 45, 60] as const;

/** There is no activity picker for now, so every session is recorded with this activity. */
export const DEFAULT_ACTIVITY: Activity = 'reading';
