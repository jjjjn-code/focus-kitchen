import { useState } from 'react';
import { MAX_TARGET_MIN, MIN_TARGET_MIN, TARGET_PRESETS, TARGET_STEP_MIN, type Settings } from '../types';
import DishArt from './DishArt';
import { FOOD_STAGES, stageIndexFor } from './FoodArt';
import { BackButton } from './TabBar';
import TimeScrubber from './TimeScrubber';

interface Props {
  settings: Settings;
  onBack: () => void;
  onStart: (targetMin: number) => void;
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
  const [targetMin, setTargetMin] = useState(() => clampTarget(settings.lastTargetMin));
  const hours = Math.floor(targetMin / 60);
  const mins = targetMin % 60;
  const stage = stageIndexFor(targetMin);

  return (
    <main className="setup">
      {/* The longer the session, the more elaborate the food. */}
      <div className="setup__stage" style={{ backgroundColor: FOOD_STAGES[stage].colour }}>
        <BackButton onBack={onBack} />
        <div
          className="setup__foods"
          style={{ '--stage': stage } as React.CSSProperties}
          role="img"
          aria-label={FOOD_STAGES[stage].label}
          data-testid="food-stage"
        >
          {FOOD_STAGES.map((s, i) => (
            <div key={s.fromMin} className={`setup__food${i === stage ? ' is-active' : ''}`} aria-hidden="true">
              <DishArt dishId={s.dishId} size={220} />
            </div>
          ))}
        </div>
      </div>

      <section className="setup__panel">
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
        <button className="button button--primary button--big" onClick={() => onStart(targetMin)}>
          Start
        </button>
      </section>
    </main>
  );
}
