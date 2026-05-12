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
      <div className="screen-inner">

        <header className="page-header">
          <div>
            <h1 className="page-title">Multiplayer</h1>
            <p className="page-subtitle">Race friends on the same puzzle in real time.</p>
          </div>
        </header>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 40, background: 'var(--surface-container)', borderRadius: 12, padding: 5 }}>
          {(['create', 'join'] as const).map((t) => (
            <button key={t} type="button"
              onClick={() => { setTab(t); setError(''); setCreatedCode(null); }}
              style={{ padding: '11px 0', borderRadius: 9, border: 'none', background: tab === t ? 'var(--surface)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {t === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div style={{ padding: '14px 18px', borderRadius: 10, background: 'var(--red-wash)', color: 'var(--red)', fontSize: 13, fontWeight: 600, marginBottom: 36, border: '1px solid rgba(192,24,15,0.3)' }}>
            {error}
          </div>
        )}

        {/* ══ CREATE TAB ══ */}
        {tab === 'create' && !createdCode && (
          <>
            {/* Time limit */}
            <div className="section-head">
              <span className="section-head-title"><Clock size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />Time Limit</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
              {TIME_OPTIONS.map(({ label, value }) => (
                <button key={label} type="button"
                  onClick={() => setSettings((s) => ({ ...s, timeLimitSeconds: value }))}
                  className={settings.timeLimitSeconds === value ? 'primary-button' : 'ghost-button'}
                  style={{ minHeight: 40, padding: '0 18px', fontSize: 13, borderRadius: 9, transition: 'all 0.2s ease' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="section-head">
              <span className="section-head-title">Allowed Features</span>
            </div>
            <div className="card" style={{ padding: '6px 0', marginBottom: 40 }}>
              {[
                { key: 'allowHints' as const, Icon: Lightbulb, label: 'Hints', sub: `${settings.hintsPerGame} per player` },
                { key: 'allowUndo'  as const, Icon: RotateCcw,  label: 'Undo',  sub: 'Take back last move' },
              ].map(({ key, Icon, label, sub }, i, arr) => (
                <div key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon size={16} color="var(--muted)" strokeWidth={2} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                      aria-label={`Toggle ${label}`}
                      style={{ width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', background: settings[key] ? 'var(--ink)' : 'var(--line)', position: 'relative', transition: 'background 0.25s ease', flexShrink: 0, boxShadow: settings[key] ? '0 2px 6px rgba(0,0,0,0.15)' : 'none' }}>
                      <span style={{ position: 'absolute', top: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.25s ease', left: settings[key] ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                  {key === 'allowHints' && settings.allowHints && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 16px 48px' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 4 }}>Per player:</span>
                      {[1, 2, 3, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setSettings((s) => ({ ...s, hintsPerGame: n }))} style={{ width: 38, height: 38, borderRadius: 9, border: '1.5px solid', borderColor: settings.hintsPerGame === n ? 'var(--ink)' : 'var(--line)', background: settings.hintsPerGame === n ? 'var(--ink)' : 'transparent', color: settings.hintsPerGame === n ? '#fff' : 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--line)', margin: '0 20px' }} />}
                </div>
              ))}
            </div>

            <button type="button" className="primary-button" onClick={handleCreate} disabled={loading} style={{ width: '100%', height: 48, borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
              {loading ? 'Creating room…' : 'Create Room'}
            </button>
          </>
        )}

        {/* ── Room created — show code ── */}
        {tab === 'create' && createdCode && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Room created — share this code</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 40px', marginBottom: 32 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 42, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--ink)' }}>
                {createdCode}
              </span>
              <button type="button" onClick={handleCopy}
                style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-container)', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 36, lineHeight: 1.5 }}>
              Share this code with friends. Once they've joined, enter the room to pick difficulty and start.
            </p>

            <button type="button" className="primary-button" onClick={handleEnterRoom} style={{ width: '100%' }}>
              Enter Room →
            </button>
            <button type="button" onClick={() => setCreatedCode(null)}
              style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
            <div className="card" style={{ padding: 28, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Ask the room host for the 6-character code, then enter it below.
              </p>
              <input
                type="text"
                placeholder="A B C 1 2 3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                style={{ width: '100%', padding: '20px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 32, fontWeight: 800, letterSpacing: '0.25em', textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace', transition: 'border-color 150ms' }}
                maxLength={6}
              />
            </div>
            <button type="button" className="primary-button" onClick={handleJoin} disabled={loading || joinCode.length < 6} style={{ width: '100%', height: 48, borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
              <LogIn size={16} />
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </>
        )}

        {/* ── How it works ── */}
        {!createdCode && (
          <>
            <div className="section-head" style={{ marginTop: 48 }}>
              <span className="section-head-title">How it works</span>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { n: '1', text: 'Host creates a room and gets a 6-letter code' },
                  { n: '2', text: 'Friends join using that code in the Join tab' },
                  { n: '3', text: 'Host picks difficulty and starts — everyone plays the same puzzle simultaneously' },
                ].map(({ n, text }, idx, arr) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: idx < arr.length - 1 ? 20 : 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{n}</div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, paddingTop: 5 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
};
