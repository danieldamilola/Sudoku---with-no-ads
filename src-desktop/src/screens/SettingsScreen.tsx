import { useState } from 'react';
import { useStore } from '../store/useStore';

const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
  <button className={`switch ${value ? 'on' : ''}`} type="button" onClick={onChange} aria-pressed={value}>
    <span className="switch-dot" />
  </button>
);

const Row: React.FC<{ title: string; detail?: string; children: React.ReactNode; danger?: boolean }> = ({ title, detail, children, danger }) => (
  <div className="settings-row">
    <div>
      <div style={{ fontWeight: 650, color: danger ? 'var(--red)' : 'var(--text)' }}>{title}</div>
      {detail ? <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>{detail}</div> : null}
    </div>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <div className="eyebrow" style={{ marginBottom: 10 }}>{title}</div>
    <div className="settings-section card">{children}</div>
  </section>
);

export const SettingsScreen: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetStats = useStore((s) => s.resetStats);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key: keyof typeof settings, value: boolean | number) => {
    updateSettings({ [key]: value } as Partial<typeof settings>);
  };

  return (
    <main className="screen">
      <div className="screen-inner">
        <header className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Personalize your puzzle solving experience.</p>
          </div>
        </header>

        <div className="settings-grid">
          <div style={{ display: 'grid', gap: 18 }}>
            <Section title="Appearance">
              <Row title="Color theme" detail="Choose a calm light board or the new ink dark mode.">
                <div className="segmented">
                  {[
                    { label: 'Light', value: false },
                    { label: 'Dark', value: true },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={settings.darkMode === item.value ? 'active' : ''}
                      type="button"
                      onClick={() => set('darkMode', item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Row>
            </Section>

            <Section title="Gameplay">
              <Row title="Mistake limit" detail="Stop the game after too many wrong entries.">
                <div className="segmented">
                  {[
                    { label: 'Off', value: 0 },
                    { label: '3', value: 3 },
                    { label: '5', value: 5 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={settings.mistakeLimit === item.value ? 'active' : ''}
                      type="button"
                      onClick={() => set('mistakeLimit', item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row title="Show mistakes" detail="Mark incorrect entries as soon as they are placed.">
                <Toggle value={settings.showMistakes} onChange={() => set('showMistakes', !settings.showMistakes)} />
              </Row>
              <Row title="Highlight identical numbers" detail="Show matching digits when a cell is selected.">
                <Toggle value={settings.highlightDuplicates} onChange={() => set('highlightDuplicates', !settings.highlightDuplicates)} />
              </Row>
              <Row title="Auto-remove notes" detail="Remove a placed digit from nearby pencil marks.">
                <Toggle value={settings.autoRemoveNotes} onChange={() => set('autoRemoveNotes', !settings.autoRemoveNotes)} />
              </Row>
            </Section>

            <Section title="Timing">
              <Row title="Show timer">
                <Toggle value={settings.showTimer} onChange={() => set('showTimer', !settings.showTimer)} />
              </Row>
            </Section>
          </div>

          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <Section title="Data">
              <Row
                title="Reset statistics"
                detail={confirmReset ? 'Click reset again to confirm.' : 'Clear solved counts, streaks, and history.'}
                danger
              >
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    if (confirmReset) {
                      resetStats();
                      setConfirmReset(false);
                    } else {
                      setConfirmReset(true);
                    }
                  }}
                  style={{ color: 'var(--red)' }}
                >
                  Reset
                </button>
              </Row>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
};
