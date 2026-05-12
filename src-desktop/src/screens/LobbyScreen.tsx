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
};

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No limit', value: null },
  { label: '5 min',    value: 300  },
  { label: '10 min',   value: 600  },
  { label: '15 min',   value: 900  },
  { label: '30 min',   value: 1800 },
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
      <div className="screen-inner" style={{ maxWidth: 580 }}>

        <header className="page-header">
          <div>
            <h1 className="page-title">Multiplayer</h1>
            <p className="page-subtitle">Race friends on the same puzzle in real time.</p>
          </div>
        </header>

        {/* ── Tab switcher ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 32, background: 'var(--surface-container)', borderRadius: 10, padding: 4 }}>
          {(['create', 'join'] as const).map((t) => (
            <button key={t} type="button"
              onClick={() => { setTab(t); setError(''); setCreatedCode(null); }}
              style={{ padding: '9px 0', borderRadius: 8, border: 'none', background: tab === t ? 'var(--surface)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 150ms, color 150ms', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {t === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--red-wash)', color: 'var(--red)', fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(192,24,15,0.3)' }}>
            {error}
          </div>
        )}

        {/* ══ CREATE TAB ══ */}
        {tab === 'create' && !createdCode && (
          <>
            {/* Time limit */}
            <div className="section-head">
              <span className="section-head-title"><Clock size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />Time Limit</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {TIME_OPTIONS.map(({ label, value }) => (
                <button key={label} type="button"
                  onClick={() => setSettings((s) => ({ ...s, timeLimitSeconds: value }))}
                  className={settings.timeLimitSeconds === value ? 'primary-button' : 'ghost-button'}
                  style={{ minHeight: 36, padding: '0 16px', fontSize: 13 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="section-head">
              <span className="section-head-title">Allowed Features</span>
            </div>
            <div className="card" style={{ padding: '4px 0', marginBottom: 32 }}>
              {[
                { key: 'allowHints' as const, Icon: Lightbulb, label: 'Hints', sub: `${settings.hintsPerGame} per player` },
                { key: 'allowUndo'  as const, Icon: RotateCcw,  label: 'Undo',  sub: 'Take back last move' },
              ].map(({ key, Icon, label, sub }, i, arr) => (
                <div key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon size={16} color="var(--muted)" strokeWidth={2} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                      aria-label={`Toggle ${label}`}
                      style={{ width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: settings[key] ? 'var(--ink)' : 'var(--line)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <span style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: settings[key] ? 21 : 3 }} />
                    </button>
                  </div>
                  {key === 'allowHints' && settings.allowHints && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 14px 48px' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 4 }}>Per player:</span>
                      {[1, 2, 3, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setSettings((s) => ({ ...s, hintsPerGame: n }))}
                          style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', borderColor: settings.hintsPerGame === n ? 'var(--ink)' : 'var(--line)', background: settings.hintsPerGame === n ? 'var(--ink)' : 'transparent', color: settings.hintsPerGame === n ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--line)', margin: '0 20px' }} />}
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
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Room created — share this code</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '20px 32px', marginBottom: 28 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 42, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--ink)' }}>
                {createdCode}
              </span>
              <button type="button" onClick={handleCopy}
                style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-container)', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.5 }}>
              Share this code with friends. Once they've joined, enter the room to pick difficulty and start.
            </p>

            <button type="button" className="primary-button" onClick={handleEnterRoom} style={{ width: '100%' }}>
              Enter Room →
            </button>
            <button type="button" onClick={() => setCreatedCode(null)}
              style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Ask the room host for the 6-character code, then enter it below.
              </p>
              <input
                type="text"
                placeholder="A B C 1 2 3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                style={{ width: '100%', padding: '16px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 30, fontWeight: 800, letterSpacing: '0.25em', textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace', transition: 'border-color 150ms' }}
                maxLength={6}
              />
            </div>
            <button type="button" className="primary-button" onClick={handleJoin} disabled={loading || joinCode.length < 6} style={{ width: '100%' }}>
              <LogIn size={16} />
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </>
        )}

        {/* ── How it works ── */}
        {!createdCode && (
          <>
            <div className="section-head" style={{ marginTop: 40 }}>
              <span className="section-head-title">How it works</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { n: '1', text: 'Host creates a room and gets a 6-letter code' },
                { n: '2', text: 'Friends join using that code in the Join tab' },
                { n: '3', text: 'Host picks difficulty and starts — everyone plays the same puzzle simultaneously' },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{n}</div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, paddingTop: 3 }}>{text}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
};
