import { useRef, useState } from 'react';
import { exportBackup, importBackup, isBackup } from '../storage';
import { GRACE_OPTIONS, type Settings } from '../types';
import { BackButton } from './TabBar';

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onImported: () => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, onChange, onImported, onBack }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  const toggleNotify = async () => {
    if (settings.notifyExperiment) {
      onChange({ ...settings, notifyExperiment: false });
      return;
    }
    if (!('Notification' in window)) {
      setStatus('Notifications are not available here. Add the app to the Home Screen first.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('Notifications were not allowed.');
      return;
    }
    onChange({ ...settings, notifyExperiment: true });
  };

  const download = async () => {
    const backup = await exportBackup(Date.now());
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-kitchen-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${backup.sessions.length} sessions.`);
  };

  const upload = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackup(parsed)) throw new Error('Not a backup');
      if (!window.confirm(`Replace everything on this phone with the ${parsed.sessions.length} sessions in this file?`)) return;
      await importBackup(parsed);
      onImported();
      setStatus(`Imported ${parsed.sessions.length} sessions.`);
    } catch {
      setStatus('That file is not a Focus Kitchen backup.');
    }
  };

  return (
    <main className="page">
      <BackButton onBack={onBack} />
      <header className="page__header">
        <h1>Settings</h1>
      </header>

      <section>
        <h2 id="grace-label">Grace period</h2>
        <div className="chips" role="radiogroup" aria-labelledby="grace-label">
          {GRACE_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              role="radio"
              aria-checked={settings.graceSeconds === seconds}
              className="chip"
              onClick={() => onChange({ ...settings, graceSeconds: seconds })}
            >
              {seconds} seconds
            </button>
          ))}
        </div>
        <p className="muted small">How long you can be away before the dish burns.</p>
      </section>

      <section>
        <h2>Experiment</h2>
        <button className="row-link" role="switch" aria-checked={settings.notifyExperiment} onClick={() => void toggleNotify()}>
          Warn me when I leave
          <span className={`switch${settings.notifyExperiment ? ' is-on' : ''}`} aria-hidden="true" />
        </button>
        <p className="muted small">Tries to send a notification the moment you leave. It may not be reliable.</p>
      </section>

      <section>
        <h2>Your data</h2>
        <button className="row-link" onClick={() => void download()}>
          Export data
        </button>
        <button className="row-link" onClick={() => fileInput.current?.click()}>
          Import data
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void upload(file);
          }}
        />
        <p className="muted small" role="status">
          {status}
        </p>
      </section>
    </main>
  );
}
