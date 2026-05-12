// ─── Lobby Screen — Create or join a multiplayer room ────────────────────────
import type React from 'react';
import { useState } from 'react';
import { Copy, Check, LogIn, Clock, Lightbulb, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createLobby, joinLobby } from '../lib/multiplayer';
import type { LobbySettings } from '../lib/multiplayer';

interface LobbyScreenProps {
  onJoinLobby: (lobbyCode: string) => void;
}

const DEFAULT_SETTINGS: LobbySettings = {
  timeLimitSeconds: null,
  allowHints: true,
  allowUndo: true,
  hintsPerGame: 3,
  mistakeLimit: 0,
};

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No limit', value: null },
  { label: '5 min',    value: 300  },
  { label: '10 min',   value: 600  },
  { label: '15 min',   value: 900  },
  { label: '30 min',   value: 1800 },
];

const MISTAKE_OPTIONS: { label: string; value: number }[] = [
  { label: 'No limit', value: 0 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onJoinLobby }) => {
  const { user, displayName } = useAuth();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [settings, setSettings] = useState<LobbySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const effectiveName = displayName || 'Anonymous';

  const handleCreate = async () => {
    if (!user) { setError('Not authenticated yet — wait a moment and try again'); return; }
    setLoading(true);
    setError('');
    try {
      const lobby = await createLobby(user.id, effectiveName, settings);
      if (!lobby) { setError('Failed to create lobby — check browser console for details'); return; }
      setCreatedCode(lobby.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    if (createdCode) onJoinLobby(createdCode);
  };

  const handleJoin = async () => {
    if (!user) { setError('Not authenticated yet — wait a moment and try again'); return; }
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setError('Enter the full 6-character room code'); return; }
    setLoading(true);
    setError('');
    try {
      const lobby = await joinLobby(code, user.id, effectiveName);
      if (!lobby) { setError('Room not found or game already started'); return; }
      onJoinLobby(lobby.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen">
      <div className="screen-inner">

        <header className="page-header">
          <div>
            <h1 className="page-title">Multiplayer</h1>
            <p className="page-subtitle">Race friends on the same puzzle in real time.</p>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="lobby-tabs">
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`lobby-tab${tab === t ? ' is-active' : ''}`}
              onClick={() => { setTab(t); setError(''); setCreatedCode(null); }}
            >
              {t === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="lobby-banner-error">
            {error}
          </div>
        )}

        {/* ══ CREATE TAB ══ */}
        {tab === 'create' && !createdCode && (
          <>
            {/* Time limit */}
            <div className="section-head">
              <span className="section-head-title"><Clock size={12} className="lobby-section-icon" />Time Limit</span>
            </div>
            <div className="lobby-chip-row">
              {TIME_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, timeLimitSeconds: value }))}
                  className={settings.timeLimitSeconds === value ? 'primary-button' : 'ghost-button'}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mistake limit */}
            <div className="section-head">
              <span className="section-head-title">Mistake Limit</span>
            </div>
            <div className="lobby-chip-row">
              {MISTAKE_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, mistakeLimit: value }))}
                  className={settings.mistakeLimit === value ? 'primary-button' : 'ghost-button'}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="section-head">
              <span className="section-head-title">Allowed Features</span>
            </div>
            <div className="lobby-settings">
              {[
                { key: 'allowHints' as const, Icon: Lightbulb, label: 'Hints', sub: `${settings.hintsPerGame} per player` },
                { key: 'allowUndo'  as const, Icon: RotateCcw,  label: 'Undo',  sub: 'Take back last move' },
              ].map(({ key, Icon, label, sub }, i, arr) => (
                <div key={key}>
                  <div className="lobby-settings-row">
                    <div className="lobby-settings-copy">
                      <Icon size={16} className="lobby-settings-copy" style={{ color: 'var(--muted)' }} />
                      <div className="lobby-settings-copy-inner">
                        <div className="lobby-settings-title">{label}</div>
                        <div className="lobby-settings-sub">{sub}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`lobby-toggle${settings[key] ? ' is-on' : ''}`}
                      onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                      aria-label={`Toggle ${label}`}
                    >
                      <span className="lobby-toggle-knob" />
                    </button>
                  </div>
                  {key === 'allowHints' && settings.allowHints && (
                    <div className="lobby-hint-row">
                      <span className="lobby-hint-label">Per player:</span>
                      {[1, 2, 3, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`lobby-stepper${settings.hintsPerGame === n ? ' is-active' : ''}`}
                          onClick={() => setSettings((s) => ({ ...s, hintsPerGame: n }))}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--line)', margin: '0 18px' }} />}
                </div>
              ))}
            </div>

            <button type="button" className="primary-button" onClick={handleCreate} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating room…' : 'Create Room'}
            </button>
          </>
        )}

        {/* ── Room created — show code ── */}
        {tab === 'create' && createdCode && (
          <div className="lobby-created">
            <p className="lobby-created-label">Room created — share this code</p>
            <div className="lobby-code-row">
              <span className="lobby-code-text">{createdCode}</span>
              <button type="button" onClick={handleCopy} className="lobby-icon-btn">
                {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
              </button>
            </div>

            <p className="lobby-created-hint">
              Share this code with friends. Once they've joined, enter the room to pick difficulty and start.
            </p>

            <button type="button" className="primary-button" onClick={handleEnterRoom} style={{ width: '100%' }}>
              Enter Room →
            </button>
            <button type="button" onClick={() => setCreatedCode(null)} className="lobby-text-btn">
              ← Change settings
            </button>
          </div>
        )}

        {/* ══ JOIN TAB ══ */}
        {tab === 'join' && (
          <>
            <div className="section-head">
              <span className="section-head-title">Enter Room Code</span>
            </div>
            <div className="lobby-join-panel">
              <p className="lobby-join-lead">
                Ask the room host for the 6-character code, then enter it below.
              </p>
              <input
                type="text"
                placeholder="A B C 1 2 3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                className="lobby-code-input"
                maxLength={6}
              />
            </div>
            <button type="button" className="primary-button" onClick={handleJoin} disabled={loading || joinCode.length < 6} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LogIn size={16} />
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </>
        )}

        {/* ── How it works ── */}
        {!createdCode && (
          <>
            <div className="section-head lobby-howto">
              <span className="section-head-title">How it works</span>
            </div>
            <div className="lobby-howto-list">
              {[
                { n: '1', text: 'Host creates a room and gets a 6-letter code' },
                { n: '2', text: 'Friends join using that code in the Join tab' },
                { n: '3', text: 'Host picks difficulty and starts — everyone plays the same puzzle simultaneously' },
              ].map(({ n, text }) => (
                <div key={n} className="lobby-howto-row">
                  <div className="lobby-howto-num">{n}</div>
                  <p className="lobby-howto-text">{text}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
};
