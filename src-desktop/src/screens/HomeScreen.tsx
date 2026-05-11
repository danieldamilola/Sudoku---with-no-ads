import { ArrowRight, Clock3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/time';
import type { Difficulty } from '../types';

const DIFF: Record<Difficulty, { tag: string; title: string; desc: string; time: string; color: string; bg: string }> = {
  easy: { tag: 'Easy', title: 'Beginner', desc: 'Gentle logic for a quick mental break.', time: '3-5 min avg', color: '#00732a', bg: '#72fe88' },
  medium: { tag: 'Medium', title: 'Skilled', desc: 'Balanced puzzles for daily focus.', time: '8-12 min avg', color: '#0036bc', bg: '#dde1ff' },
  hard: { tag: 'Hard', title: 'Advanced', desc: 'Complex patterns and deep strategy.', time: '15-25 min avg', color: '#673d00', bg: '#ffddbb' },
  expert: { tag: 'Expert', title: 'Master', desc: 'Extreme challenges for the dedicated.', time: '30+ min avg', color: '#93000a', bg: '#ffdad6' },
};

interface HomeScreenProps {
  onStartGame: (difficulty: Difficulty) => void;
  onNavigateGame?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, onNavigateGame }) => {
  const cells = useStore((s) => s.cells);
  const isCompleted = useStore((s) => s.isCompleted);
  const difficulty = useStore((s) => s.difficulty);
  const elapsed = useStore((s) => s.elapsedSeconds);
  const mistakes = useStore((s) => s.mistakes);
  const settings = useStore((s) => s.settings);
  const stats = useStore((s) => s.stats);
  const activeGame = cells.length > 0 && !isCompleted;
  const filled = cells.filter((cell) => cell.value !== null).length;
  const completion = activeGame ? Math.round((filled / 81) * 100) : 0;
  const bestEasy = stats.bestTimes.easy ?? null;

  return (
    <main className="screen">
      <div className="screen-inner">
        <header className="page-header">
          <div>
            <h1 className="page-title">Sudoku</h1>
            <p className="page-subtitle">No ads. No noise. Just the puzzle.</p>
          </div>
        </header>

        {activeGame ? (
          <button className="continue-bar" type="button" onClick={onNavigateGame}>
            <div>
              <div className="eyebrow">Continue Puzzle</div>
              <div style={{ marginTop: 5, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {DIFF[difficulty].title}
              </div>
              <div className="continue-meta">
                <span>{DIFF[difficulty].tag}</span>
                <span className="continue-dot" />
                <span>{formatTime(elapsed)}</span>
                <span className="continue-dot" />
                <span>{completion}% complete</span>
                <span className="continue-dot" />
                <span>{mistakes}/{settings.mistakeLimit || '-'} mistakes</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--blue)', fontWeight: 800 }}>
              Resume <ArrowRight size={22} />
            </div>
          </button>
        ) : null}

        <section className="difficulty-grid">
          {(Object.entries(DIFF) as [Difficulty, typeof DIFF[Difficulty]][]).map(([id, item]) => (
            <button key={id} className="difficulty-card card" type="button" onClick={() => onStartGame(id)}>
              <span className="pill" style={{ color: item.color, background: item.bg }}>{item.tag}</span>
              <ArrowRight className="arrow" size={30} strokeWidth={1.8} />
              <h2 style={{ margin: '28px 0 14px', fontSize: 28, letterSpacing: '-0.02em' }}>{item.title}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 20, lineHeight: 1.45, maxWidth: 520 }}>{item.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 26, color: 'var(--muted)', fontWeight: 800 }}>
                <Clock3 size={16} /> {item.time}
              </div>
            </button>
          ))}
        </section>

        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />

        {(stats.totalCompleted > 0 || stats.currentStreak > 0 || bestEasy) ? (
          <section className="stat-grid">
            <div className="stat-card">
              <div className="eyebrow">Best Time</div>
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{bestEasy ? formatTime(bestEasy) : '--:--'}</div>
              <div className="stat-label">Easy Mode</div>
            </div>
            <div className="stat-card">
              <div className="eyebrow">Streak</div>
              <div className="stat-value" style={{ color: 'var(--orange)' }}>{stats.currentStreak}</div>
              <div className="stat-label">Days active</div>
            </div>
            <div className="stat-card">
              <div className="eyebrow">Solved</div>
              <div className="stat-value" style={{ color: 'var(--green-text)' }}>{stats.totalCompleted}</div>
              <div className="stat-label">Total puzzles</div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};
