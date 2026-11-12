import { useEffect, useMemo, useState } from 'react';
import { resolveOnLaunch, startSession, type RollContext } from './engine/session';
import { keepAwake } from './screenAwake';
import Cooking from './screens/Cooking';
import Kitchen from './screens/Kitchen';
import Result from './screens/Result';
import Setup from './screens/Setup';
import {
  clearActiveSession,
  loadActiveSession,
  loadSessions,
  loadSettings,
  saveActiveSession,
  saveSession,
  saveSettings,
} from './storage';
import { DEFAULT_SETTINGS, type Activity, type Session, type Settings } from './types';

type View =
  | { name: 'loading' }
  | { name: 'kitchen' }
  | { name: 'setup' }
  | { name: 'cooking'; session: Session }
  | { name: 'result'; session: Session };

function cookedIdsOf(sessions: Session[]): Set<string> {
  return new Set(sessions.filter((s) => s.outcome === 'cooked' && s.dishId).map((s) => s.dishId!));
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'loading' });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<Session[]>([]);

  const roll: RollContext = useMemo(
    () => ({ cookedIds: cookedIdsOf(sessions), rng: Math.random }),
    [sessions],
  );

  const finish = (ended: Session) => {
    clearActiveSession();
    void saveSession(ended);
    setSessions((all) => [...all, ended]);
    setView({ name: 'result', session: ended });
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedSettings, storedSessions] = await Promise.all([loadSettings(), loadSessions()]);
      if (cancelled) return;
      setSettings(storedSettings);
      setSessions(storedSessions);

      const active = loadActiveSession();
      if (!active) {
        setView({ name: 'kitchen' });
        return;
      }
      // The app was reopened with a session still on the stove.
      const result = resolveOnLaunch(active, Date.now(), storedSettings.graceSeconds, {
        cookedIds: cookedIdsOf(storedSessions),
        rng: Math.random,
      });
      if (result.kind === 'continue') {
        saveActiveSession(result.session);
        setView({ name: 'cooking', session: result.session });
      } else {
        clearActiveSession();
        void saveSession(result.session);
        setSessions([...storedSessions, result.session]);
        setView({ name: 'result', session: result.session });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const start = (activity: Activity, targetMin: number) => {
    // Ask for the wake lock inside the tap, while the browser still allows it.
    void keepAwake();
    const next = { ...settings, lastActivity: activity, lastTargetMin: targetMin };
    setSettings(next);
    void saveSettings(next);
    const session = startSession({ id: crypto.randomUUID(), activity, targetMin, now: Date.now() });
    saveActiveSession(session);
    setView({ name: 'cooking', session });
  };

  switch (view.name) {
    case 'loading':
      return null;
    case 'kitchen':
      return (
        <Kitchen
          dishesCooked={sessions.filter((s) => s.outcome === 'cooked').length}
          onStart={() => setView({ name: 'setup' })}
        />
      );
    case 'setup':
      return <Setup settings={settings} onBack={() => setView({ name: 'kitchen' })} onStart={start} />;
    case 'cooking':
      return (
        <Cooking
          key={view.session.id}
          session={view.session}
          graceSeconds={settings.graceSeconds}
          roll={roll}
          onEnd={finish}
        />
      );
    case 'result':
      return <Result session={view.session} onDone={() => setView({ name: 'kitchen' })} />;
  }
}
