import { DISHES } from './dishes';
import { cookCounts, formatDuration, lastWeekMinutes, streak, weekMinutes } from '../engine/stats';
import type { Session } from '../types';

/**
 * Messages for the reveal screen.
 *
 * Only personal stats for now, which are always accurate. Quotes and research
 * findings must each be checked against a reliable source before being added
 * here (see docs/SPEC.md section 7), stored with `source` and `url`, and shown
 * with the source underneath. Never fill gaps with unverified content.
 */
export interface Message {
  text: string;
  source?: string;
  url?: string;
}

/** Every stat message that is true for this session. `all` includes the session itself. */
export function statMessages(session: Session, all: readonly Session[], now: number): string[] {
  const messages: string[] = [];
  const others = all.filter((s) => s.id !== session.id);
  const focused = session.focusedMin ?? 0;

  const previousLongest = others.reduce((max, s) => Math.max(max, s.focusedMin ?? 0), 0);
  if (others.length > 0 && focused > previousLongest) messages.push('Your longest session yet!');

  const thisWeek = weekMinutes(all, now);
  const lastWeek = lastWeekMinutes(all, now);
  if (lastWeek > 0 && thisWeek > lastWeek) {
    messages.push(`${formatDuration(thisWeek - lastWeek)} more than last week already.`);
  }

  const days = streak(all, now);
  if (days >= 2) messages.push(`${days} days in a row with a cooked dish.`);

  const counts = cookCounts(all);
  if (session.dishId && counts.get(session.dishId) === 1) {
    messages.push(`Dish ${counts.size} of ${DISHES.length} in your recipe book.`);
  }

  if (messages.length === 0) {
    const cooked = all.filter((s) => s.outcome === 'cooked').length;
    messages.push(cooked === 1 ? 'Your first dish. The kitchen is open.' : `That is ${cooked} dishes from your kitchen.`);
  }
  return messages;
}

export function pickMessage(session: Session, all: readonly Session[], now: number, rng: () => number): Message {
  const options = statMessages(session, all, now);
  return { text: options[Math.min(options.length - 1, Math.floor(rng() * options.length))] };
}
