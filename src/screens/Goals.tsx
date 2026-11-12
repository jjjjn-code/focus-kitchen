import { useState } from 'react';
import { formatShort } from '../engine/stats';
import type { Goal, Session } from '../types';
import DishArt from './DishArt';
import { BackButton } from './TabBar';

function goalSummary(goal: Goal, sessions: Session[]) {
  const own = sessions.filter((s) => s.goalId === goal.id);
  return {
    minutes: own.reduce((sum, s) => sum + (s.focusedMin ?? 0), 0),
    dishes: own.filter((s) => s.outcome === 'cooked' && s.dishId),
  };
}

interface Props {
  goals: Goal[];
  sessions: Session[];
  activeGoalId?: string;
  onAdd: (title: string) => void;
  onSetActive: (goalId: string | undefined) => void;
  onFinish: (goalId: string) => void;
  onOpenFeast: (goalId: string) => void;
}

export default function Goals({ goals, sessions, activeGoalId, onAdd, onSetActive, onFinish, onOpenFeast }: Props) {
  const [title, setTitle] = useState('');
  const open = goals.filter((g) => !g.finishedAt);
  const finished = goals.filter((g) => g.finishedAt).reverse();

  const summaryText = (goal: Goal) => {
    const { minutes, dishes } = goalSummary(goal, sessions);
    return `${formatShort(minutes)} · ${dishes.length === 1 ? '1 dish' : `${dishes.length} dishes`}`;
  };

  return (
    <main className="page page--tabbed">
      <header className="page__header">
        <h1>Goals</h1>
      </header>

      <form
        className="goal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onAdd(title.trim());
          setTitle('');
        }}
      >
        <input
          aria-label="New goal"
          placeholder="New goal, for example a book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
        />
        <button className="button button--primary" disabled={!title.trim()}>
          Add
        </button>
      </form>

      {open.length === 0 && finished.length === 0 && (
        <p className="muted empty">Add a goal and every dish you cook for it is saved for a feast.</p>
      )}

      {open.map((goal) => {
        const active = goal.id === activeGoalId;
        return (
          <article key={goal.id} className={`card goal${active ? ' is-active' : ''}`}>
            <h2 className="goal__title">{goal.title}</h2>
            <p className="muted">{summaryText(goal)}</p>
            <div className="goal__actions">
              <button
                className="chip"
                aria-pressed={active}
                onClick={() => onSetActive(active ? undefined : goal.id)}
              >
                {active ? 'Cooking for this' : 'Cook for this'}
              </button>
              <button className="link" onClick={() => onFinish(goal.id)}>
                Mark as finished
              </button>
            </div>
          </article>
        );
      })}

      {finished.length > 0 && (
        <section>
          <h2>Finished</h2>
          {finished.map((goal) => (
            <button key={goal.id} className="row-link" onClick={() => onOpenFeast(goal.id)}>
              {goal.title}
              <span className="muted">{summaryText(goal)}</span>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

interface FeastProps {
  goal: Goal;
  sessions: Session[];
  onBack: () => void;
}

/** Every dish cooked for a finished goal, laid out together on one table. */
export function Feast({ goal, sessions, onBack }: FeastProps) {
  const { minutes, dishes } = goalSummary(goal, sessions);

  return (
    <main className="page feast">
      <BackButton onBack={onBack} />
      <header className="page__header">
        <h1>The {goal.title} feast</h1>
        <p className="muted">
          {formatShort(minutes)} · {dishes.length === 1 ? '1 dish' : `${dishes.length} dishes`}
        </p>
      </header>
      <div className="feast__table" role="img" aria-label={`${dishes.length} dishes on a table`}>
        {dishes.length === 0 ? (
          <p className="muted">The table is bare this time.</p>
        ) : (
          dishes.map((s) => <DishArt key={s.id} dishId={s.dishId!} size={76} />)
        )}
      </div>
    </main>
  );
}
