import { dishById, dishNameInSentence } from '../data/dishes';
import { tierName } from '../engine/tiers';
import type { Session } from '../types';

interface Props {
  session: Session;
  onDone: () => void;
}

function minutes(n: number): string {
  return n === 1 ? '1 minute' : `${n} minutes`;
}

/** Plain result screen for M1. The lid-lift reveal and dish art arrive in M2 and M3. */
export default function Result({ session, onDone }: Props) {
  const dish = dishById(session.dishId ?? '');
  const focused = session.focusedMin ?? 0;
  if (!dish) return null;
  const name = dishNameInSentence(dish);

  return (
    <main className="page page--centre">
      <div className={`card result result--${session.outcome}`}>
        {session.outcome === 'cooked' && (
          <>
            <p className="result__eyebrow">
              {tierName(dish.tier)} · {dish.rarity}
            </p>
            <h1>{dish.name}</h1>
            <p className="muted">
              {minutes(focused)} of focus.
              {session.leftKitchen && ' Served when you left the kitchen.'}
            </p>
          </>
        )}
        {session.outcome === 'raw' && (
          <>
            <p className="result__eyebrow">Raw</p>
            <h1>Your {name} came out raw.</h1>
            <p className="muted">
              {minutes(focused)} of {session.targetMin}.
            </p>
          </>
        )}
        {session.outcome === 'burnt' && (
          <>
            <p className="result__eyebrow">Burnt</p>
            <h1>You left the kitchen.</h1>
            <p>Your {name} burnt.</p>
            <p className="muted">{minutes(focused)} of focus before you left.</p>
          </>
        )}
      </div>
      <button className="button button--primary button--big" onClick={onDone}>
        Back to the kitchen
      </button>
    </main>
  );
}
