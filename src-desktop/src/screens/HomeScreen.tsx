import { ArrowRight, Clock3, ChevronDown, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/time';
import type { Difficulty } from '../types';
import { useState } from 'react';

const DIFF: Record<Difficulty, { tag: string; title: string; desc: string; time: string; color: string; bg: string }> = {
  beginner: { tag: 'Beginner', title: 'Beginner', desc: 'Gentle logic for a quick mental break.', time: '3-5 min avg', color: '#34c759', bg: '#d1fae5' },
  skill:    { tag: 'Skill',    title: 'Skilled',  desc: 'Balanced puzzles for daily focus.',        time: '8-12 min avg', color: '#274ed5', bg: '#dbeafe' },
  hard:     { tag: 'Hard',     title: 'Advanced', desc: 'Complex patterns and deep strategy.',      time: '15-25 min avg', color: '#845000', bg: '#ffddbb' },
  advanced: { tag: 'Advanced', title: 'Expert',   desc: 'Challenging for experienced players.',     time: '25-35 min avg', color: '#ba1a1a', bg: '#ffdad6' },
  expert:   { tag: 'Expert',   title: 'Master',   desc: 'Extreme challenges for the dedicated.',    time: '35-45 min avg', color: '#ba1a1a', bg: '#ffdad6' },
  master:   { tag: 'Master',   title: 'Grandmaster', desc: 'Ultimate challenge for Sudoku masters.', time: '45+ min avg', color: '#7c3aed', bg: '#ede9fe' },
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
  const bestBeginner = stats.bestTimes.beginner ?? null;
  const [showAllDifficulties, setShowAllDifficulties] = useState(false);

  const getUnlockRequirement = (d: Difficulty): string | null => {
    if (settings.unlockedDifficulties.includes(d)) return null;
    switch (d) {
      case 'hard': {
        const wins = stats.recentGames.filter(g => g.difficulty === 'skill' && g.won).length;
        return `Win ${Math.max(0, 4 - wins)} more in Skill`;
      }
      case 'advanced': {
        const wins = stats.recentGames.filter(g => g.difficulty === 'hard' && g.won).length;
        return `Win ${Math.max(0, 8 - wins)} more in Hard`;
      }
      case 'expert':
      case 'master': {
        const wins = stats.recentGames.filter(g => g.difficulty === 'advanced' && g.won).length;
        return `Win ${Math.max(0, 16 - wins)} more in Advanced`;
      }
      default:
        return null;
    }
  };

  const visibleDifficulties = showAllDifficulties
    ? (['beginner', 'skill', 'hard', 'advanced', 'expert', 'master'] as Difficulty[])
    : (['beginner', 'skill', 'hard', 'advanced'] as Difficulty[]);

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
          {visibleDifficulties.map((id) => {
            const item = DIFF[id];
            const isUnlocked = settings.unlockedDifficulties.includes(id);
            const unlockReq = getUnlockRequirement(id);
            return (
              <button 
                key={id} 
                className={`difficulty-card card ${!isUnlocked ? 'locked' : ''}`} 
                type="button" 
                onClick={() => isUnlocked && onStartGame(id)}
                disabled={!isUnlocked}
              >
                <span className="pill" style={{ color: item.color, background: item.bg }}>{item.tag}</span>
                <ArrowRight className="arrow" size={30} strokeWidth={1.8} />
                <h2 style={{ margin: '28px 0 14px', fontSize: 28, letterSpacing: '-0.02em' }}>{item.title}</h2>
                <p style={{ color: 'var(--muted)', fontSize: 20, lineHeight: 1.45, maxWidth: 520 }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 26, color: 'var(--muted)', fontWeight: 800 }}>
                  <Clock3 size={16} /> {item.time}
                </div>
                {unlockReq && (
                  <div style={{ marginTop: 16, fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>
                    {unlockReq}
                  </div>
                )}
                {!isUnlocked && (
                  <div className="lock-overlay">
                    <Lock size={32} color="#fff" strokeWidth={1.5} />
                  </div>
                )}
              </button>
            );
          })}
        </section>

        {showAllDifficulties ? (
          <button 
            className="see-more-btn" 
            type="button"
            onClick={() => setShowAllDifficulties(false)}
          >
            Show Less <ChevronDown size={16} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
          </button>
        ) : (
          <button 
            className="see-more-btn" 
            type="button"
            onClick={() => setShowAllDifficulties(true)}
          >
            See More <ChevronDown size={16} strokeWidth={2} />
          </button>
        )}

        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />

        <section className="stat-grid">
          <div className="stat-card">
            <div className="eyebrow">Best Time</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{bestBeginner ? formatTime(bestBeginner) : '--:--'}</div>
            <div className="stat-label">Beginner Mode</div>
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
      </div>
    </main>
  );
};
