import type React from 'react';
import { useStore } from '../store/useStore';
import { formatDuration, formatTime } from '../utils/time';
import type { Difficulty, GameRecord } from '../types';

const cap = (v: string | undefined) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '?';

const DIFFS: Difficulty[] = ['beginner', 'skill', 'hard', 'advanced', 'expert', 'master'];
const DIFF_STYLE: Record<Difficulty, { barColor: string; iconBg: string; iconColor: string }> = {
  beginner: { barColor: '#1a7a40', iconBg: '#d4f0e0', iconColor: '#1a7a40' },
  skill:    { barColor: '#3650d4', iconBg: '#e8edfb', iconColor: '#3650d4' },
  hard:     { barColor: '#a04f00', iconBg: '#fde8cc', iconColor: '#a04f00' },
  advanced: { barColor: '#c0180f', iconBg: '#fde4e2', iconColor: '#c0180f' },
  expert:   { barColor: '#c0180f', iconBg: '#fde4e2', iconColor: '#c0180f' },
  master:   { barColor: '#6b30d4', iconBg: '#ede6fc', iconColor: '#6b30d4' },
};

const calcPoints = (g: GameRecord) =>
  typeof g.points === 'number' ? g.points : 0;

export const StatisticsScreen: React.FC = () => {
  const stats = useStore((s) => s.stats);

  const getWonFor = (d: Difficulty) => stats.winsByDifficulty[d] ?? 0;
  const getTotalFor = (d: Difficulty) => stats.totalByDifficulty?.[d] ?? 0;
  const totalPlayed = stats.totalGamesPlayed ?? stats.recentGames.length;

  return (
    <main className="screen">
      <div className="screen-inner">
        <header className="page-header">
          <div>
            <h1 className="page-title">Statistics</h1>
            <p className="page-subtitle">Your puzzle solving history at a glance.</p>
          </div>
        </header>

        {/* OVERALL */}
        <div className="section-head">
          <span className="section-head-title">Overall</span>
        </div>
        <section className="stats-bento-grid">
          {[
            { label: 'Total Solved', value: stats.totalCompleted.toString() },
            { label: 'Win Rate', value: totalPlayed > 0
                ? `${Math.round(((stats.gamesWon ?? 0) / totalPlayed) * 100)}%`
                : '--' },
            { label: 'Current Streak', value: `${stats.currentStreak} 🔥` },
            { label: 'Best Streak', value: stats.bestStreak.toString() },
            { label: 'Total Time', value: formatDuration(stats.totalMinutesPlayed) },
          ].map(({ label, value }) => (
            <div key={label} className="stats-bento-card">
              <div className="stats-bento-label">{label}</div>
              <div className="stats-bento-value">{value}</div>
            </div>
          ))}
        </section>

        {/* 30-DAY ACTIVITY */}
        <div className="section-head">
          <span className="section-head-title">30-Day Activity</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
            {stats.currentStreak} day streak
          </span>
        </div>
        <div className="stats-activity-grid">
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const key = d.toDateString();
            const active = stats.recentGames.some(
              (g) => g.won && new Date(g.date).toDateString() === key,
            );
            return (
              <div
                key={i}
                className={`stats-activity-dot ${active ? 'active' : ''}`}
                title={active ? 'Won a game' : 'No win'}
              />
            );
          })}
        </div>

        {/* BY DIFFICULTY */}
        <div className="section-head">
          <span className="section-head-title">By Difficulty</span>
        </div>
        <section className="stats-diff-list">
          {DIFFS.map((d) => {
            const won = getWonFor(d);
            const total = getTotalFor(d);
            const pct = total > 0 ? won / total : 0;
            const s = DIFF_STYLE[d];
            const best = stats.bestTimes[d];
            return (
              <div key={d} className="card stats-bento-card" style={{ padding: 16 }}>
                <div className="stats-diff-row">
                  <span className="stats-diff-name">{cap(d)}</span>
                  <span className="stats-diff-count">{won} won / {total} played</span>
                </div>
                <div className="stats-diff-bar-bg">
                  <div
                    className="stats-diff-bar-fill"
                    style={{
                      width: total > 0 ? `${Math.round(pct * 100)}%` : '0%',
                      background: s.barColor,
                    }}
                  />
                </div>
                <div className="stats-diff-best">
                  BEST: {best ? formatTime(best) : '--:--'}
                </div>
              </div>
            );
          })}
        </section>

        {/* RECENT GAMES */}
        <div className="section-head">
          <span className="section-head-title">Recent Games</span>
        </div>
        <section className="stats-recent-list">
          {stats.recentGames.length === 0 ? (
            <div className="stats-empty">No games yet. Start a puzzle!</div>
          ) : (
            stats.recentGames.slice(0, 10).map((g, idx) => {
              const pts = calcPoints(g);
              const s = DIFF_STYLE[g.difficulty] ?? DIFF_STYLE.beginner;
              const ptsColor = g.won ? 'var(--green)' : 'var(--red)';
              const date = new Date(g.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
              const time = g.won ? formatTime(g.durationSeconds) : 'Failed';
              return (
                <div key={idx} className="stats-recent-row">
                  <div className="stats-game-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                    {g.won ? '✓' : '✗'}
                  </div>
                  <div className="stats-game-info">
                    <div className="stats-game-diff">{cap(g.difficulty)}</div>
                    <div className="stats-game-date">{date} • {time}</div>
                  </div>
                  <div className="stats-game-pts" style={{ color: ptsColor }}>
                    {pts > 0 ? `+${pts} pts` : '0 pts'}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
};
