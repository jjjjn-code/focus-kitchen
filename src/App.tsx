import { APP_NAME } from './appInfo';

export default function App() {
  return (
    <main className="kitchen">
      <img className="kitchen__pot" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
      <h1>{APP_NAME}</h1>
      <p>The kitchen is being set up. Cooking starts soon.</p>
    </main>
  );
}
