import { dailyMinutes, formatShort, totals } from '../engine/stats';
import type { Session } from '../types';

interface Props {
  sessions: Session[];
}

export default function Stats({ sessions }: Props) {
  const days = dailyMinutes(sessions, Date.now());
  const peak = Math.max(1, ...days.map((d) => d.minutes));
  const { totalMinutes, longestMinutes, closeCalls } = totals(sessions);
  const fortnight = days.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <main className="page page--tabbed">
      <header className="page__header">
        <h1>Stats</h1>
      </header>

      <section className="card">
        <p className="stat__big">{formatShort(fortnight)}</p>
        <p className="muted">Last 14 days</p>
        <ol className="bars" aria-label="Minutes per day for the last 14 days">
          {days.map((d, i) => {
            const date = new Date(d.dayStart);
            return (
              <li key={d.dayStart} aria-label={`${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${d.minutes} minutes`}>
                <span className={`bars__bar${i === days.length - 1 ? ' is-today' : ''}`} style={{ height: `${(d.minutes / peak) * 100}%` }} />
                <span className="bars__day" aria-hidden="true">
                  {date.toLocaleDateString('en-GB', { weekday: 'narrow' })}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <dl className="stat-list">
        <div>
          <dt>Total focus</dt>
          <dd>{formatShort(totalMinutes)}</dd>
        </div>
        <div>
          <dt>Longest session</dt>
          <dd>{formatShort(longestMinutes)}</dd>
        </div>
        <div>
          <dt>Close calls</dt>
          <dd>{closeCalls}</dd>
        </div>
      </dl>
    </main>
  );
}
