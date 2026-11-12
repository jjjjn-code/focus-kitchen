interface Props {
  dishesCooked: number;
  onStart: () => void;
}

export default function Kitchen({ dishesCooked, onStart }: Props) {
  return (
    <main className="page page--centre">
      <div className="hero">
        <img className="logo" src={`${import.meta.env.BASE_URL}icon.svg`} alt="Focus Kitchen" />
        {dishesCooked > 0 && (
          <p className="muted">{dishesCooked === 1 ? '1 dish cooked' : `${dishesCooked} dishes cooked`}</p>
        )}
      </div>
      <button className="button button--primary button--big" onClick={onStart}>
        Start cooking
      </button>
    </main>
  );
}
