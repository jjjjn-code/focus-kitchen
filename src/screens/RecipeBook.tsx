import { DISHES, dishById, dishNameInSentence } from '../data/dishes';
import { cookCounts, totals } from '../engine/stats';
import { TIERS } from '../engine/tiers';
import type { Goal, Session } from '../types';
import DishArt from './DishArt';
import { BackButton } from './TabBar';

const dateText = (ts: number) =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

interface BookProps {
  sessions: Session[];
  onOpenDish: (dishId: string) => void;
  onOpenMishaps: () => void;
}

export default function RecipeBook({ sessions, onOpenDish, onOpenMishaps }: BookProps) {
  const counts = cookCounts(sessions);
  const { raw, burnt } = totals(sessions);

  return (
    <main className="page page--tabbed">
      <header className="page__header">
        <h1>Recipe book</h1>
        <p className="muted">
          {counts.size} of {DISHES.length}
        </p>
      </header>

      {TIERS.map(({ tier, name }) => (
        <section key={tier}>
          <h2>{name}</h2>
          <div className="dish-grid">
            {DISHES.filter((d) => d.tier === tier).map((dish) => {
              const count = counts.get(dish.id) ?? 0;
              return count > 0 ? (
                <button key={dish.id} className="dish-tile" onClick={() => onOpenDish(dish.id)}>
                  <DishArt dishId={dish.id} size={84} />
                  <span className="dish-tile__name">{dish.name}</span>
                  <span className="dish-tile__count">x{count}</span>
                </button>
              ) : (
                <div key={dish.id} className="dish-tile dish-tile--locked" aria-label="Not cooked yet">
                  <DishArt dishId={dish.id} state="silhouette" size={84} />
                  <span className="dish-tile__name">???</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <button className="row-link" onClick={onOpenMishaps}>
        Kitchen mishaps
        <span className="muted">{raw + burnt}</span>
      </button>
    </main>
  );
}

interface CardProps {
  dishId: string;
  sessions: Session[];
  goals: Goal[];
  onBack: () => void;
}

export function DishCard({ dishId, sessions, goals, onBack }: CardProps) {
  const dish = dishById(dishId);
  if (!dish) return null;
  const cooks = sessions.filter((s) => s.outcome === 'cooked' && s.dishId === dishId).reverse();

  return (
    <main className="page">
      <BackButton onBack={onBack} />
      <div className="dish-card__top">
        <DishArt dishId={dish.id} size={180} />
        <p className="result__eyebrow">
          {TIERS.find((t) => t.tier === dish.tier)!.name} · {dish.rarity}
        </p>
        <h1>{dish.name}</h1>
        <p className="muted">{dish.blurb}</p>
      </div>
      <ul className="log">
        {cooks.map((s) => {
          const goal = goals.find((g) => g.id === s.goalId);
          return (
            <li key={s.id}>
              <span className="log__main">
                {dateText(s.startedAt)}
                <span className="muted">
                  {s.focusedMin} min{goal && ` · ${goal.title}`}
                </span>
              </span>
              {s.note && <span className="log__note">{s.note}</span>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

interface MishapsProps {
  sessions: Session[];
  onBack: () => void;
}

export function Mishaps({ sessions, onBack }: MishapsProps) {
  const mishaps = sessions.filter((s) => s.outcome === 'raw' || s.outcome === 'burnt').reverse();
  const { raw, burnt } = totals(sessions);

  return (
    <main className="page">
      <BackButton onBack={onBack} />
      <header className="page__header">
        <h1>Kitchen mishaps</h1>
        <p className="muted">
          {raw} raw · {burnt} burnt
        </p>
      </header>
      {mishaps.length === 0 ? (
        <p className="muted empty">Nothing here. A spotless kitchen.</p>
      ) : (
        <ul className="log">
          {mishaps.map((s) => {
            const dish = dishById(s.dishId ?? '');
            if (!dish) return null;
            return (
              <li key={s.id} className="log__mishap">
                <DishArt dishId={dish.id} state={s.outcome === 'burnt' ? 'burnt' : 'raw'} size={52} />
                <span className="log__main">
                  {s.outcome === 'burnt' ? 'Burnt' : 'Raw'} {dishNameInSentence(dish)}
                  <span className="muted">
                    {dateText(s.startedAt)} · {s.focusedMin} of {s.targetMin} min
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
