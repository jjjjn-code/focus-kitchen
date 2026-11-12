import { useState } from 'react';
import { dishById, dishNameInSentence } from '../data/dishes';
import type { Message } from '../data/messages';
import { formatDuration, weekMinutes } from '../engine/stats';
import { tierName } from '../engine/tiers';
import type { Goal, Session } from '../types';
import DishArt from './DishArt';

interface Props {
  session: Session;
  sessions: Session[];
  goal?: Goal;
  isNew: boolean;
  message: Message;
  onSaveNote: (note: string) => void;
  onDone: (to: 'book' | 'kitchen') => void;
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The reveal for a cooked dish, or the failure screen for a raw or burnt one. */
export default function Result({ session, sessions, goal, isNew, message, onSaveNote, onDone }: Props) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(session.note ?? '');
  const dish = dishById(session.dishId ?? '');
  if (!dish) return null;
  const focused = session.focusedMin ?? 0;
  const name = dishNameInSentence(dish);

  if (session.outcome !== 'cooked') {
    const burnt = session.outcome === 'burnt';
    return (
      <main className="page page--centre result">
        <div className="hero">
          <DishArt dishId={dish.id} state={burnt ? 'burnt' : 'raw'} size={190} />
          <p className="result__eyebrow">{burnt ? 'Burnt' : 'Raw'}</p>
          {burnt ? (
            <>
              <h1>You left the kitchen.</h1>
              <p>Your {name} burnt.</p>
              <p className="muted">{formatDuration(focused)} of focus before you left.</p>
            </>
          ) : (
            <>
              <h1>Your {name} came out raw.</h1>
              <p className="muted">
                {formatDuration(focused)} of {session.targetMin}.
              </p>
            </>
          )}
        </div>
        <button className="button button--primary button--big" onClick={() => onDone('kitchen')}>
          Back to the kitchen
        </button>
      </main>
    );
  }

  const done = () => {
    if (note.trim() !== (session.note ?? '')) onSaveNote(note.trim());
    onDone('book');
  };

  return (
    <main className="page page--centre result">
      <div className="hero">
        <div className="reveal">
          <div className="reveal__dish">
            <DishArt dishId={dish.id} size={200} />
          </div>
          <div className="reveal__lid" aria-hidden="true">
            <span />
          </div>
        </div>

        <div className="reveal__text">
          <p className="result__eyebrow">
            {tierName(dish.tier)} · {capital(dish.rarity)}
            {isNew && <span className="badge">New!</span>}
          </p>
          <h1>{dish.name}</h1>
          <p className="muted">
            {formatDuration(focused)} of focus.{goal && ` For ${goal.title}.`}
            {session.leftKitchen && ' Served when you left the kitchen.'}
          </p>
          <p className="muted">This week: {formatDuration(weekMinutes(sessions, session.startedAt))}</p>
          <p className="result__message">{message.text}</p>
          {message.source && <p className="result__source">{message.source}</p>}
        </div>
      </div>

      {noteOpen ? (
        <textarea
          className="note"
          aria-label="Note"
          placeholder="A favourite line, or what you got done"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
      ) : (
        <button className="link" onClick={() => setNoteOpen(true)}>
          Add a note
        </button>
      )}
      <button className="button button--primary button--big" onClick={done}>
        Add to recipe book
      </button>
    </main>
  );
}
