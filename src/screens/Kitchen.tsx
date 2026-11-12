import { dishById } from '../data/dishes';
import { formatShort, streak, todayMinutes } from '../engine/stats';
import type { Goal, Session } from '../types';
import DishArt from './DishArt';

interface Props {
  sessions: Session[];
  activeGoal?: Goal;
  onStart: () => void;
  onSettings: () => void;
}

export default function Kitchen({ sessions, activeGoal, onStart, onSettings }: Props) {
  const now = Date.now();
  const today = todayMinutes(sessions, now);
  const days = streak(sessions, now);
  const last = [...sessions].reverse().find((s) => s.outcome === 'cooked' && s.dishId);
  const lastDish = last ? dishById(last.dishId!) : undefined;

  return (
    <main className="page page--tabbed kitchen">
      <button className="icon-button kitchen__settings" onClick={onSettings} aria-label="Settings">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
          </g>
        </svg>
      </button>

      <div className="hero">
        <img className="logo" src={`${import.meta.env.BASE_URL}icon.svg`} alt="Focus Kitchen" />
        <dl className="glance">
          <div>
            <dt>Today</dt>
            <dd>{formatShort(today)}</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>{days === 1 ? '1 day' : `${days} days`}</dd>
          </div>
          {lastDish && (
            <div>
              <dt>Last dish</dt>
              <dd className="glance__dish">
                <DishArt dishId={lastDish.id} size={30} />
                <span className="visually-hidden">{lastDish.name}</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {activeGoal && <p className="muted kitchen__goal">For {activeGoal.title}</p>}
      <button className="button button--primary button--big" onClick={onStart}>
        Start cooking
      </button>
    </main>
  );
}
