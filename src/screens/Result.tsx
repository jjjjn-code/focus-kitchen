import { dishById, dishNameInSentence } from '../data/dishes';
import { tierName } from '../engine/tiers';
import { ACTIVITIES, type Session } from '../types';

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
  const activity = ACTIVITIES.find((a) => a.id === session.activity)?.label.toLowerCase() ?? '';
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
            <p>{dish.blurb}</p>
            <p className="muted">
              {minutes(focused)} of {activity}.
              {session.leftKitchen && ' You left the kitchen, so it was served at the tier you had reached.'}
            </p>
          </>
        )}
        {session.outcome === 'raw' && (
          <>
            <p className="result__eyebrow">Raw</p>
            <h1>Your {name} came out raw.</h1>
            <p className="muted">
              You focused for {minutes(focused)} of your {session.targetMin}. Next time, let it cook.
            </p>
          </>
        )}
        {session.outcome === 'burnt' && (
          <>
            <p className="result__eyebrow">Burnt</p>
            <h1>You left the kitchen.</h1>
            <p>Your {name} burnt.</p>
            <p className="muted">
              You focused for {minutes(focused)} before it went wrong. The stove is ready when you are.
            </p>
          </>
        )}
      </div>
      <button className="button button--primary button--big" onClick={onDone}>
        Back to the kitchen
      </button>
    </main>
  );
}
