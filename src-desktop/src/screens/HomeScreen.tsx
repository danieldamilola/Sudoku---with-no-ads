import type React from 'react';
import { useState } from "react";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import { useStore } from "../store/useStore";
import { formatTime } from "../utils/time";
import type { Difficulty } from "../types";

const DIFF: Record<
  Difficulty,
  {
    tag: string;
    tier: string;
    desc: string;
    tagColor: string;
  }
> = {
  beginner: {
    tag: "BEGINNER",
    tier: "Beginner",
    desc: "Gentle logic for a quick mental break.",
    tagColor: "#1a7a40",
  },
  skill: {
    tag: "SKILL",
    tier: "Skill",
    desc: "Balanced puzzles for daily focus.",
    tagColor: "#3650d4",
  },
  hard: {
    tag: "HARD",
    tier: "Hard",
    desc: "Complex patterns and deep strategy.",
    tagColor: "#a04f00",
  },
  advanced: {
    tag: "ADVANCED",
    tier: "Advanced",
    desc: "Challenging for experienced players.",
    tagColor: "#c0180f",
  },
  expert: {
    tag: "EXPERT",
    tier: "Expert",
    desc: "Extreme challenges for the dedicated.",
    tagColor: "#c0180f",
  },
  master: {
    tag: "MASTER",
    tier: "Master",
    desc: "Ultimate challenge for Sudoku masters.",
    tagColor: "#6b30d4",
  },
};

interface HomeScreenProps {
  onStartGame: (difficulty: Difficulty) => void;
  onNavigateGame?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onNavigateGame,
}) => {
  const cells = useStore((s) => s.cells);
  const isCompleted = useStore((s) => s.isCompleted);
  const difficulty = useStore((s) => s.difficulty);
  const elapsed = useStore((s) => s.elapsedSeconds);
  const settings = useStore((s) => s.settings);
  const stats = useStore((s) => s.stats);
  const activeGame = cells.length > 0 && !isCompleted;
  const filled = cells.filter((c) => c.value !== null).length;
  const completion = activeGame ? Math.round((filled / 81) * 100) : 0;
  const [showAll, setShowAll] = useState(false);

  const allBestTimes = (
    Object.values(stats.bestTimes) as (number | undefined)[]
  ).filter((t): t is number => !!t);
  const bestTime = allBestTimes.length > 0 ? Math.min(...allBestTimes) : null;

  const getUnlockReq = (d: Difficulty): string | null => {
    if (settings.unlockedDifficulties.includes(d)) return null;
    switch (d) {
      case "hard":
        return `Win ${Math.max(0, 4 - (stats.winsByDifficulty['skill'] ?? 0))} more in Skill`;
      case "advanced":
        return `Win ${Math.max(0, 8 - (stats.winsByDifficulty['hard'] ?? 0))} more in Hard`;
      case "expert":
      case "master":
        return `Win ${Math.max(0, 16 - (stats.winsByDifficulty['advanced'] ?? 0))} more in Advanced`;
      default:
        return null;
    }
  };

  const visible: Difficulty[] = showAll
    ? ["beginner", "skill", "hard", "advanced", "expert", "master"]
    : ["beginner", "skill", "hard", "advanced"];

  return (
    <main className="screen">
      <div className="screen-inner">
        {/* ── Hero ── */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Sudoku</h1>
            <p className="page-subtitle">No ads. No noise. Just the puzzle.</p>
          </div>
        </header>

        {/* ── Continue banner ── */}
        {activeGame && (
          <button
            className="continue-bar"
            type="button"
            onClick={onNavigateGame}
            aria-label={`Continue ${DIFF[difficulty].tier} puzzle — ${completion}% complete`}
            style={{ marginBottom: 40 }}
          >
            <div className="continue-left">
              <div className="continue-heading">Continue</div>
              <div className="continue-detail">
                {DIFF[difficulty].tier}
                {settings.showTimer ? ` • ${formatTime(elapsed)}` : ""}
                {` • ${completion}%`}
              </div>
            </div>
            <ArrowRight size={22} className="continue-chevron" strokeWidth={2} />
            <div className="continue-progress-track">
              <div
                className="continue-progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </button>
        )}

        {/* ── New Game heading ── */}
        <div className="section-head">
          <span className="section-head-title">New game</span>
          <span className="section-head-label">Select difficulty</span>
        </div>

        {/* ── Difficulty grid ── */}
        <section className="difficulty-grid" style={{ marginBottom: 32 }}>
          {visible.map((id) => {
            const item = DIFF[id];
            const isUnlocked = settings.unlockedDifficulties.includes(id);
            const unlockReq = getUnlockReq(id);
            return (
              <button
                key={id}
                className={`difficulty-card${!isUnlocked ? " locked" : ""}`}
                type="button"
                onClick={() => isUnlocked && onStartGame(id)}
                disabled={!isUnlocked}
              >
                <span
                  className="difficulty-pill"
                  style={{
                    color: isUnlocked ? item.tagColor : "var(--muted)",
                    borderColor: isUnlocked ? item.tagColor : "var(--line)",
                  }}
                >
                  {item.tag}
                </span>
                <h2 className="difficulty-tier">{item.tier}</h2>
                <p className="difficulty-desc">{item.desc}</p>
                {unlockReq && (
                  <div className="unlock-req">{unlockReq}</div>
                )}
                {!isUnlocked && (
                  <div className="lock-overlay">
                    <Lock size={24} color="#fff" strokeWidth={2} />
                  </div>
                )}
              </button>
            );
          })}
        </section>

        <button
          className="see-more-btn"
          type="button"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show Less" : "See More"}
          <ChevronDown
            size={20}
            strokeWidth={2}
            className={`see-more-icon ${showAll ? "is-open" : ""}`}
          />
        </button>

        {/* ── Progress strip ── */}
        <div className="section-head">
          <span className="section-head-title">Your progress</span>
        </div>
        <section className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">
              {bestTime ? formatTime(bestTime) : "--:--"}
            </div>
            <div className="stat-label">BEST TIME</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">DAY STREAK</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCompleted}</div>
            <div className="stat-label">SOLVED</div>
          </div>
        </section>
      </div>
    </main>
  );
};
