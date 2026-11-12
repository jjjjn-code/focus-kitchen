import { useEffect, useRef, useState } from 'react';
import {
  elapsedMs,
  finishByButton,
  markHidden,
  markSeen,
  resumeVisible,
  targetReached,
  type RollContext,
} from '../engine/session';
import { minutesToNextTier, tierFor, tierName } from '../engine/tiers';
import { allowSleep, keepAwake, type AwakeMode } from '../screenAwake';
import { saveActiveSession } from '../storage';
import type { Session } from '../types';
import HoldButton from './HoldButton';

const HOLD_TO_STOP_MS = 1500;
const HEARTBEAT_MS = 5000;
const RING_RADIUS = 132;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface Props {
  session: Session;
  graceSeconds: number;
  roll: RollContext;
  onEnd: (session: Session) => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function Cooking({ session: initial, graceSeconds, roll, onEnd }: Props) {
  // The session lives in a ref so event handlers always see the latest copy,
  // and every change is written to storage straight away.
  const sessionRef = useRef(initial);
  const [now, setNow] = useState(() => Date.now());
  const [awake, setAwake] = useState<AwakeMode | 'pending'>('pending');
  const [warning, setWarning] = useState(false);
  const ended = useRef(false);
  const latest = useRef({ graceSeconds, roll, onEnd });
  latest.current = { graceSeconds, roll, onEnd };

  const update = (next: Session) => {
    sessionRef.current = next;
    saveActiveSession(next);
  };

  const end = (finished: Session) => {
    if (ended.current) return;
    ended.current = true;
    allowSleep();
    latest.current.onEnd(finished);
  };

  useEffect(() => {
    const onHidden = () => {
      if (ended.current) return;
      update(markHidden(sessionRef.current, Date.now()));
    };

    const onVisible = () => {
      if (ended.current) return;
      const { graceSeconds, roll } = latest.current;
      const result = resumeVisible(sessionRef.current, Date.now(), graceSeconds, roll);
      if (result.kind === 'ended') {
        end(result.session);
        return;
      }
      update(result.session);
      setNow(Date.now());
      void keepAwake().then(setAwake);
    };

    const onVisibilityChange = () => (document.visibilityState === 'hidden' ? onHidden() : onVisible());

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onHidden);
    window.addEventListener('pageshow', onVisible);

    let lastBeat = 0;
    const tick = window.setInterval(() => {
      if (ended.current || document.visibilityState === 'hidden') return;
      const t = Date.now();
      // If a visibility event was missed while suspended, settle it now.
      if (sessionRef.current.hiddenAt !== undefined) {
        onVisible();
        return;
      }
      if (t - lastBeat >= HEARTBEAT_MS) {
        lastBeat = t;
        update(markSeen(sessionRef.current, t));
      }
      setNow(t);
    }, 1000);

    void keepAwake().then(setAwake);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onHidden);
      window.removeEventListener('pageshow', onVisible);
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const session = sessionRef.current;
  const elapsed = elapsedMs(session, now);
  const reached = targetReached(session, now);
  const progress = Math.min(1, elapsed / (session.targetMin * 60_000));
  const tier = tierFor(Math.floor(elapsed / 60_000));
  const toNext = minutesToNextTier(elapsed);
  const remainingMin = Math.ceil((session.targetMin * 60_000 - elapsed) / 60_000);

  const finish = () => end(finishByButton(sessionRef.current, Date.now(), latest.current.roll));

  return (
    <main className={`cooking${reached ? ' is-cooked' : ''}`}>
      <div className="cooking__stage">
        <svg className="ring" viewBox="0 0 300 300" aria-hidden="true">
          <circle className="ring__track" cx="150" cy="150" r={RING_RADIUS} />
          <circle
            className="ring__bar"
            cx="150"
            cy="150"
            r={RING_RADIUS}
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
          />
        </svg>
        <div className="pot" aria-hidden="true">
          <div className="pot__steam">
            <span />
            <span />
            <span />
          </div>
          <div className="pot__lid">
            <div className="pot__knob" />
          </div>
          <div className="pot__body" />
          <div className="pot__flame">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <p className="cooking__time" role="timer" aria-label="Time focused">
        {formatElapsed(elapsed)}
      </p>

      <div className="cooking__status" aria-live="polite">
        {reached ? (
          <>
            <p className="cooking__headline">Cooked! Keep going to upgrade</p>
            <p className="cooking__hint">
              {tier && <span className="tier-badge">{tierName(tier)}</span>}
              {toNext === null ? 'Top tier reached' : `Next tier in ${toNext} min`}
            </p>
          </>
        ) : warning ? (
          <p className="cooking__hint">Your dish is not ready yet. Stop now and it comes out raw?</p>
        ) : (
          <p className="cooking__hint">
            {remainingMin} min to go. Phone face down.
          </p>
        )}
        {awake !== 'pending' && awake !== 'native' && (
          <p className="cooking__tip">Set Auto-Lock to Never while cooking</p>
        )}
      </div>

      <div className="cooking__actions">
        {reached ? (
          <button className="button button--serve" onClick={finish}>
            Serve
          </button>
        ) : (
          <HoldButton holdMs={HOLD_TO_STOP_MS} onHoldStart={() => setWarning(true)} onComplete={finish}>
            Hold to stop
          </HoldButton>
        )}
      </div>
    </main>
  );
}
