import { useState } from 'react';
import { tierFor, tierName } from '../engine/tiers';
import { ACTIVITIES, MAX_TARGET_MIN, MIN_TARGET_MIN, TARGET_PRESETS, TARGET_STEP_MIN, type Activity, type Settings } from '../types';
import TimeScrubber from './TimeScrubber';

interface Props {
  settings: Settings;
  onBack: () => void;
  onStart: (activity: Activity, targetMin: number) => void;
}

function presetLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = min / 60;
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

function clampTarget(min: number): number {
  const stepped = Math.round(min / TARGET_STEP_MIN) * TARGET_STEP_MIN;
  return Math.min(MAX_TARGET_MIN, Math.max(MIN_TARGET_MIN, stepped));
}

export default function Setup({ settings, onBack, onStart }: Props) {
  const [activity, setActivity] = useState<Activity>(settings.lastActivity);
  const [targetMin, setTargetMin] = useState(() => clampTarget(settings.lastTargetMin));
  const tier = tierFor(targetMin);
  const hours = Math.floor(targetMin / 60);
  const mins = targetMin % 60;

  return (
    <main className="page">
      <button className="link" onClick={onBack}>
        Back
      </button>

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

      <section className="target">
        <h2>Target time</h2>
        <p className="target__readout" data-testid="target-readout">
          {hours > 0 && (
            <>
              <strong>{hours}</strong> hr{' '}
            </>
          )}
          {(mins > 0 || hours === 0) && (
            <>
              <strong>{mins}</strong> min
            </>
          )}
        </p>
        <TimeScrubber
          value={targetMin}
          min={MIN_TARGET_MIN}
          max={MAX_TARGET_MIN}
          step={TARGET_STEP_MIN}
          onChange={setTargetMin}
        />
        <div className="chips chips--centre">
          {TARGET_PRESETS.map((min) => (
            <button
              key={min}
              aria-pressed={targetMin === min}
              className="chip chip--small"
              onClick={() => setTargetMin(min)}
            >
              {presetLabel(min)}
            </button>
          ))}
        </div>
        {tier && (
          <p className="muted target__hint">
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
