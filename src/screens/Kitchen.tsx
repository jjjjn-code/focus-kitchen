interface Props {
  dishesCooked: number;
  onStart: () => void;
}

export default function Kitchen({ dishesCooked, onStart }: Props) {
  return (
    <main className="page page--centre">
      <img className="logo" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
      <h1>Focus Kitchen</h1>
      <p className="muted">
        {dishesCooked === 0
          ? 'Nothing cooked yet. Your first dish is waiting.'
          : `Dishes cooked so far: ${dishesCooked}`}
      </p>
      <button className="button button--primary button--big" onClick={onStart}>
        Start cooking
      </button>
    </main>
  );
}
