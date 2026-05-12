import type React from "react";
import { Lock } from "lucide-react";
import { useStore } from "../store/useStore";
import type { Difficulty } from "../types";

const DIFF: Record<Difficulty, { tier: string; desc: string }> = {
  beginner: {
    tier: "Beginner",
    desc: "Gentle logic for a quick mental break.",
  },
  skill: { tier: "Skill", desc: "Balanced puzzles for daily focus." },
  hard: { tier: "Hard", desc: "Complex patterns and deep strategy." },
  advanced: { tier: "Advanced", desc: "Challenging for experienced players." },
  expert: { tier: "Expert", desc: "Extreme challenges for the dedicated." },
  master: { tier: "Master", desc: "Ultimate challenge for Sudoku masters." },
};

const DIFFS: Difficulty[] = [
  "beginner",
  "skill",
  "hard",
  "advanced",
  "expert",
  "master",
];

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
  const settings = useStore((s) => s.settings);
  const stats = useStore((s) => s.stats);
  const activeGame = cells.length > 0 && !isCompleted;
  const filled = cells.filter((c) => c.value !== null).length;
  const completion = activeGame ? Math.round((filled / 81) * 100) : 0;

  const getUnlockReq = (d: Difficulty): string | null => {
    if (settings.unlockedDifficulties.includes(d)) return null;
    switch (d) {
      case "hard":
        return `Win ${Math.max(0, 4 - (stats.winsByDifficulty["skill"] ?? 0))} more in Skill`;
      case "advanced":
        return `Win ${Math.max(0, 8 - (stats.winsByDifficulty["hard"] ?? 0))} more in Hard`;
      case "expert":
      case "master":
        return `Win ${Math.max(0, 16 - (stats.winsByDifficulty["advanced"] ?? 0))} more in Advanced`;
      default:
        return null;
    }
  };

  return (
    <main className="screen">
      <div className="screen-inner">
        <h1
          style={{
            margin: "0 0 var(--space-3)",
            fontSize: "clamp(2.5rem, 3vw + 1rem, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          Sudoku
        </h1>
        <p
          style={{
            margin: "0 0 var(--space-7)",
            fontSize: 15,
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: "var(--muted)",
            maxWidth: "36ch",
          }}
        >
          No ads. No noise. Just the puzzle.
        </p>

        {/* ── Stats ── */}
        <p
          style={{
            margin: "0 0 var(--space-8)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--faint)",
            fontFamily: "var(--sys-mono)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {stats.totalCompleted} solved · {stats.currentStreak} day streak
        </p>

        {/* ── Continue (segmented progress) ── */}
        {activeGame && (
          <button
            className="continue-bar"
            type="button"
            onClick={onNavigateGame}
            style={{ marginBottom: "var(--space-8)" }}
          >
            <div className="continue-left">
              <div className="continue-heading">Continue</div>
              <div className="continue-detail">
                {DIFF[difficulty].tier} · {completion}%
              </div>
            </div>
            <span className="continue-chevron">→</span>
            <div className="continue-progress-track">
              <div
                className="continue-progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </button>
        )}

        {/* ── Difficulty (dot-matrix indicators) ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DIFFS.map((id) => {
            const item = DIFF[id];
            const isUnlocked = settings.unlockedDifficulties.includes(id);
            const unlockReq = getUnlockReq(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => isUnlocked && onStartGame(id)}
                disabled={!isUnlocked}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  width: "100%",
                  padding: "var(--space-4) 0",
                  textAlign: "left",
                  cursor: isUnlocked ? "pointer" : "default",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--hairline)",
                  opacity: isUnlocked ? 1 : 0.4,
                  transition: "opacity 180ms var(--ease-out)",
                }}
              >
                {/* Dot indicator */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 3px)",
                    gridTemplateRows: "repeat(2, 3px)",
                    gap: 2,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 0.5,
                      background: isUnlocked ? "var(--ink)" : "transparent",
                      boxShadow: isUnlocked ? "none" : "inset 0 0 0 1px var(--line-strong)",
                    }}
                  />
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 0.5,
                      background: isUnlocked ? "var(--ink)" : "transparent",
                      boxShadow: isUnlocked ? "none" : "inset 0 0 0 1px var(--line-strong)",
                    }}
                  />
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 0.5,
                      background: "transparent",
                      boxShadow: "inset 0 0 0 1px var(--line-strong)",
                    }}
                  />
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 0.5,
                      background: "transparent",
                      boxShadow: "inset 0 0 0 1px var(--line-strong)",
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      color: "var(--ink)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {item.tier}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.45,
                      color: "var(--muted)",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    flexShrink: 0,
                  }}
                >
                  {unlockReq && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        color: "var(--muted)",
                        fontFamily: "var(--sys-mono)",
                        textAlign: "right",
                      }}
                    >
                      {unlockReq}
                    </span>
                  )}
                  {!isUnlocked ? (
                    <Lock
                      size={11}
                      style={{ color: "var(--muted)", flexShrink: 0 }}
                      strokeWidth={2}
                    />
                  ) : (
                    <span
                      style={{
                        color: "var(--ink)",
                        fontSize: 14,
                        flexShrink: 0,
                        opacity: 0.4,
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
};
