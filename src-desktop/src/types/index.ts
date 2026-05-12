export type Difficulty = 'beginner' | 'skill' | 'hard' | 'advanced' | 'expert' | 'master';

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
  unlockedDifficulties: Difficulty[];
  zoomLevel: number;
}

export interface GameStats {
  totalCompleted: number;
  gamesWon: number;
  totalGamesPlayed: number;          // all-time played (wins + losses)
  winsByDifficulty: Partial<Record<Difficulty, number>>;
  totalByDifficulty: Partial<Record<Difficulty, number>>; // all-time played per diff
  currentStreak: number;
  bestStreak: number;
  lastWinDate: string | null;        // ISO date string of last win (for day-streak)
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
  points: number; // points earned this game
}

export type Screen = 'home' | 'game' | 'stats' | 'settings' | 'profile' | 'multiplayer';
