import { useLayoutEffect, useRef } from 'react';

const TICK_PX = 9; // width of one minute on the ruler

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (minutes: number) => void;
}

/**
 * A horizontal ruler that slides under a fixed centre marker. It is a native
 * scroll area with scroll snapping, so it gets iOS momentum scrolling for free.
 */
export default function TimeScrubber({ value, min, max, step, onChange }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  // While a programmatic scroll is animating, ignore the values it passes through.
  const settlingOn = useRef<number | null>(null);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const valueAt = (scrollLeft: number) => {
    const raw = min + Math.round(scrollLeft / TICK_PX / step) * step;
    return Math.min(max, Math.max(min, raw));
  };

  // Place the ruler before the first paint.
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = (value - min) * TICK_PX;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow changes that come from outside (preset buttons, keyboard).
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || valueAt(el.scrollLeft) === value) return;
    settlingOn.current = value;
    el.scrollTo({ left: (value - min) * TICK_PX, behavior: reducedMotion() ? 'auto' : 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const next = valueAt(el.scrollLeft);
    if (settlingOn.current !== null) {
      if (next === settlingOn.current) settlingOn.current = null;
      return;
    }
    if (next !== value) onChange(next);
  };

  const release = () => {
    settlingOn.current = null;
  };

  const minutes = [];
  for (let m = min; m <= max; m++) minutes.push(m);

  return (
    <div className="scrubber">
      <div
        ref={scroller}
        className="scrubber__scroller"
        role="slider"
        tabIndex={0}
        aria-label="Target time in minutes"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} minutes`}
        onScroll={onScroll}
        onPointerDown={release}
        onTouchStart={release}
        onWheel={release}
        onKeyDown={(e) => {
          const delta =
            e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
          if (delta === 0) return;
          e.preventDefault();
          onChange(Math.min(max, Math.max(min, value + delta)));
        }}
      >
        <div className="scrubber__ruler" aria-hidden="true">
          {minutes.map((m) => (
            <span
              key={m}
              className={`scrubber__tick${m % 15 === 0 ? ' is-major' : m % step === 0 ? ' is-mid' : ''}${
                m % step === 0 ? ' is-snap' : ''
              }`}
            >
              {m % 15 === 0 && <span className="scrubber__label">{m}</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="scrubber__marker" aria-hidden="true" />
    </div>
  );
}
