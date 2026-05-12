import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Eraser, Lightbulb, Pause, PencilLine, Play, RotateCcw, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/time';
import { BrandMark } from '../components/BrandMark';
import type { Screen } from '../types';

interface GameScreenProps {
  onBack: () => void;
  onNavigate?: (screen: Screen) => void;
}

const diffLabel = (v: string | undefined) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '';

const DIFF_ACCENT: Record<string, string> = {
  beginner: '#1a7a40', skill: '#3650d4', hard: '#a04f00',
  advanced: '#c0180f', expert: '#c0180f', master: '#6b30d4',
};

export const GameScreen: React.FC<GameScreenProps> = ({ onBack, onNavigate }) => {
  const cells           = useStore((s) => s.cells);
  const selected        = useStore((s) => s.selectedCellIndex);
  const notesMode       = useStore((s) => s.notesMode);
  const mistakes        = useStore((s) => s.mistakes);
  const difficulty      = useStore((s) => s.difficulty);
  const elapsed         = useStore((s) => s.elapsedSeconds);
  const isPaused        = useStore((s) => s.isPaused);
  const isCompleted     = useStore((s) => s.isCompleted);
  const isFailed        = useStore((s) => s.isFailed);
  const hintsUsed       = useStore((s) => s.hintsUsed);
  const secondChancesUsed = useStore((s) => s.secondChancesUsed);
  const settings        = useStore((s) => s.settings);
  const selectCell      = useStore((s) => s.selectCell);
  const enterNumber     = useStore((s) => s.enterNumber);
  const toggleNotesMode = useStore((s) => s.toggleNotesMode);
  const eraseCell       = useStore((s) => s.eraseCell);
  const undoMove        = useStore((s) => s.undoMove);
  const useHint         = useStore((s) => s.useHint);
  const togglePause     = useStore((s) => s.togglePause);
  const startTimer      = useStore((s) => s.startTimer);
  const stopTimer       = useStore((s) => s.stopTimer);
  const startNewGame    = useStore((s) => s.startNewGame);
  const useSecondChance = useStore((s) => s.useSecondChance);

  const [zoom, setZoom]           = useState(1.0);
  const [animCell, setAnimCell]   = useState<{ idx: number; cls: string } | null>(null);

  const ZOOM_MIN = 0.6, ZOOM_MAX = 1.5, ZOOM_STEP = 0.1;
  const zoomIn    = () => setZoom(z => parseFloat(Math.min(ZOOM_MAX, z + ZOOM_STEP).toFixed(1)));
  const zoomOut   = () => setZoom(z => parseFloat(Math.max(ZOOM_MIN, z - ZOOM_STEP).toFixed(1)));
  const zoomReset = () => setZoom(1.0);

  const noUndo        = difficulty === 'expert' || difficulty === 'master';
  const mistakeLimit  = settings.mistakeLimit;
  const mistakeText   = mistakeLimit > 0 ? `${mistakes}/${mistakeLimit}` : `${mistakes}`;
  const hintsLeft     = Math.max(0, settings.hintsPerGame - hintsUsed);
  const selectedValue = selected !== null ? cells[selected]?.value ?? null : null;
  const accentColor   = DIFF_ACCENT[difficulty] ?? 'var(--blue)';

  useEffect(() => {
    if (cells.length && !isCompleted) startTimer();
    return () => stopTimer();
  }, [cells.length, isCompleted, startTimer, stopTimer]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        useStore.getState().pushActiveGameToCloud().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  /* Number counts per digit */
  const digitCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) counts[n] = cells.filter(c => c.value === n && !c.isError).length;
    return counts;
  }, [cells]);

  const completedNumbers = useMemo(() => {
    const done = new Set<number>();
    for (let n = 1; n <= 9; n++) if (digitCounts[n] >= 9) done.add(n);
    return done;
  }, [digitCounts]);

  /* Trigger cell animation on number entry */
  const prevCells = useRef(cells);
  useEffect(() => {
    if (selected === null) { prevCells.current = cells; return; }
    const prev = prevCells.current[selected];
    const curr = cells[selected];
    if (prev && curr && prev.value !== curr.value && curr.value !== null) {
      const cls = curr.isError ? 'cell-shake' : 'cell-pop';
      setAnimCell({ idx: selected, cls });
      const t = setTimeout(() => setAnimCell(null), 250);
      prevCells.current = cells;
      return () => clearTimeout(t);
    }
    prevCells.current = cells;
  }, [cells, selected]);

  const relatedToSelected = (idx: number) => {
    if (selected === null) return false;
    const sr = Math.floor(selected / 9), sc = selected % 9;
    const r  = Math.floor(idx / 9),     c  = idx % 9;
    return r === sr || c === sc ||
      (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };

  const cellClass = (idx: number) => {
    const cell = cells[idx];
    const cls  = ['sudoku-cell'];
    if (cell.isGiven) cls.push('given');
    if (selected === idx) cls.push('selected');
    else if (settings.highlightDuplicates && selectedValue !== null && cell.value === selectedValue) cls.push('same');
    else if (relatedToSelected(idx)) cls.push('related');
    if (cell.isError && settings.showMistakes) cls.push('error');
    if (animCell?.idx === idx) cls.push(animCell.cls);
    return cls.join(' ');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isPaused || isCompleted) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 9) enterNumber(n);
    if (e.key === 'Delete' || e.key === 'Backspace') eraseCell();
    if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey) && !noUndo) undoMove();
    if (e.key.toLowerCase() === 'n') toggleNotesMode();
    if ((e.key === '=' || e.key === '+') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomIn(); }
    if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomOut(); }
    if (e.key === '0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomReset(); }
    if (e.key.startsWith('Arrow') && selected !== null) {
      const delta = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key] ?? 0;
      if (delta !== 0) { e.preventDefault(); selectCell(Math.max(0, Math.min(80, selected + delta))); }
    }
  }, [enterNumber, eraseCell, isCompleted, isPaused, noUndo, selected, selectCell, toggleNotesMode, undoMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!cells.length) {
    return (
      <main className="screen">
        <div className="screen-inner">
          <h1 className="page-title">No puzzle loaded</h1>
          <button className="primary-button" type="button" onClick={onBack}>Back to Home</button>
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
          <button type="button" className="active">Play</button>
          <button type="button" onClick={() => onNavigate?.('stats')}>Stats</button>
          <button type="button" onClick={() => onNavigate?.('settings')}><Settings size={18} /></button>
        </div>
      </header>

      {/* ── Left Panel ── */}
      <aside className="game-left">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <section className="info-panel">
          <div className="info-row">
            <span className="eyebrow">Difficulty</span>
            <span className="pill" style={{ color: accentColor, background: accentColor + '22', border: `1px solid ${accentColor}44` }}>
              {diffLabel(difficulty)}
            </span>
          </div>
          <div className="info-row">
            <span className="eyebrow">Mistakes</span>
            <span className="info-value" style={{ color: (mistakeLimit > 0 && mistakes >= mistakeLimit) ? 'var(--red)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
              {mistakeText}
            </span>
          </div>
          <div className="info-row">
            <span className="eyebrow">Timer</span>
            <span className="info-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {settings.showTimer ? formatTime(elapsed) : '--:--'}
            </span>
          </div>
        </section>
      </aside>

      {/* ── Board ── */}
      <section className="game-main" style={{ position: 'relative' }}>
        {isPaused && !isCompleted && (
          <div className="pause-overlay">
            <div className="pause-glyph">II</div>
            <div className="pause-label">Paused</div>
            <button className="primary-button" type="button" onClick={togglePause} style={{ marginTop: 8 }}>
              <Play size={16} /> Resume
            </button>
          </div>
        )}
        <div className="game-center">
          <div
            className="board-wrap"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            onWheel={(e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); if (e.deltaY < 0) { zoomIn(); } else { zoomOut(); } }}
          >
            <div className="sudoku-board" role="grid" aria-label="Sudoku puzzle">
              {cells.map((cell, idx) => {
                const row = Math.floor(idx / 9) + 1;
                const col = (idx % 9) + 1;
                const desc = cell.value !== null
                  ? `${cell.isGiven ? 'Given' : 'Entered'} ${cell.value}`
                  : cell.notes?.length ? `Notes: ${cell.notes.join(', ')}` : 'Empty';
                return (
                  <button
                    key={idx}
                    className={cellClass(idx)}
                    type="button"
                    role="gridcell"
                    onClick={() => selectCell(idx)}
                    disabled={isPaused || isCompleted}
                    aria-label={`Row ${row}, Column ${col}: ${desc}${cell.isError ? ', incorrect' : ''}`}
                    aria-selected={selected === idx}
                  >
                    {cell.value !== null ? (
                      <span className="cell-number">{cell.value}</span>
                    ) : cell.notes?.length ? (
                      <span className="notes-grid">
                        {Array.from({ length: 9 }, (_, n) => n + 1).map((n) => (
                          <span key={n} className="note">{cell.notes?.includes(n) ? n : ''}</span>
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Panel ── */}
      <aside className="game-inspector">
        <button className="primary-button" type="button" onClick={togglePause} disabled={isCompleted} style={{ width: '100%', height: 48 }}>
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <div className="zoom-bar" style={{ width: '100%', borderRadius: 10, marginBottom: 8 }}>
          <button className="zoom-btn" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Ctrl+−">−</button>
          <button className="zoom-pct" onClick={zoomReset} title="Ctrl+0">{Math.round(zoom * 100)}%</button>
          <button className="zoom-btn" onClick={zoomIn}  disabled={zoom >= ZOOM_MAX} title="Ctrl+=">+</button>
        </div>

        <div className="control-section">
          <div className="control-label">Tools</div>
          <div className="tool-grid">
            <button className="tool-button" type="button" onClick={undoMove} disabled={isPaused || isCompleted || noUndo}>
              <RotateCcw size={18} /><span>Undo</span>
            </button>
            <button className="tool-button" type="button" onClick={eraseCell} disabled={isPaused || isCompleted}>
              <Eraser size={18} /><span>Erase</span>
            </button>
            <button className={`tool-button ${notesMode ? 'active' : ''}`} type="button" onClick={toggleNotesMode} disabled={isPaused || isCompleted}>
              <PencilLine size={18} /><span>Notes</span>
            </button>
          </div>
        </div>

        <div className="control-section">
          <div className="control-label">Assistance</div>
          <button className="hint-button" type="button" onClick={useHint} disabled={isPaused || isCompleted || hintsLeft <= 0}>
            <Lightbulb size={18} /> Hint ({hintsLeft} left)
          </button>
        </div>

        <div className="control-section">
          <div className="control-label">Numbers</div>
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
              const remaining = 9 - (digitCounts[n] ?? 0);
              return (
                <button
                  key={n}
                  className="number-key"
                  type="button"
                  onClick={() => enterNumber(n)}
                  disabled={isPaused || isCompleted || completedNumbers.has(n)}
                  aria-label={`Enter ${n}, ${remaining} remaining`}
                >
                  {n}
                  {remaining > 0 && remaining < 9 && (
                    <span className="number-key-count">{remaining}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button className="primary-button" type="button" onClick={() => startNewGame(difficulty)} style={{ width: '100%', marginTop: 16, height: 48 }}>
          New Game
        </button>
      </aside>

      {/* ── Accessibility live region ── */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isCompleted ? (isFailed ? 'Puzzle failed.' : 'Puzzle complete!') : ''}
      </div>

      {/* ── Victory / Failure Screen ── */}
      {isCompleted && (
        <div className="victory-backdrop">
          <div className="victory-card">
            <h2 className="victory-title">{isFailed ? 'Puzzle Failed' : 'Puzzle Solved!'}</h2>
            <p className="victory-sub">
              {isFailed ? 'Better luck next time.' : 'Great work — you completed the puzzle!'}
            </p>
            <div className="victory-stats">
              <div>
                <div className="victory-stat-val" style={{ color: 'var(--blue)' }}>{formatTime(elapsed)}</div>
                <div className="victory-stat-lbl">Time</div>
              </div>
              <div>
                <div className="victory-stat-val" style={{ color: mistakes === 0 ? 'var(--green)' : 'var(--red)' }}>{mistakes}</div>
                <div className="victory-stat-lbl">Mistakes</div>
              </div>
              <div>
                <div className="victory-stat-val" style={{ color: 'var(--orange)' }}>{hintsUsed}</div>
                <div className="victory-stat-lbl">Hints Used</div>
              </div>
            </div>
            <div className="victory-actions">
              {isFailed && secondChancesUsed < 3 && (
                <button className="primary-button" type="button" onClick={useSecondChance} style={{ width: '100%', background: 'var(--green)' }}>
                  Second Chance ({3 - secondChancesUsed} left)
                </button>
              )}
              {!isFailed && (
                <button className="primary-button" type="button" onClick={() => startNewGame(difficulty)} style={{ width: '100%' }}>
                  Play Again
                </button>
              )}
              <button className="ghost-button" type="button" onClick={onBack} style={{ width: '100%' }}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
