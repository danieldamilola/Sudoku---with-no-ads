import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eraser, Lightbulb, Pause, PencilLine, Play, RotateCcw, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/time';
import { BrandMark } from '../components/BrandMark';
import type { Screen } from '../types';

interface GameScreenProps {
  onBack: () => void;
  onNavigate?: (screen: Screen) => void;
}

const diffLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const GameScreen: React.FC<GameScreenProps> = ({ onBack, onNavigate }) => {
  const cells = useStore((s) => s.cells);
  const selected = useStore((s) => s.selectedCellIndex);
  const notesMode = useStore((s) => s.notesMode);
  const mistakes = useStore((s) => s.mistakes);
  const difficulty = useStore((s) => s.difficulty);
  const elapsed = useStore((s) => s.elapsedSeconds);
  const isPaused = useStore((s) => s.isPaused);
  const isCompleted = useStore((s) => s.isCompleted);
  const isFailed = useStore((s) => s.isFailed);
  const hintsUsed = useStore((s) => s.hintsUsed);
  const secondChancesUsed = useStore((s) => s.secondChancesUsed);
  const settings = useStore((s) => s.settings);
  const selectCell = useStore((s) => s.selectCell);
  const enterNumber = useStore((s) => s.enterNumber);
  const toggleNotesMode = useStore((s) => s.toggleNotesMode);
  const eraseCell = useStore((s) => s.eraseCell);
  const undoMove = useStore((s) => s.undoMove);
  const useHint = useStore((s) => s.useHint);
  const togglePause = useStore((s) => s.togglePause);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const startNewGame = useStore((s) => s.startNewGame);
  const useSecondChance = useStore((s) => s.useSecondChance);

  const [zoom, setZoom] = useState(1.0);
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 1.5;
  const ZOOM_STEP = 0.1;
  const zoomIn    = () => setZoom(z => parseFloat(Math.min(ZOOM_MAX, z + ZOOM_STEP).toFixed(1)));
  const zoomOut   = () => setZoom(z => parseFloat(Math.max(ZOOM_MIN, z - ZOOM_STEP).toFixed(1)));
  const zoomReset = () => setZoom(1.0);

  const noUndo = difficulty === 'expert' || difficulty === 'master';
  const mistakeLimit = settings.mistakeLimit;
  const mistakeText = mistakeLimit > 0 ? `${mistakes}/${mistakeLimit}` : `${mistakes}`;
  const hintsLeft = Math.max(0, settings.hintsPerGame - hintsUsed);
  const selectedValue = selected !== null ? cells[selected]?.value ?? null : null;

  useEffect(() => {
    if (cells.length && !isCompleted) startTimer();
    return () => stopTimer();
  }, [cells.length, isCompleted, startTimer, stopTimer]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isPaused || isCompleted) return;
    const n = Number(event.key);
    if (n >= 1 && n <= 9) enterNumber(n);
    if (event.key === 'Delete' || event.key === 'Backspace') eraseCell();
    if (event.key.toLowerCase() === 'z' && (event.ctrlKey || event.metaKey) && !noUndo) undoMove();
    if (event.key.toLowerCase() === 'n') toggleNotesMode();
    if ((event.key === '=' || event.key === '+') && (event.ctrlKey || event.metaKey)) { event.preventDefault(); zoomIn(); }
    if (event.key === '-' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); zoomOut(); }
    if (event.key === '0' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); zoomReset(); }
    if (event.key.startsWith('Arrow') && selected !== null) {
      const delta = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[event.key] ?? 0;
      if (delta !== 0) {
        event.preventDefault();
        const next = Math.max(0, Math.min(80, selected + delta));
        selectCell(next);
      }
    }
  }, [enterNumber, eraseCell, isCompleted, isPaused, noUndo, selected, selectCell, toggleNotesMode, undoMove, zoomIn, zoomOut, zoomReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const completedNumbers = useMemo(() => {
    const done = new Set<number>();
    for (let n = 1; n <= 9; n += 1) {
      if (cells.filter((cell) => cell.value === n && !cell.isError).length >= 9) done.add(n);
    }
    return done;
  }, [cells]);

  const relatedToSelected = (idx: number) => {
    if (selected === null) return false;
    const sr = Math.floor(selected / 9);
    const sc = selected % 9;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };

  const cellClass = (idx: number) => {
    const cell = cells[idx];
    const classes = ['sudoku-cell'];
    if (cell.isGiven) classes.push('given');
    if (selected === idx) classes.push('selected');
    else if (settings.highlightDuplicates && selectedValue !== null && cell.value === selectedValue) classes.push('same');
    else if (relatedToSelected(idx)) classes.push('related');
    if (cell.isError && settings.showMistakes) classes.push('error');
    return classes.join(' ');
  };

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
      <header className="game-header">
        <div className="game-brand">
          <div className="brand-mark">
            <BrandMark size={24} />
          </div>
          <h1>Sudoku</h1>
        </div>
        <div className="top-nav">
          <button type="button" className="active">Play</button>
          <button type="button" onClick={() => onNavigate?.('stats')}>Stats</button>
          <button type="button" onClick={() => onNavigate?.('settings')}><Settings size={20} /></button>
        </div>
      </header>

      <aside className="game-left">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Home
        </button>
        <section className="info-panel">
          <div className="info-row">
            <span className="eyebrow">Difficulty</span>
            <span className="pill" style={{ color: 'var(--orange)', border: '1px solid var(--orange)', background: 'var(--orange-wash)' }}>{diffLabel(difficulty)}</span>
          </div>
          <div className="info-row">
            <span className="eyebrow">Mistakes</span>
            <span className="info-value" style={{ color: (mistakeLimit > 0 && mistakes >= mistakeLimit) ? 'var(--red)' : 'var(--ink)' }}>{mistakeText}</span>
          </div>
          <div className="info-row">
            <span className="eyebrow">Timer</span>
            <span className="info-value">{settings.showTimer ? formatTime(elapsed) : '--:--'}</span>
          </div>
        </section>
      </aside>

      <section className="game-main">
        <div className="game-center">
          <div
            className="board-wrap"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            onWheel={(e) => {
              if (!e.ctrlKey && !e.metaKey) return;
              e.preventDefault();
              e.deltaY < 0 ? zoomIn() : zoomOut();
            }}
          >
            <div className="sudoku-board">
              {cells.map((cell, idx) => {
                const row = Math.floor(idx / 9) + 1;
                const col = (idx % 9) + 1;
                const cellDesc = cell.value !== null
                  ? `${cell.isGiven ? 'Given' : 'Entered'} ${cell.value}`
                  : cell.notes?.length ? `Notes: ${cell.notes.join(', ')}` : 'Empty';
                return (
                <button
                  key={idx}
                  className={cellClass(idx)}
                  type="button"
                  onClick={() => selectCell(idx)}
                  disabled={isPaused || isCompleted}
                  aria-label={`Row ${row}, Column ${col}: ${cellDesc}${cell.isError ? ', incorrect' : ''}`}
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

      <aside className="game-inspector">
        <button className="primary-button" type="button" onClick={togglePause} disabled={isCompleted} style={{ width: '100%', height: 54, marginBottom: 12 }}>
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <div className="zoom-bar" style={{ width: '100%', borderRadius: 10, marginBottom: 16 }}>
          <button className="zoom-btn" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Zoom out (Ctrl+−)">−</button>
          <button className="zoom-pct" onClick={zoomReset} title="Reset zoom (Ctrl+0)">{Math.round(zoom * 100)}%</button>
          <button className="zoom-btn" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} title="Zoom in (Ctrl+=)">+</button>
        </div>

        <div className="control-section">
          <div className="control-label">Tools</div>
          <div className="tool-grid">
            <button className="tool-button" type="button" onClick={undoMove} disabled={isPaused || isCompleted || noUndo}>
              <RotateCcw size={20} /><span>Undo</span>
            </button>
            <button className="tool-button" type="button" onClick={eraseCell} disabled={isPaused || isCompleted}>
              <Eraser size={20} /><span>Erase</span>
            </button>
            <button className={`tool-button ${notesMode ? 'active' : ''}`} type="button" onClick={toggleNotesMode} disabled={isPaused || isCompleted}>
              <PencilLine size={20} /><span>Notes</span>
            </button>
          </div>
        </div>

        <div className="control-section">
          <div className="control-label">Assistance</div>
          <button className="hint-button" type="button" onClick={useHint} disabled={isPaused || isCompleted || hintsLeft <= 0}>
            <Lightbulb size={20} /> Hint {hintsLeft}
          </button>
        </div>

        <div className="control-section">
          <div className="control-label">Numbers</div>
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <button key={n} className="number-key" type="button" onClick={() => enterNumber(n)} disabled={isPaused || isCompleted || completedNumbers.has(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button className="primary-button" type="button" onClick={() => startNewGame(difficulty)} style={{ width: '100%', marginTop: 24, height: 54 }}>
          New Game
        </button>
      </aside>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isCompleted ? (isFailed ? 'Puzzle failed.' : 'Puzzle complete!') : ''}
      </div>

      {isCompleted ? (
        <div className="dialog-backdrop">
          <div className="dialog card">
            <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>{isFailed ? 'Puzzle Failed' : 'Puzzle Complete'}</h2>
            <p style={{ margin: '0 0 22px', color: 'var(--muted)' }}>
              {formatTime(elapsed)} · {mistakeText} mistakes
            </p>
            {isFailed && secondChancesUsed < 3 ? (
              <button className="primary-button" type="button" onClick={useSecondChance} style={{ width: '100%', marginBottom: 10, background: 'var(--green-text)' }}>
                Second Chance ({3 - secondChancesUsed} left)
              </button>
            ) : null}
            <button className="primary-button" type="button" onClick={() => startNewGame(difficulty)} style={{ width: '100%' }}>New Game</button>
          </div>
        </div>
      ) : null}
    </main>
  );
};
