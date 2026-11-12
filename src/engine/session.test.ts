import { describe, expect, it } from 'vitest';
import { dishById } from '../data/dishes';
import type { Session } from '../types';
import {
  finishByButton,
  markHidden,
  markSeen,
  resolveOnLaunch,
  resumeVisible,
  startSession,
  targetReached,
} from './session';

const MIN = 60_000;
const SEC = 1000;
const T0 = 1_800_000_000_000;
const roll = { cookedIds: new Set<string>(), rng: () => 0 };
const GRACE = 10;

const begin = (targetMin = 25): Session =>
  startSession({ id: 's1', activity: 'reading', targetMin, now: T0 });

describe('startSession', () => {
  it('creates an active session', () => {
    const s = begin();
    expect(s).toMatchObject({ outcome: 'active', startedAt: T0, targetMin: 25, closeCalls: 0 });
  });
});

describe('targetReached', () => {
  it('is true exactly at the target', () => {
    const s = begin(25);
    expect(targetReached(s, T0 + 25 * MIN - 1)).toBe(false);
    expect(targetReached(s, T0 + 25 * MIN)).toBe(true);
  });
});

describe('stopping before the target', () => {
  it('gives a raw dish from the tier of the target', () => {
    const s = finishByButton(begin(45), T0 + 30 * MIN + 59 * SEC, roll);
    expect(s.outcome).toBe('raw');
    expect(s.focusedMin).toBe(30);
    expect(s.tier).toBe(3);
    expect(dishById(s.dishId!)!.tier).toBe(3);
    expect(s.endedAt).toBe(T0 + 30 * MIN + 59 * SEC);
  });

  it('is raw even one second before the target', () => {
    expect(finishByButton(begin(10), T0 + 10 * MIN - SEC, roll).outcome).toBe('raw');
  });
});

describe('serving after the target', () => {
  it('gives a cooked dish at the target tier', () => {
    const s = finishByButton(begin(25), T0 + 25 * MIN, roll);
    expect(s.outcome).toBe('cooked');
    expect(s.tier).toBe(2);
    expect(dishById(s.dishId!)!.tier).toBe(2);
  });

  it('uses the actual focused minutes for the tier during overtime', () => {
    const s = finishByButton(begin(10), T0 + 80 * MIN, roll);
    expect(s.outcome).toBe('cooked');
    expect(s.focusedMin).toBe(80);
    expect(s.tier).toBe(4);
  });
});

describe('a 5 minute session', () => {
  it('cooks a nibble', () => {
    const s = finishByButton(begin(5), T0 + 5 * MIN, roll);
    expect(s.outcome).toBe('cooked');
    expect(s.tier).toBe(0);
    expect(dishById(s.dishId!)!.tier).toBe(0);
  });
});

describe('leaving the app', () => {
  it('continues and counts a close call when back within the grace period', () => {
    const hidden = markHidden(begin(), T0 + 5 * MIN);
    const r = resumeVisible(hidden, T0 + 5 * MIN + 10 * SEC, GRACE, roll);
    expect(r.kind).toBe('continue');
    expect(r.session.closeCalls).toBe(1);
    expect(r.session.hiddenAt).toBeUndefined();
    expect(r.session.outcome).toBe('active');
  });

  it('burns the dish when away longer than the grace period, ending at hiddenAt', () => {
    const hidden = markHidden(begin(45), T0 + 5 * MIN);
    const r = resumeVisible(hidden, T0 + 5 * MIN + 10 * SEC + 1, GRACE, roll);
    expect(r.kind).toBe('ended');
    expect(r.session.outcome).toBe('burnt');
    expect(r.session.endedAt).toBe(T0 + 5 * MIN);
    expect(r.session.focusedMin).toBe(5);
    expect(r.session.tier).toBe(3);
    expect(r.session.hiddenAt).toBeUndefined();
  });

  it('respects a different grace period', () => {
    const hidden = markHidden(begin(), T0 + MIN);
    expect(resumeVisible(hidden, T0 + MIN + 15 * SEC, 20, roll).kind).toBe('continue');
    expect(resumeVisible(hidden, T0 + MIN + 15 * SEC, 5, roll).kind).toBe('ended');
  });

  it('keeps the earliest hidden time if hidden is reported twice', () => {
    const hidden = markHidden(markHidden(begin(), T0 + MIN), T0 + 2 * MIN);
    expect(hidden.hiddenAt).toBe(T0 + MIN);
  });

  it('burns even if a long time passes, without counting the time away', () => {
    const hidden = markHidden(begin(25), T0 + 20 * MIN);
    const r = resumeVisible(hidden, T0 + 300 * MIN, GRACE, roll);
    expect(r.session.outcome).toBe('burnt');
    expect(r.session.focusedMin).toBe(20);
  });

  it('serves at the tier reached when she leaves after the target', () => {
    const hidden = markHidden(begin(25), T0 + 50 * MIN);
    const r = resumeVisible(hidden, T0 + 90 * MIN, GRACE, roll);
    expect(r.kind).toBe('ended');
    expect(r.session.outcome).toBe('cooked');
    expect(r.session.focusedMin).toBe(50);
    expect(r.session.tier).toBe(3);
    expect(r.session.leftKitchen).toBe(true);
  });

  it('does nothing special when visible without having been hidden', () => {
    const r = resumeVisible(begin(), T0 + MIN, GRACE, roll);
    expect(r.kind).toBe('continue');
    expect(r.session.closeCalls).toBe(0);
  });
});

describe('reopening the app from scratch', () => {
  it('burns when hiddenAt is older than the grace period', () => {
    const hidden = markHidden(begin(), T0 + 3 * MIN);
    const r = resolveOnLaunch(hidden, T0 + 10 * MIN, GRACE, roll);
    expect(r.session.outcome).toBe('burnt');
    expect(r.session.endedAt).toBe(T0 + 3 * MIN);
  });

  it('continues when reopened within the grace period', () => {
    const hidden = markHidden(begin(), T0 + 3 * MIN);
    const r = resolveOnLaunch(hidden, T0 + 3 * MIN + 4 * SEC, GRACE, roll);
    expect(r.kind).toBe('continue');
    expect(r.session.closeCalls).toBe(1);
  });

  it('burns when the page was killed without warning, ending at the last heartbeat', () => {
    const seen = markSeen(begin(), T0 + 7 * MIN);
    const r = resolveOnLaunch(seen, T0 + 60 * MIN, GRACE, roll);
    expect(r.session.outcome).toBe('burnt');
    expect(r.session.endedAt).toBe(T0 + 7 * MIN);
    expect(r.session.focusedMin).toBe(7);
  });

  it('serves at the tier reached if the page was killed after the target', () => {
    const seen = markSeen(begin(10), T0 + 30 * MIN);
    const r = resolveOnLaunch(seen, T0 + 600 * MIN, GRACE, roll);
    expect(r.session.outcome).toBe('cooked');
    expect(r.session.tier).toBe(2);
  });
});
