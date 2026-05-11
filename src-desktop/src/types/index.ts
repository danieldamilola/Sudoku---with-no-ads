export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuCell {
  row: number;
  col: number;
  value: number | null;
  isGiven: boolean;
  notes: number[] | null;
  isError: boolean;
}

export interface GameSnapshot {
  cells: SudokuCell[];
  mistakes: number;
  hintsUsed: number;
  isFailed: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  livePoints: number;
  selectedCellIndex: number | null;
  notesMode: boolean;
}

export interface GameState {
  cells: SudokuCell[];
  solution: number[];
  difficulty: Difficulty;
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
  isPaused: boolean;
  isCompleted: boolean;
  startTime: string | null;
  selectedCellIndex: number | null;
  notesMode: boolean;
  moveHistory: GameSnapshot[];
}

export interface GameSettings {
  darkMode: boolean;
  showMistakes: boolean;
  highlightDuplicates: boolean;
  autoRemoveNotes: boolean;
  mistakeLimit: number;
  showTimer: boolean;
  hintsPerGame: number;
  hapticFeedback: boolean;
  soundEffects: boolean;
}

export interface GameStats {
  totalCompleted: number;
  currentStreak: number;
  bestStreak: number;
  totalMinutesPlayed: number;
  bestTimes: Record<string, number>;
  recentGames: GameRecord[];
}

export interface GameRecord {
  date: string;
  difficulty: Difficulty;
  durationSeconds: number;
  mistakes: number;
  won: boolean;
}

export type Screen = 'home' | 'game' | 'stats' | 'settings';
