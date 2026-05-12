// ─── Profile Screen (Desktop) ─────────────────────────────────────────────────────
import React, { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../store/useStore";

export const ProfileScreen: React.FC = () => {
  const { displayName, setDisplayName } = useAuth();
  const stats = useStore((s) => s.stats);
  const resetStats = useStore((s) => s.resetStats);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const initial = (displayName || "A")[0].toUpperCase();

  const handleSave = async () => {
    if (draft.trim()) {
      await setDisplayName(draft.trim());
    }
    setEditing(false);
  };

  return (
    <main className="screen">
      <div className="screen-inner">
        {/* ── Identity ── */}
        <section style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "var(--bg)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {initial}
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                  style={{ fontSize: 22, fontWeight: 700, border: "none", borderBottom: "2px solid var(--ink)", outline: "none", background: "transparent", color: "var(--ink)", width: "100%", paddingBottom: 2 }}
                />
                <button type="button" onClick={handleSave} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)" }}>
                  <Check size={20} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  {displayName || "Anonymous"}
                </h1>
                <button type="button" onClick={() => { setDraft(displayName); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", marginTop: 2 }}>
                  <Pencil size={16} strokeWidth={2} />
                </button>
              </div>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
              This name is shown to opponents in multiplayer
            </p>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="section-head">
          <span className="section-head-title">Your Stats</span>
        </div>
        <div className="stat-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCompleted}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.bestStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>

        {/* ── Danger ── */}
        <div className="section-head">
          <span className="section-head-title">Data</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => { if (confirm("Reset all stats? This cannot be undone.")) resetStats(); }}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 20px", color: "var(--red)", fontSize: 15, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Trash2 size={18} strokeWidth={1.8} />
            Reset Local Stats
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 24 }}>
          Sudoku 1.5.0
        </p>
      </div>
    </main>
  );
};
