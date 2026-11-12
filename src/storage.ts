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
