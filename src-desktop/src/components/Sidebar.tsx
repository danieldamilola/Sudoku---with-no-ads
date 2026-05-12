import type React from 'react';
import { BarChart2, Grid3x3, SlidersHorizontal, User, Users } from "lucide-react";
import { BrandMark } from "./BrandMark";
import type { Screen } from "../types";

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  displayName: string;
}

const NAV = [
  { id: "home" as Screen,        label: "Play",        Icon: Grid3x3 },
  { id: "multiplayer" as Screen, label: "Multiplayer", Icon: Users },
  { id: "stats" as Screen,       label: "Statistics",  Icon: BarChart2 },
  { id: "settings" as Screen,    label: "Settings",    Icon: SlidersHorizontal },
  { id: "profile" as Screen,     label: "Profile",     Icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, displayName }) => {
  return (
    <aside className="mac-sidebar" role="navigation" aria-label="Main navigation">
      <div className="traffic" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="brand">
        <div className="brand-mark"><BrandMark size={28} /></div>
        <div className="brand-title">Sudoku</div>
      </div>

      <nav className="side-nav">
        {NAV.map(({ id, label, Icon }) => {
          const active = currentScreen === id;
          return (
            <button
              key={id}
              className={`side-item ${active ? "active" : ""}`}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-account">
        <div className="sidebar-user-row">
          <div className="sidebar-user-avatar">
            <User size={14} color="var(--ink)" />
          </div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">{displayName || "Anonymous"}</div>
            <div className="sidebar-user-email">Change in Profile</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
