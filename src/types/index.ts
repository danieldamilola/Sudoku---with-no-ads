export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Expert = 'expert',
}

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
  isPaused: boolean;
  isCompleted: boolean;
  selectedCellIndex: number | null;
  notesMode: boolean;
}

export interface GameState {
  cells: SudokuCell[];
  /** Flat 81-element array of the complete solution (index = row*9+col). */
  solution: number[];
  difficulty: Difficulty;
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
  isPaused: boolean;
  isCompleted: boolean;
  startTime: Date | null;
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
  date: Date;
  difficulty: Difficulty;
  durationSeconds: number;
  mistakes: number;
  won: boolean;
}
