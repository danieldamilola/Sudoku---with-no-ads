// ─── Multiplayer Game Screen ──────────────────────────────────────────────────
import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Crown, Eraser, Lightbulb, RotateCcw } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import { joinLobby, startLobbyGame, pushProgress, subscribeLobby } from '../lib/multiplayer';
import type { Lobby, LobbyPlayer } from '../lib/multiplayer';
import { SudokuGenerator, SudokuValidator } from '../utils/sudoku';
import type { SudokuCell, Difficulty } from '../types';
import { formatTime } from '../utils/time';

interface MultiplayerGameScreenProps {
  lobbyCode: string;
  onLeave: () => void;
}

type Phase = 'waiting' | 'playing' | 'finished';

export const MultiplayerGameScreen: React.FC<MultiplayerGameScreenProps> = ({ lobbyCode, onLeave }) => {
  const { user, displayName } = useAuth();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [cells, setCells] = useState<SudokuCell[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [hostDifficulty, setHostDifficulty] = useState<Difficulty>('skill');
  const [animCell, setAnimCell] = useState<{ idx: number; cls: string } | null>(null);
  const [cellHistory, setCellHistory] = useState<SudokuCell[][]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  // Refs for stale-closure–safe access inside effects/timers
  const lobbyRef = useRef<typeof lobby>(null);
  const userRef  = useRef<typeof user>(null);
  const cellsRef = useRef(cells);
  const mistakesRef = useRef(mistakes);
  const hintsUsedRef = useRef(hintsUsed);
  const phaseRef = useRef<Phase>('waiting');
  useEffect(() => { lobbyRef.current = lobby; }, [lobby]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { mistakesRef.current = mistakes; }, [mistakes]);
  useEffect(() => { hintsUsedRef.current = hintsUsed; }, [hintsUsed]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const isHost = lobby?.hostId === user?.id;
  const myPlayer = lobby?.players.find((p) => p.userId === user?.id);
  const settings = lobby?.settings ?? { timeLimitSeconds: null, allowHints: true, allowUndo: true, hintsPerGame: 3 };

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);
  useEffect(() => () => stopTimer(), [stopTimer]);

  // Load lobby on mount
  useEffect(() => {
    if (!user) return;
    joinLobby(lobbyCode, user.id, displayName || 'Anonymous').then((l) => {
      if (!l) { setError('Could not connect to room.'); return; }
      setLobby(l);
      if (l.status === 'playing' && l.puzzle) {
        setCells(l.puzzle);
        setSolution(l.solution ?? []);
        setPhase('playing');
        startTimer();
      }
      if (l.status === 'finished') setPhase('finished');
    });
  }, [lobbyCode, user, displayName, startTimer]);

  // Subscribe to lobby changes — only re-subscribe when lobby ID changes, not on phase changes
  useEffect(() => {
    if (!lobby) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    const unsub = subscribeLobby(lobby.id, (updated) => {
      setLobby(updated);
      // Read phase from ref to avoid stale closure without re-subscribing
      if (updated.status === 'playing' && updated.puzzle && phaseRef.current !== 'playing') {
        setCells(updated.puzzle);
        setSolution(updated.solution ?? []);
        setPhase('playing');
        startTimer();
      }
      if (updated.status === 'finished') {
        setPhase('finished');
        stopTimer();
      }
    });
    unsubRef.current = unsub;
    return () => { unsub(); unsubRef.current = null; };
  }, [lobby?.id, startTimer, stopTimer]);

  // Time limit check — uses refs so no stale-closure issues with lobby/user/cells/mistakes
  useEffect(() => {
    if (phase !== 'playing' || !settings.timeLimitSeconds) return;
    if (elapsed >= settings.timeLimitSeconds && !finished) {
      stopTimer();
      setFinished(true);
      const l = lobbyRef.current;
      const u = userRef.current;
      if (l && u) {
        const filled = cellsRef.current.filter(c => c.value !== null).length;
        pushProgress(l.id, u.id, filled, mistakesRef.current, hintsUsedRef.current, true);
      }
    }
  }, [elapsed, settings.timeLimitSeconds, phase, finished, stopTimer]);

  const handleStart = async () => {
    if (!lobby || !isHost) return;
    const { cells: puzzle, solution: sol } = SudokuGenerator.generatePuzzle(hostDifficulty);
    await startLobbyGame(lobby.id, puzzle, sol, hostDifficulty);
  };

  const handleCellClick = (idx: number) => {
    if (phase !== 'playing' || finished) return;
    setSelected(idx);
  };

  const handleNumber = async (num: number) => {
    if (selected === null || phase !== 'playing' || finished || !lobby || !user) return;
    const cell = cells[selected];
    if (cell.isGiven) return;

    const isCorrect = solution[selected] === num;
    const wasAlreadyWrong = cell.isError;
    const updatedCells = [...cells];
    updatedCells[selected] = { ...cell, value: num, isError: !isCorrect };
    setCellHistory((h) => [...h, cells].slice(-30));
    setCells(updatedCells);

    const newMistakes = (!isCorrect && !wasAlreadyWrong) ? mistakes + 1 : mistakes;
    if (newMistakes !== mistakes) setMistakes(newMistakes);

    const filled = updatedCells.filter(c => c.value !== null && !c.isError).length;
    const done = SudokuValidator.isBoardComplete(updatedCells, solution);

    if (done) {
      stopTimer();
      setFinished(true);
      await pushProgress(lobby.id, user.id, 81, newMistakes, hintsUsed, true);
    } else {
      await pushProgress(lobby.id, user.id, filled, newMistakes, hintsUsed, false);
    }
  };

  const handleUndo = useCallback(async () => {
    if (phase !== 'playing' || finished || !lobby || !user) return;
    setCellHistory((hist) => {
      if (hist.length === 0) return hist;
      const prev = hist[hist.length - 1];
      setCells(prev);
      const filled = prev.filter(c => c.value !== null && !c.isError).length;
      pushProgress(lobby.id, user.id, filled, mistakes, hintsUsed, false);
      return hist.slice(0, -1);
    });
  }, [phase, finished, lobby, user, mistakes, hintsUsed]);

  const prevCellsRef = useRef(cells);
  useEffect(() => {
    if (selected === null) { prevCellsRef.current = cells; return; }
    const prev = prevCellsRef.current[selected];
    const curr = cells[selected];
    if (prev && curr && prev.value !== curr.value && curr.value !== null) {
      const cls = curr.isError ? 'cell-shake' : 'cell-pop';
      setAnimCell({ idx: selected, cls });
      const t = setTimeout(() => setAnimCell(null), 250);
      prevCellsRef.current = cells;
      return () => clearTimeout(t);
    }
    prevCellsRef.current = cells;
  }, [cells, selected]);

  const handleErase = async () => {
    if (selected === null || phase !== 'playing' || finished || !lobby || !user) return;
    const cell = cells[selected];
    if (cell.isGiven || cell.value === null) return;
    setCellHistory((h) => [...h, cells].slice(-30));
    const updatedCells = [...cells];
    updatedCells[selected] = { ...cell, value: null, isError: false };
    setCells(updatedCells);
    const filled = updatedCells.filter(c => c.value !== null && !c.isError).length;
    await pushProgress(lobby.id, user.id, filled, mistakes, hintsUsed, false);
  };

  const handleHint = async () => {
    if (selected === null || !settings.allowHints || hintsUsed >= settings.hintsPerGame || !lobby || !user || finished) return;
    const cell = cells[selected];
    if (cell.isGiven || cell.value !== null) return;
    const correct = solution[selected];
    const updatedCells = [...cells];
    updatedCells[selected] = { ...cell, value: correct, isError: false };
    const newHints = hintsUsed + 1;
    setHintsUsed(newHints);
    setCells(updatedCells);
    const progress = updatedCells.filter(c => c.value !== null).length;
    const done = SudokuValidator.isBoardComplete(updatedCells, solution);
    if (done) { stopTimer(); setFinished(true); }
    await pushProgress(lobby.id, user.id, progress, mistakes, newHints, done);
  };


  // Keyboard handler for the board
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing' || finished) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) { e.preventDefault(); handleNumber(n); }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleErase(); }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleUndo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, finished, handleNumber, handleErase, handleUndo]);

  const DIFF_ACCENT: Record<string, string> = {
    beginner: '#1a7a40', skill: '#3650d4', hard: '#a04f00',
    advanced: '#c0180f', expert: '#c0180f', master: '#6b30d4',
  };
  const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'skill', 'hard', 'advanced', 'expert', 'master'];
  // Always read from DB — ensures host and all joiners show the same difficulty
  const activeDifficulty = (lobby?.settings.difficulty ?? (phase === 'waiting' ? hostDifficulty : 'skill')) as Difficulty;
  const accentColor = DIFF_ACCENT[activeDifficulty] ?? 'var(--blue)';
  const hintsLeft = Math.max(0, settings.hintsPerGame - hintsUsed);

  const cellClass = (idx: number) => {
    const cell = cells[idx];
    const cls = ['sudoku-cell'];
    if (cell.isGiven) cls.push('given');
    if (selected === idx) cls.push('selected');
    else if (selected !== null && cells[selected]?.value !== null && cells[selected].value === cell.value && !cell.isError) cls.push('same');
    else {
      const sr = Math.floor(selected! / 9), sc = selected! % 9;
      const r = Math.floor(idx / 9), c = idx % 9;
      if (selected !== null && (r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3)))) cls.push('related');
    }
    if (cell.isError) cls.push('error');
    if (animCell?.idx === idx) cls.push(animCell.cls);
    return cls.join(' ');
  };

  if (error) {
    return (
      <main className="game-screen">
        <header className="game-header">
          <div className="game-brand"><div className="brand-mark"><BrandMark size={22} /></div><h1>Sudoku</h1></div>
          <div />
        </header>
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <p style={{ color: 'var(--red)', fontWeight: 700 }}>{error}</p>
          <button type="button" className="primary-button" onClick={onLeave}>Back to Lobby</button>
        </div>
      </main>
    );
  }

  if (!lobby) {
    return (
      <main className="game-screen">
        <header className="game-header">
          <div className="game-brand"><div className="brand-mark"><BrandMark size={22} /></div><h1>Sudoku</h1></div>
          <div />
        </header>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Connecting…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">

      {/* ── Header ── */}
      <header className="game-header">
        <div className="game-brand">
          <div className="brand-mark"><BrandMark size={22} /></div>
          <h1>Sudoku</h1>
        </div>
        <div className="top-nav">
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--ink)' }}>{lobby.code}</span>
          {phase === 'playing' && !finished && (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 15, color: 'var(--muted)' }}>
              {formatTime(elapsed)}
              {settings.timeLimitSeconds && <span style={{ fontSize: 12, marginLeft: 4 }}>/ {formatTime(settings.timeLimitSeconds)}</span>}
            </span>
          )}
        </div>
      </header>

      {/* ── Left Panel: info + players ── */}
      <aside className="game-left">
        <button className="back-button" type="button" onClick={onLeave}>
          <ArrowLeft size={16} /> Leave
        </button>

        <section className="info-panel">
          {phase === 'playing' ? (
            <>
              <div className="info-row">
                <span className="eyebrow">Difficulty</span>
                <span className="pill" style={{ color: accentColor, background: accentColor + '22', border: `1px solid ${accentColor}44`, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
                  {activeDifficulty.charAt(0).toUpperCase() + activeDifficulty.slice(1)}
                </span>
              </div>
              <div className="info-row">
                <span className="eyebrow">Mistakes</span>
                <span className="info-value" style={{ color: mistakes > 0 ? 'var(--red)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{mistakes}</span>
              </div>
              <div className="info-row">
                <span className="eyebrow">Timer</span>
                <span className="info-value" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(elapsed)}</span>
              </div>
            </>
          ) : (
            <div className="info-row" style={{ justifyContent: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                {phase === 'waiting' ? (isHost ? 'Room ready' : 'Waiting…') : 'Finished'}
              </span>
            </div>
          )}
        </section>

        {/* Players list */}
        <div>
          <div className="control-label" style={{ marginBottom: 10 }}>Players</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lobby.players.map((p) => (
              <PlayerCard key={p.userId} player={p} isMe={p.userId === user?.id} />
            ))}
          </div>
        </div>

        {/* Waiting room host controls */}
        {phase === 'waiting' && isHost && (
          <div style={{ marginTop: 'auto' }}>
            <div className="control-label" style={{ marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
              {ALL_DIFFICULTIES.map((d) => {
                const color = DIFF_ACCENT[d];
                const active = hostDifficulty === d;
                return (
                  <button key={d} type="button" onClick={() => setHostDifficulty(d)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${active ? color : 'var(--line)'}`, background: active ? color + '15' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 120ms' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 600, color: active ? 'var(--ink)' : 'var(--muted)' }}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="primary-button" onClick={handleStart} style={{ width: '100%', height: 48 }}>
              Start Game
            </button>
          </div>
        )}
        {phase === 'waiting' && !isHost && (
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, textAlign: 'center', marginTop: 'auto' }}>
            Host will start soon…
          </p>
        )}
      </aside>

      {/* ── Board ── */}
      <section className="game-main" style={{ position: 'relative' }}>
        {phase === 'waiting' ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 24 }}>⏳</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              {isHost ? 'Your room is ready' : 'Waiting to start'}
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 300 }}>
              {isHost
                ? 'Friends join with the code shown in the header. Pick a difficulty and start when ready.'
                : 'The host will start the game. Everyone gets the same puzzle.'}
            </p>
          </div>
        ) : (
          <div className="game-center">
            <div className="board-wrap">
              <div className="sudoku-board" role="grid" aria-label="Sudoku puzzle">
                {cells.map((cell, idx) => (
                  <button
                    key={idx}
                    className={cellClass(idx)}
                    type="button"
                    role="gridcell"
                    onClick={() => handleCellClick(idx)}
                    disabled={finished}
                    aria-selected={selected === idx}
                  >
                    {cell.value !== null ? <span className="cell-number">{cell.value}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Right Panel: controls ── */}
      <aside className="game-inspector">
        <div className="control-section">
          <div className="control-label">Tools</div>
          <div className="tool-grid">
            {settings.allowUndo && (
              <button className="tool-button" type="button" onClick={handleUndo} disabled={finished || phase !== 'playing' || cellHistory.length === 0}>
                <RotateCcw size={18} /><span>Undo</span>
              </button>
            )}
            <button className="tool-button" type="button" onClick={handleErase} disabled={finished || phase !== 'playing'}>
              <Eraser size={18} /><span>Erase</span>
            </button>
          </div>
        </div>

        {settings.allowHints && (
          <div className="control-section">
            <div className="control-label">Assistance</div>
            <button className="hint-button" type="button" onClick={handleHint} disabled={finished || phase !== 'playing' || hintsLeft <= 0}>
              <Lightbulb size={18} /> Hint ({hintsLeft} left)
            </button>
          </div>
        )}

        <div className="control-section">
          <div className="control-label">Numbers</div>
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className="number-key"
                type="button"
                onClick={() => handleNumber(n)}
                disabled={finished || phase !== 'playing'}
                aria-label={`Enter ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="ghost-button" type="button" onClick={onLeave} style={{ width: '100%', marginTop: 'auto', height: 44 }}>
          Leave Room
        </button>
      </aside>

      {/* ── Results overlay (matches victory-backdrop) ── */}
      {(finished || phase === 'finished') && (
        <div className="victory-backdrop">
          <div className="victory-card" style={{ width: 'min(520px, 92vw)', maxHeight: '80vh', overflowY: 'auto' }}>
            <FinishedState myPlayer={myPlayer} lobby={lobby} elapsed={elapsed} onLeave={onLeave} />
          </div>
        </div>
      )}

    </main>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const PlayerCard: React.FC<{ player: LobbyPlayer; isMe: boolean }> = ({ player, isMe }) => {
  const pct = Math.round((player.progress / 81) * 100);
  const done = player.finishedAt !== null;
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${isMe ? 'var(--line-strong)' : 'var(--line)'}`, background: isMe ? 'var(--surface)' : 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {player.isHost && <Crown size={11} color="#f5a623" strokeWidth={2} />}
        <span style={{ fontSize: 13, fontWeight: isMe ? 800 : 600, color: done ? 'var(--green)' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {player.displayName}
          {isMe && <span style={{ fontWeight: 600, color: 'var(--muted)' }}> (you)</span>}
        </span>
        {done
          ? <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Done</span>
          : <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
        }
      </div>
      <div style={{ height: 3, borderRadius: 999, background: 'var(--surface-container)' }}>
        <div style={{ height: '100%', borderRadius: 999, background: done ? 'var(--green)' : isMe ? 'var(--blue)' : 'var(--line-strong)', width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};


const FinishedState: React.FC<{ myPlayer: LobbyPlayer | undefined; lobby: Lobby; elapsed: number; onLeave: () => void }> = ({ myPlayer, lobby, elapsed, onLeave }) => {
  const sorted = [...lobby.players].sort((a, b) => {
    if (a.finishedAt && b.finishedAt) return new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime();
    if (a.finishedAt) return -1;
    if (b.finishedAt) return 1;
    return b.progress - a.progress;
  });
  const winner = sorted[0];
  const iWon = myPlayer?.userId === winner?.userId;
  const RANK_MEDAL = ['🥇', '🥈', '🥉'];
  return (
    <>
      <div className="victory-emoji">{iWon ? '🏆' : '🎮'}</div>
      <h2 className="victory-title">{iWon ? 'You win!' : `${winner?.displayName ?? 'Someone'} wins!`}</h2>
      <p className="victory-sub">
        {iWon ? 'Nicely done — you finished first.' : 'Good game! Better luck next time.'}
      </p>

      <div className="victory-stats">
        <div>
          <div className="victory-stat-val" style={{ color: 'var(--blue)' }}>{formatTime(elapsed)}</div>
          <div className="victory-stat-lbl">Your Time</div>
        </div>
        <div>
          <div className="victory-stat-val" style={{ color: myPlayer && myPlayer.mistakes === 0 ? 'var(--green)' : 'var(--red)' }}>{myPlayer?.mistakes ?? 0}</div>
          <div className="victory-stat-lbl">Your Mistakes</div>
        </div>
        <div>
          <div className="victory-stat-val" style={{ color: 'var(--orange)' }}>{lobby.players.filter(p => p.finishedAt).length}/{lobby.players.length}</div>
          <div className="victory-stat-lbl">Finished</div>
        </div>
      </div>

      {/* Leaderboard — no opponent mistakes shown */}
      <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        {sorted.map((p, rank) => (
          <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: rank < sorted.length - 1 ? '1px solid var(--line)' : 'none', background: p.userId === myPlayer?.userId ? 'var(--blue-wash)' : 'transparent' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{rank < 3 ? RANK_MEDAL[rank] : `#${rank + 1}`}</span>
            <span style={{ flex: 1, fontWeight: p.userId === myPlayer?.userId ? 800 : 600, fontSize: 14, color: 'var(--ink)', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.displayName}{p.userId === myPlayer?.userId ? ' (you)' : ''}
            </span>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.finishedAt ? 'var(--green)' : 'var(--ink)' }}>
                {p.finishedAt ? '✓ Done' : `${Math.round((p.progress / 81) * 100)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="victory-actions">
        <button type="button" className="primary-button" onClick={onLeave} style={{ width: '100%' }}>
          Back to Lobby
        </button>
      </div>
    </>
  );
};
