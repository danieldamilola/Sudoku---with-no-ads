import { useStore } from '../store/useStore';
import { formatDuration, formatTime } from '../utils/time';
import type { Difficulty, GameRecord } from '../types';

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const DIFFS: Difficulty[] = ['beginner', 'skill', 'hard', 'advanced', 'expert', 'master'];
const DIFF_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  beginner: { color: '#30a46c', bg: '#e8f7ee' },
  skill: { color: '#007aff', bg: '#e8f2ff' },
  hard: { color: '#d97706', bg: '#fff4df' },
  advanced: { color: '#d92d20', bg: '#fff0ef' },
  expert: { color: '#7c3aed', bg: '#ede9fe' },
  master: { color: '#5b21b6', bg: '#f3e8ff' },
};

const scoreFor = (game: GameRecord) => {
  if (!game.won) return 0;
  const mult = ({ beginner: 1, skill: 2, hard: 3, advanced: 4, expert: 5, master: 6 } as Record<Difficulty, number>)[game.difficulty];
  return (100 + (game.mistakes === 0 ? 50 : 0)) * mult;
};

export const StatisticsScreen: React.FC = () => {
  const stats = useStore((s) => s.stats);
  const wins = stats.recentGames.filter((g) => g.won).length;
  const total = stats.recentGames.length;
  const winRate = total ? Math.round((wins / total) * 100) : null;
  const best = Object.values(stats.bestTimes).length ? Math.min(...Object.values(stats.bestTimes)) : null;

  return (
    <main className="screen">
      <div className="screen-inner">
        <header className="page-header">
          <div>
            <h1 className="page-title">Performance Overview</h1>
          </div>
        </header>

        <section className="stat-grid stat-grid-4" style={{ marginBottom: 22 }}>
          {[
            { label: 'Solved', value: stats.totalCompleted.toString() },
            { label: 'Win rate', value: winRate === null ? '--' : `${winRate}%` },
            { label: 'Total time', value: formatDuration(stats.totalMinutesPlayed) },
            { label: 'Best time', value: best ? formatTime(best) : '--:--' },
          ].map((item) => (
            <div key={item.label} className="stat-card card">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
            </div>
          ))}
        </section>

        <section className="card" style={{ padding: 18, marginBottom: 22 }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Best times</h2>
            <span className="eyebrow">By difficulty</span>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {DIFFS.map((difficulty) => {
              const style = DIFF_STYLE[difficulty];
              return (
                <div key={difficulty} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', alignItems: 'center', gap: 14 }}>
                  <span className="pill" style={{ justifySelf: 'start', color: style.color, background: style.bg }}>{cap(difficulty)}</span>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(118,118,128,0.14)', overflow: 'hidden' }}>
                    <div style={{ width: stats.bestTimes[difficulty] ? '100%' : '0%', height: '100%', background: style.color }} />
                  </div>
                  <strong style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {stats.bestTimes[difficulty] ? formatTime(stats.bestTimes[difficulty]) : '--:--'}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card table">
          <div className="table-row table-head">
            <span>Date</span>
            <span>Difficulty</span>
            <span>Time</span>
            <span>Score</span>
            <span>Status</span>
          </div>
          {stats.recentGames.length === 0 ? (
            <div style={{ padding: 34, textAlign: 'center', color: 'var(--muted)' }}>No games yet.</div>
          ) : (
            stats.recentGames.slice(0, 10).map((game, index) => {
              const style = DIFF_STYLE[game.difficulty];
              return (
                <div key={`${game.date}-${index}`} className="table-row">
                  <span>{new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>
                    <span className="pill" style={{ color: style.color, background: style.bg }}>{cap(game.difficulty)}</span>
                  </span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{game.won ? formatTime(game.durationSeconds) : '--:--'}</span>
                  <span>{scoreFor(game) || '--'}</span>
                  <strong style={{ color: game.won ? 'var(--green)' : 'var(--red)' }}>{game.won ? 'Won' : 'Lost'}</strong>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
};
