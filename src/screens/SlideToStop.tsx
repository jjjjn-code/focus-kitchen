import { useRef, useState } from 'react';

interface Props {
  label: string;
  onSlideStart?: () => void;
  onComplete: () => void;
}

const THUMB = 56;
const PAD = 6;

/** Drag the fried egg to the far end of the track to confirm. Letting go early slides it back. */
export default function SlideToStop({ label, onSlideStart, onComplete }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; max: number } | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const done = useRef(false);

  const maxTravel = () => (track.current ? track.current.clientWidth - THUMB - PAD * 2 : 0);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (done.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX - x, max: maxTravel() };
    setDragging(true);
    onSlideStart?.();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    setX(Math.min(drag.current.max, Math.max(0, e.clientX - drag.current.startX)));
  };

  const onPointerEnd = () => {
    if (!drag.current) return;
    const { max } = drag.current;
    drag.current = null;
    setDragging(false);
    if (max > 0 && x >= max * 0.92) {
      done.current = true;
      setX(max);
      onComplete();
    } else {
      setX(0);
    }
  };

  const progress = maxTravel() > 0 ? x / maxTravel() : 0;

  return (
    <div className={`slide${dragging ? ' is-dragging' : ''}`} ref={track}>
      <span className="slide__label" style={{ opacity: 1 - progress * 1.6 }} aria-hidden="true">
        {label}
      </span>
      <button
        className="slide__thumb"
        style={{ transform: `translateX(${x}px)` }}
        aria-label={`${label}. Drag to the right, or press Enter twice.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          // Keyboard users confirm with a second press instead of a drag.
          if (e.key !== 'Enter' || e.repeat || done.current) return;
          if (x === 0) {
            setX(maxTravel() / 2);
            onSlideStart?.();
          } else {
            done.current = true;
            setX(maxTravel());
            onComplete();
          }
        }}
        onBlur={() => {
          if (!done.current && !drag.current) setX(0);
        }}
      >
        <span className="slide__yolk" aria-hidden="true" />
      </button>
    </div>
  );
}
