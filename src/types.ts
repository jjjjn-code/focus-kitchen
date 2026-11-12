export type Activity = 'reading' | 'study' | 'work' | 'creative' | 'other';
export type Outcome = 'active' | 'cooked' | 'raw' | 'burnt';
export type Rarity = 'common' | 'rare' | 'legendary';
export type Tier = 1 | 2 | 3 | 4 | 5;

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
  lastActivity: Activity;
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
  lastTargetMin: 25,
  lastActivity: 'reading',
};

export const TARGET_OPTIONS = [10, 15, 25, 45, 60, 90, 120] as const;

export const ACTIVITIES: { id: Activity; label: string }[] = [
  { id: 'reading', label: 'Reading' },
  { id: 'study', label: 'Study' },
  { id: 'work', label: 'Work' },
  { id: 'creative', label: 'Creative' },
  { id: 'other', label: 'Other' },
];
