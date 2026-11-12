import type { Activity, Session, Tier } from '../types';
import { rollDish } from './roll';
import { tierFor } from './tiers';

/**
 * Pure session rules. Every function takes the current time as an argument, so the
 * logic never depends on counting intervals (iOS suspends hidden pages) and tests
 * can inject a clock.
 */

const MINUTE = 60_000;

/** After the target, leaving the app serves the dish at the tier reached instead of burning it. */
export const LEAVING_AFTER_TARGET_BURNS = false;

export type EndCause = 'button' | 'left';

export interface RollContext {
  /** ids of dishes already cooked at least once */
  cookedIds: ReadonlySet<string>;
  rng: () => number;
}

export type Resolution =
  | { kind: 'continue'; session: Session }
  | { kind: 'ended'; session: Session };

export function startSession(input: {
  id: string;
  activity: Activity;
  targetMin: number;
  goalId?: string;
  now: number;
}): Session {
  return {
    id: input.id,
    activity: input.activity,
    goalId: input.goalId,
    targetMin: input.targetMin,
    startedAt: input.now,
    lastSeenAt: input.now,
    outcome: 'active',
    closeCalls: 0,
  };
}

export function elapsedMs(session: Session, now: number): number {
  return Math.max(0, now - session.startedAt);
}

export function targetReached(session: Session, now: number): boolean {
  return elapsedMs(session, now) >= session.targetMin * MINUTE;
}

/** The page became hidden. Keeps the earliest hidden time if called twice. */
export function markHidden(session: Session, now: number): Session {
  if (session.hiddenAt !== undefined) return session;
  return { ...session, hiddenAt: now };
}

/** Heartbeat while the page is visible. */
export function markSeen(session: Session, now: number): Session {
  return { ...session, lastSeenAt: now };
}

/** End the session at `endedAt` and decide the outcome and the dish. */
export function endSession(
  session: Session,
  endedAt: number,
  cause: EndCause,
  roll: RollContext,
): Session {
  const focusedMin = Math.floor(elapsedMs(session, endedAt) / MINUTE);
  const reached = targetReached(session, endedAt);
  const cookedTier = tierFor(focusedMin);

  let outcome: Session['outcome'];
  if (!reached || cookedTier === null) {
    outcome = cause === 'left' ? 'burnt' : 'raw';
  } else if (cause === 'left' && LEAVING_AFTER_TARGET_BURNS) {
    outcome = 'burnt';
  } else {
    outcome = 'cooked';
  }

  // A cooked dish comes from the tier actually reached; a failed dish from the
  // tier she was trying to cook.
  const tier: Tier = outcome === 'cooked' ? cookedTier! : (tierFor(session.targetMin) ?? 1);
  const dish = rollDish(tier, roll.cookedIds, roll.rng);

  const ended: Session = { ...session, endedAt, focusedMin, outcome, tier, dishId: dish.id };
  delete ended.hiddenAt;
  if (cause === 'left' && outcome === 'cooked') ended.leftKitchen = true;
  return ended;
}

/** Stop (before the target, gives raw) or Serve (after the target, gives cooked). */
export function finishByButton(session: Session, now: number, roll: RollContext): Session {
  return endSession(session, now, 'button', roll);
}

/**
 * The page became visible again. Within the grace period the session continues
 * and a close call is counted; otherwise it ended at the moment the page was hidden.
 */
export function resumeVisible(
  session: Session,
  now: number,
  graceSeconds: number,
  roll: RollContext,
): Resolution {
  if (session.hiddenAt === undefined) {
    return { kind: 'continue', session: markSeen(session, now) };
  }
  if (now - session.hiddenAt <= graceSeconds * 1000) {
    const resumed: Session = { ...session, closeCalls: session.closeCalls + 1, lastSeenAt: now };
    delete resumed.hiddenAt;
    return { kind: 'continue', session: resumed };
  }
  return { kind: 'ended', session: endSession(session, session.hiddenAt, 'left', roll) };
}

/**
 * The app was opened from scratch and an active session was found in storage.
 * If the page was killed without warning there is no hiddenAt, so the last
 * heartbeat stands in for it.
 */
export function resolveOnLaunch(
  session: Session,
  now: number,
  graceSeconds: number,
  roll: RollContext,
): Resolution {
  const leftAt = session.hiddenAt ?? session.lastSeenAt ?? session.startedAt;
  return resumeVisible({ ...session, hiddenAt: leftAt }, now, graceSeconds, roll);
}
