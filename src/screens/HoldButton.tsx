import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  holdMs: number;
  onHoldStart?: () => void;
  onComplete: () => void;
  children: ReactNode;
}

/** A button that only fires after being pressed and held. */
export default function HoldButton({ holdMs, onHoldStart, onComplete, children }: Props) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const cancel = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
  };

  const begin = () => {
    if (timer.current !== undefined) return;
    setHolding(true);
    onHoldStart?.();
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      onComplete();
    }, holdMs);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      className={`button button--hold${holding ? ' is-holding' : ''}`}
      style={{ '--hold-ms': `${holdMs}ms` } as React.CSSProperties}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) begin();
      }}
      onKeyUp={cancel}
    >
      <span className="button--hold__fill" aria-hidden="true" />
      <span className="button--hold__label">{children}</span>
    </button>
  );
}
