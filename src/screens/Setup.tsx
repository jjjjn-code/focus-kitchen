import { useState } from 'react';
import { tierFor, tierName } from '../engine/tiers';
import { ACTIVITIES, TARGET_OPTIONS, type Activity, type Settings } from '../types';

interface Props {
  settings: Settings;
  onBack: () => void;
  onStart: (activity: Activity, targetMin: number) => void;
}

function targetLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = min / 60;
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

export default function Setup({ settings, onBack, onStart }: Props) {
  const [activity, setActivity] = useState<Activity>(settings.lastActivity);
  const [targetMin, setTargetMin] = useState(settings.lastTargetMin);
  const tier = tierFor(targetMin);

  return (
    <main className="page">
      <button className="link" onClick={onBack}>
        Back
      </button>
      <h1>What are you cooking up?</h1>

      <section>
        <h2 id="activity-label">Activity</h2>
        <div className="chips" role="radiogroup" aria-labelledby="activity-label">
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={activity === a.id}
              className="chip"
              onClick={() => setActivity(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 id="target-label">Target time</h2>
        <div className="chips" role="radiogroup" aria-labelledby="target-label">
          {TARGET_OPTIONS.map((min) => (
            <button
              key={min}
              role="radio"
              aria-checked={targetMin === min}
              className="chip"
              onClick={() => setTargetMin(min)}
            >
              {targetLabel(min)}
            </button>
          ))}
        </div>
        {tier && (
          <p className="muted">
            Reach the target to cook a {tierName(tier).toLowerCase()}. Keep going and it upgrades.
          </p>
        )}
      </section>

      <div className="page__footer">
        <p className="muted">Put your phone face down without locking it. Leaving the app burns the dish.</p>
        <button className="button button--primary button--big" onClick={() => onStart(activity, targetMin)}>
          Start
        </button>
      </div>
    </main>
  );
}
