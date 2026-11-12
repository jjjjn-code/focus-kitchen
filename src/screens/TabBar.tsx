export type Tab = 'kitchen' | 'book' | 'goals' | 'stats';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'kitchen', label: 'Kitchen', icon: 'M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM3 11h18M10 7h4M12 7v-2' },
  { id: 'book', label: 'Recipe book', icon: 'M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zM5 17a2 2 0 0 1 2-2h11M9 8h5' },
  { id: 'goals', label: 'Goals', icon: 'M6 21V4M6 5h11l-2.5 3.5L17 12H6' },
  { id: 'stats', label: 'Stats', icon: 'M5 20V11M12 20V5M19 20v-6' },
];

interface Props {
  current: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabBar({ current, onChange }: Props) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className="tabbar__tab"
          aria-current={current === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d={tab.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button className="back" onClick={onBack} aria-label="Back">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
