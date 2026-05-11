import { create } from 'zustand';
import type {
  Difficulty, SudokuCell, GameSnapshot, GameState,
  GameSettings, GameStats, GameRecord,
} from '../types';
import { SudokuGenerator, SudokuValidator } from '../utils/sudoku';

let _timerInterval: ReturnType<typeof setInterval> | null = null;

const defaultSettings: GameSettings = {
  darkMode: false,
  showMistakes: true,
  highlightDuplicates: true,
  autoRemoveNotes: true,
  mistakeLimit: 3,
  showTimer: true,
  hintsPerGame: 3,
  hapticFeedback: false,
  soundEffects: false,
};

const defaultStats: GameStats = {
  totalCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalMinutesPlayed: 0,
  bestTimes: {},
  recentGames: [],
};

const STORAGE_KEY = 'sudoku-desktop-storage';

const POINTS_PER_CELL: Record<string, number> = {
  easy: 10, medium: 20, hard: 30, expert: 50,
};
const MAX_SECOND_CHANCES = 3;

const createSnapshot = (state: GameState): GameSnapshot => ({
  cells: state.cells.map((cell) => ({ ...cell, notes: cell.notes ? [...cell.notes] : null })),
  mistakes: state.mistakes,
  hintsUsed: state.hintsUsed,
  isFailed: 'isFailed' in state ? Boolean((state as GameState & { isFailed?: boolean }).isFailed) : false,
  isPaused: state.isPaused,
  isCompleted: state.isCompleted,
  livePoints: 'livePoints' in state ? Number((state as GameState & { livePoints?: number }).livePoints ?? 0) : 0,
  selectedCellIndex: state.selectedCellIndex,
  notesMode: state.notesMode,
});

interface GameStore extends GameState {
  settings: GameSettings;
  stats: GameStats;
  isFailed: boolean;
  secondChancesUsed: number;
  livePoints: number;
  startNewGame: (difficulty: Difficulty) => void;
  selectCell: (index: number) => void;
  enterNumber: (number: number) => void;
  eraseCell: () => void;
  undoMove: () => void;
  toggleNotesMode: () => void;
  useHint: () => void;
  useSecondChance: () => void;
  togglePause: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateStats: (record: GameRecord) => void;
  resetStats: () => void;
  tick: () => void;
}

const getPersistedState = (state: GameStore) => ({
  settings: state.settings,
  stats: state.stats,
  cells: state.cells,
  solution: state.solution,
  difficulty: state.difficulty,
  elapsedSeconds: state.elapsedSeconds,
  mistakes: state.mistakes,
  hintsUsed: state.hintsUsed,
  isPaused: state.isPaused,
  isCompleted: state.isCompleted,
  isFailed: state.isFailed,
  secondChancesUsed: state.secondChancesUsed,
  livePoints: state.livePoints,
  startTime: state.startTime,
  selectedCellIndex: state.selectedCellIndex,
  notesMode: state.notesMode,
  moveHistory: state.moveHistory,
});

export const useStore = create<GameStore>()((set, get) => ({
  cells: [] as SudokuCell[],
  solution: [] as number[],
  difficulty: 'easy' as Difficulty,
  elapsedSeconds: 0,
  mistakes: 0,
  hintsUsed: 0,
  isPaused: false,
  isCompleted: false,
  isFailed: false,
  secondChancesUsed: 0,
  livePoints: 0,
  startTime: null,
  selectedCellIndex: null,
  notesMode: false,
  moveHistory: [] as GameSnapshot[],
  settings: defaultSettings,
  stats: defaultStats,

  startNewGame: (difficulty: Difficulty) => {
    const { cells, solution } = SudokuGenerator.generatePuzzle(difficulty);
    set({
      cells, solution, difficulty,
      elapsedSeconds: 0, mistakes: 0, hintsUsed: 0,
      isPaused: false, isCompleted: false, isFailed: false,
      secondChancesUsed: 0, livePoints: 0,
      startTime: new Date().toISOString(),
      selectedCellIndex: null, notesMode: false, moveHistory: [],
    });
    get().startTimer();
  },

  selectCell: (index: number) => {
    const state = get();
    if (state.isPaused || state.isCompleted) return;
    set({ selectedCellIndex: index });
  },

  enterNumber: (number: number) => {
    const state = get();
    if (state.isPaused || state.isCompleted) return;
    if (state.selectedCellIndex === null) return;
    const cell = state.cells[state.selectedCellIndex];
    if (cell.isGiven) return;
    const { settings } = state;
    const snapshot = createSnapshot(state);

    if (state.notesMode) {
      const notes = cell.notes ? [...cell.notes] : [];
      const idx = notes.indexOf(number);
      if (idx >= 0) notes.splice(idx, 1); else notes.push(number);
      const updatedCells = [...state.cells];
      updatedCells[state.selectedCellIndex] = { ...cell, notes: notes.length > 0 ? notes : null };
      set({ cells: updatedCells, moveHistory: [...state.moveHistory, snapshot] });
      return;
    }

    const isCorrect = state.solution[cell.row * 9 + cell.col] === number;
    const updatedCells = [...state.cells];
    const pts = POINTS_PER_CELL[state.difficulty] ?? 10;
    updatedCells[state.selectedCellIndex] = { ...cell, value: number, isError: !isCorrect };

    if (isCorrect) {
      if (settings.autoRemoveNotes) {
        const affected = new Set(SudokuValidator.getRelatedCellsIndices(cell.row, cell.col));
        for (const i of affected) {
          const c = updatedCells[i];
          if (!c.isGiven && c.value === null && c.notes?.includes(number)) {
            const newNotes = c.notes.filter((n) => n !== number);
            updatedCells[i] = { ...c, notes: newNotes.length > 0 ? newNotes : null };
          }
        }
      }
      set({ cells: updatedCells, moveHistory: [...state.moveHistory, snapshot], livePoints: state.livePoints + pts });
      if (SudokuValidator.isBoardComplete(updatedCells, state.solution)) {
        set({ isPaused: true, isCompleted: true });
        get().stopTimer();
        get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: state.mistakes, won: true });
      }
    } else {
      const newMistakes = state.mistakes + 1;
      set({ cells: updatedCells, mistakes: newMistakes, moveHistory: [...state.moveHistory, snapshot] });
      if (settings.mistakeLimit > 0 && newMistakes >= settings.mistakeLimit) {
        set({ isPaused: true, isCompleted: true, isFailed: true });
        get().stopTimer();
        get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: newMistakes, won: false });
      }
    }
  },

  eraseCell: () => {
    const state = get();
    if (state.isPaused || state.isCompleted) return;
    if (state.selectedCellIndex === null) return;
    const cell = state.cells[state.selectedCellIndex];
    if (cell.isGiven) return;
    const updatedCells = [...state.cells];
    updatedCells[state.selectedCellIndex] = { ...cell, value: null, notes: null, isError: false };
    set({ cells: updatedCells, moveHistory: [...state.moveHistory, createSnapshot(state)] });
  },

  undoMove: () => {
    const state = get();
    const history = state.moveHistory;
    const previous = history[history.length - 1];
    if (!previous || state.isCompleted) return;
    set({ ...previous, moveHistory: history.slice(0, -1) });
  },

  toggleNotesMode: () => {
    const state = get();
    if (state.isPaused || state.isCompleted) return;
    set((state) => ({ notesMode: !state.notesMode }));
  },

  useHint: () => {
    const state = get();
    if (state.isPaused || state.isCompleted) return;
    if (state.selectedCellIndex === null) return;
    const { settings } = state;
    if (state.hintsUsed >= settings.hintsPerGame) return;
    const cell = state.cells[state.selectedCellIndex];
    if (cell.isGiven || cell.value !== null) return;
    const correctNumber = state.solution[cell.row * 9 + cell.col];
    if (!correctNumber) return;
    const updatedCells = [...state.cells];
    updatedCells[state.selectedCellIndex] = { ...cell, value: correctNumber, notes: null, isError: false };
    if (settings.autoRemoveNotes) {
      const affected = new Set(SudokuValidator.getRelatedCellsIndices(cell.row, cell.col));
      for (const i of affected) {
        const c = updatedCells[i];
        if (!c.isGiven && c.value === null && c.notes?.includes(correctNumber)) {
          const newNotes = c.notes.filter((n) => n !== correctNumber);
          updatedCells[i] = { ...c, notes: newNotes.length > 0 ? newNotes : null };
        }
      }
    }
    const pts = Math.floor((POINTS_PER_CELL[state.difficulty] ?? 10) / 2);
    set({ cells: updatedCells, hintsUsed: state.hintsUsed + 1, livePoints: state.livePoints + pts, moveHistory: [...state.moveHistory, createSnapshot(state)] });
    if (SudokuValidator.isBoardComplete(updatedCells, state.solution)) {
      set({ isPaused: true, isCompleted: true });
      get().stopTimer();
      get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: state.mistakes, won: true });
    }
  },

  useSecondChance: () => {
    const state = get();
    if (state.secondChancesUsed >= MAX_SECOND_CHANCES) return;
    set({
      cells: state.cells.map((cell) => cell.isError ? { ...cell, value: null, isError: false } : cell),
      mistakes: 0,
      isFailed: false,
      isCompleted: false,
      isPaused: false,
      selectedCellIndex: null,
      secondChancesUsed: state.secondChancesUsed + 1,
    });
    get().startTimer();
  },

  togglePause: () => {
    const state = get();
    if (state.isCompleted) return;
    const nowPaused = !state.isPaused;
    set({ isPaused: nowPaused });
    if (nowPaused) get().stopTimer(); else get().startTimer();
  },

  startTimer: () => {
    if (_timerInterval) return;
    _timerInterval = setInterval(() => {
      const s = useStore.getState();
      if (!s.isPaused && !s.isCompleted && s.cells.length > 0) s.tick();
    }, 1000);
  },

  stopTimer: () => {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
  },

  updateStats: (record: GameRecord) => {
    set((state) => {
      const stats = { ...state.stats, recentGames: [...state.stats.recentGames] };
      if (record.won) {
        stats.totalCompleted += 1;
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
        const cur = stats.bestTimes[record.difficulty];
        if (!cur || record.durationSeconds < cur) stats.bestTimes[record.difficulty] = record.durationSeconds;
      } else {
        stats.currentStreak = 0;
      }
      stats.totalMinutesPlayed += Math.floor(record.durationSeconds / 60);
      stats.recentGames = [record, ...stats.recentGames].slice(0, 10);
      return { stats };
    });
  },

  resetStats: () => set({ stats: defaultStats }),

  tick: () => {
    set((state) => {
      if (state.isPaused || state.isCompleted) return state;
      return { elapsedSeconds: state.elapsedSeconds + 1 };
    });
  },
}));

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const persisted = JSON.parse(saved) as Partial<ReturnType<typeof getPersistedState>>;
    useStore.setState((state) => ({
      ...state,
      ...persisted,
      settings: { ...defaultSettings, ...persisted.settings },
      stats: { ...defaultStats, ...persisted.stats },
      moveHistory: persisted.moveHistory ?? [],
    }));
  }
} catch {}

useStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState(state)));
  } catch {}
});
