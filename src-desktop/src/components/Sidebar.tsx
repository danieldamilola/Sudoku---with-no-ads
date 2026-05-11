import { BarChart2, Grid3x3, SlidersHorizontal } from 'lucide-react';
import { BrandMark } from './BrandMark';
import type { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV = [
  { id: 'home', label: 'Play', Icon: Grid3x3 },
  { id: 'stats', label: 'Statistics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal },
] satisfies { id: Screen; label: string; Icon: typeof Grid3x3 }[];

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate }) => {
  return (
    <aside className="mac-sidebar">
      <div className="traffic" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="brand">
        <div className="brand-mark">
          <BrandMark size={28} />
        </div>
        <div className="brand-title">Sudoku</div>
      </div>

      <nav className="side-nav" aria-label="Main navigation">
        {NAV.map(({ id, label, Icon }) => {
          const active = currentScreen === id;
          return (
            <button
              key={id}
              className={`side-item ${active ? 'active' : ''}`}
              type="button"
              onClick={() => onNavigate(id)}
            >
              <Icon size={17} strokeWidth={2.1} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
