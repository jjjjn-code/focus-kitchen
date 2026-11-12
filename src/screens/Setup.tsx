import { useState } from 'react';
import { MAX_TARGET_MIN, MIN_TARGET_MIN, TARGET_PRESETS, TARGET_STEP_MIN, type Settings } from '../types';
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

  return (
    <main className="page">
      <button className="back" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <section className="target">
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
      </section>

      <button className="button button--primary button--big" onClick={() => onStart(targetMin)}>
        Start
      </button>
    </main>
  );
}
