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
import SlideToStop from './SlideToStop';

const HEARTBEAT_MS = 5000;
const RING_RADIUS = 122;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface Props {
  session: Session;
  graceSeconds: number;
  /** Experiment: try to send a notification the moment the page is hidden. */
  notifyOnLeave: boolean;
  roll: RollContext;
  onEnd: (session: Session) => void;
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Match the iOS status bar to the screen colour while cooking. */
function useThemeColour(colour: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const before = meta.content;
    meta.content = colour;
    return () => {
      meta.content = before;
    };
  }, [colour]);
}

export default function Cooking({ session: initial, graceSeconds, notifyOnLeave, roll, onEnd }: Props) {
  // The session lives in a ref so event handlers always see the latest copy,
  // and every change is written to storage straight away.
  const sessionRef = useRef(initial);
  const [now, setNow] = useState(() => Date.now());
  const [awake, setAwake] = useState<AwakeMode | 'pending'>('pending');
  const [warning, setWarning] = useState(false);
  const ended = useRef(false);
  const latest = useRef({ graceSeconds, notifyOnLeave, roll, onEnd });
  latest.current = { graceSeconds, notifyOnLeave, roll, onEnd };

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
      const { notifyOnLeave, graceSeconds } = latest.current;
      if (notifyOnLeave && 'Notification' in window && Notification.permission === 'granted') {
        void navigator.serviceWorker?.ready
          .then((registration) =>
            registration.showNotification('Focus Kitchen', {
              body: `Your dish is still cooking! Come back within ${graceSeconds} seconds.`,
              tag: 'left-kitchen',
            }),
          )
          .catch(() => {});
      }
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
  const remaining = session.targetMin * 60_000 - elapsed;

  useThemeColour('#EBD3B4');

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
        <div className="cooking__plate" aria-hidden="true" />
        <div className="pot" aria-hidden="true">
          <div className="pot__steam">
            <span />
            <span />
            <span />
          </div>
          <div className="pot__lid">
            <div className="pot__knob" />
          </div>
          <div className="pot__body">
            <div className="pot__face" />
          </div>
          <div className="pot__flame">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* Counts down to the target, then counts up through overtime. */}
      <p className="cooking__time" role="timer" aria-label={reached ? 'Time focused' : 'Time left'}>
        {formatClock(reached ? elapsed : remaining)}
      </p>

      <div className="cooking__status" aria-live="polite">
        {reached ? (
          <>
            <p className="cooking__headline">Cooked! Keep going to upgrade</p>
            <p className="cooking__hint">
              {tier !== null && <span className="tier-badge">{tierName(tier)}</span>}
              {toNext === null ? 'Top tier reached' : `Next tier in ${toNext} min`}
            </p>
          </>
        ) : (
          warning && <p className="cooking__hint">Your dish is not ready yet. Stop now and it comes out raw?</p>
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
          <SlideToStop label="Slide to stop" onSlideStart={() => setWarning(true)} onComplete={finish} />
        )}
      </div>
    </main>
  );
}
