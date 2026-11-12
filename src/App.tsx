import { useEffect, useMemo, useState } from 'react';
import { pickMessage, type Message } from './data/messages';
import { resolveOnLaunch, startSession, type RollContext } from './engine/session';
import { keepAwake } from './screenAwake';
import Cooking from './screens/Cooking';
import Goals, { Feast } from './screens/Goals';
import Kitchen from './screens/Kitchen';
import RecipeBook, { DishCard, Mishaps } from './screens/RecipeBook';
import Result from './screens/Result';
import SettingsScreen from './screens/SettingsScreen';
import Setup from './screens/Setup';
import Stats from './screens/Stats';
import TabBar, { type Tab } from './screens/TabBar';
import {
  clearActiveSession,
  loadActiveSession,
  loadGoals,
  loadSessions,
  loadSettings,
  saveActiveSession,
  saveGoal,
  saveSession,
  saveSettings,
} from './storage';
import { DEFAULT_ACTIVITY, DEFAULT_SETTINGS, type Goal, type Session, type Settings } from './types';

type View =
  | { name: 'loading' }
  | { name: 'tab'; tab: Tab }
  | { name: 'setup' }
  | { name: 'cooking'; session: Session }
  | { name: 'result'; session: Session; isNew: boolean; message: Message }
  | { name: 'dish'; dishId: string }
  | { name: 'mishaps' }
  | { name: 'feast'; goalId: string }
  | { name: 'settings' };

function cookedIdsOf(sessions: Session[]): Set<string> {
  return new Set(sessions.filter((s) => s.outcome === 'cooked' && s.dishId).map((s) => s.dishId!));
}

/** Builds the result view for a session that has just ended. `before` excludes it. */
function resultView(ended: Session, before: Session[]): View {
  return {
    name: 'result',
    session: ended,
    isNew: ended.outcome === 'cooked' && !cookedIdsOf(before).has(ended.dishId!),
    message: pickMessage(ended, [...before, ended], ended.endedAt ?? Date.now(), Math.random),
  };
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'loading' });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const roll: RollContext = useMemo(() => ({ cookedIds: cookedIdsOf(sessions), rng: Math.random }), [sessions]);
  const activeGoal = goals.find((g) => g.id === settings.activeGoalId && !g.finishedAt);
  const goTab = (tab: Tab) => setView({ name: 'tab', tab });

  const load = async () => {
    const [storedSettings, storedSessions, storedGoals] = await Promise.all([loadSettings(), loadSessions(), loadGoals()]);
    setSettings(storedSettings);
    setSessions(storedSessions);
    setGoals(storedGoals);
    return { storedSettings, storedSessions };
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { storedSettings, storedSessions } = await load();
      if (cancelled) return;
      const active = loadActiveSession();
      if (!active) {
        goTab('kitchen');
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
        setView(resultView(result.session, storedSessions));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSettings = (next: Settings) => {
    setSettings(next);
    void saveSettings(next);
  };

  const start = (targetMin: number) => {
    // Ask for the wake lock inside the tap, while the browser still allows it.
    void keepAwake();
    changeSettings({ ...settings, lastTargetMin: targetMin });
    const session = startSession({
      id: crypto.randomUUID(),
      activity: activeGoal?.activity ?? DEFAULT_ACTIVITY,
      goalId: activeGoal?.id,
      targetMin,
      now: Date.now(),
    });
    saveActiveSession(session);
    setView({ name: 'cooking', session });
  };

  const finish = (ended: Session) => {
    clearActiveSession();
    void saveSession(ended);
    setView(resultView(ended, sessions));
    setSessions((all) => [...all, ended]);
  };

  const saveNote = (sessionId: string, note: string) => {
    setSessions((all) =>
      all.map((s) => {
        if (s.id !== sessionId) return s;
        const updated = { ...s, note: note || undefined };
        void saveSession(updated);
        return updated;
      }),
    );
  };

  const addGoal = (title: string) => {
    const goal: Goal = { id: crypto.randomUUID(), title, activity: DEFAULT_ACTIVITY, createdAt: Date.now() };
    void saveGoal(goal);
    setGoals((all) => [...all, goal]);
    // The first goal becomes the one being cooked for.
    if (!activeGoal) changeSettings({ ...settings, activeGoalId: goal.id });
  };

  const finishGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const finished = { ...goal, finishedAt: Date.now() };
    void saveGoal(finished);
    setGoals((all) => all.map((g) => (g.id === goalId ? finished : g)));
    if (settings.activeGoalId === goalId) changeSettings({ ...settings, activeGoalId: undefined });
    setView({ name: 'feast', goalId });
  };

  switch (view.name) {
    case 'loading':
      return null;
    case 'tab':
      return (
        <>
          {view.tab === 'kitchen' && (
            <Kitchen
              sessions={sessions}
              activeGoal={activeGoal}
              onStart={() => setView({ name: 'setup' })}
              onSettings={() => setView({ name: 'settings' })}
            />
          )}
          {view.tab === 'book' && (
            <RecipeBook
              sessions={sessions}
              onOpenDish={(dishId) => setView({ name: 'dish', dishId })}
              onOpenMishaps={() => setView({ name: 'mishaps' })}
            />
          )}
          {view.tab === 'goals' && (
            <Goals
              goals={goals}
              sessions={sessions}
              activeGoalId={activeGoal?.id}
              onAdd={addGoal}
              onSetActive={(goalId) => changeSettings({ ...settings, activeGoalId: goalId })}
              onFinish={finishGoal}
              onOpenFeast={(goalId) => setView({ name: 'feast', goalId })}
            />
          )}
          {view.tab === 'stats' && <Stats sessions={sessions} />}
          <TabBar current={view.tab} onChange={goTab} />
        </>
      );
    case 'setup':
      return <Setup settings={settings} onBack={() => goTab('kitchen')} onStart={start} />;
    case 'cooking':
      return (
        <Cooking
          key={view.session.id}
          session={view.session}
          graceSeconds={settings.graceSeconds}
          notifyOnLeave={settings.notifyExperiment}
          roll={roll}
          onEnd={finish}
        />
      );
    case 'result':
      return (
        <Result
          session={view.session}
          sessions={sessions}
          goal={goals.find((g) => g.id === view.session.goalId)}
          isNew={view.isNew}
          message={view.message}
          onSaveNote={(note) => saveNote(view.session.id, note)}
          onDone={goTab}
        />
      );
    case 'dish':
      return <DishCard dishId={view.dishId} sessions={sessions} goals={goals} onBack={() => goTab('book')} />;
    case 'mishaps':
      return <Mishaps sessions={sessions} onBack={() => goTab('book')} />;
    case 'feast': {
      const goal = goals.find((g) => g.id === view.goalId);
      return goal ? <Feast goal={goal} sessions={sessions} onBack={() => goTab('goals')} /> : null;
    }
    case 'settings':
      return (
        <SettingsScreen
          settings={settings}
          onChange={changeSettings}
          onImported={() => void load()}
          onBack={() => goTab('kitchen')}
        />
      );
  }
}
