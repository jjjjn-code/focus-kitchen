import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_SETTINGS, type Goal, type Session, type Settings } from './types';

interface FocusKitchenDB extends DBSchema {
  sessions: { key: string; value: Session; indexes: { startedAt: number } };
  goals: { key: string; value: Goal };
  settings: { key: string; value: Settings };
}

let dbPromise: Promise<IDBPDatabase<FocusKitchenDB>> | undefined;

function db() {
  dbPromise ??= openDB<FocusKitchenDB>('focus-kitchen', 1, {
    upgrade(database) {
      const sessions = database.createObjectStore('sessions', { keyPath: 'id' });
      sessions.createIndex('startedAt', 'startedAt');
      database.createObjectStore('goals', { keyPath: 'id' });
      database.createObjectStore('settings');
    },
  });
  return dbPromise;
}

/** Finished sessions, oldest first. */
export async function loadSessions(): Promise<Session[]> {
  return (await db()).getAllFromIndex('sessions', 'startedAt');
}

export async function saveSession(session: Session): Promise<void> {
  await (await db()).put('sessions', session);
}

export async function loadGoals(): Promise<Goal[]> {
  const goals = await (await db()).getAll('goals');
  return goals.sort((a, b) => a.createdAt - b.createdAt);
}

export async function saveGoal(goal: Goal): Promise<void> {
  await (await db()).put('goals', goal);
}

export interface Backup {
  app: 'focus-kitchen';
  version: 1;
  exportedAt: number;
  sessions: Session[];
  goals: Goal[];
  settings: Settings;
}

export async function exportBackup(now: number): Promise<Backup> {
  return {
    app: 'focus-kitchen',
    version: 1,
    exportedAt: now,
    sessions: await loadSessions(),
    goals: await loadGoals(),
    settings: await loadSettings(),
  };
}

export function isBackup(value: unknown): value is Backup {
  const b = value as Backup;
  return !!b && b.app === 'focus-kitchen' && Array.isArray(b.sessions) && Array.isArray(b.goals);
}

/** Replaces everything on the device with the contents of a backup. */
export async function importBackup(backup: Backup): Promise<void> {
  const tx = (await db()).transaction(['sessions', 'goals', 'settings'], 'readwrite');
  await tx.objectStore('sessions').clear();
  await tx.objectStore('goals').clear();
  for (const s of backup.sessions) await tx.objectStore('sessions').put(s);
  for (const g of backup.goals) await tx.objectStore('goals').put(g);
  await tx.objectStore('settings').put({ ...DEFAULT_SETTINGS, ...backup.settings }, 'settings');
  await tx.done;
}

export async function loadSettings(): Promise<Settings> {
  const stored = await (await db()).get('settings', 'settings');
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await (await db()).put('settings', settings, 'settings');
}

/*
 * The one active session lives in localStorage rather than IndexedDB. Writes are
 * synchronous, so hiddenAt is safely stored before iOS suspends a hidden page.
 * It moves to IndexedDB when the session ends.
 */
const ACTIVE_KEY = 'focus-kitchen.activeSession';

export function loadActiveSession(): Session | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: Session): void {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_KEY);
}
