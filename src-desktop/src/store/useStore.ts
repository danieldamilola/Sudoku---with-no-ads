import { create } from 'zustand';
import { pushStats, pushSettings, pushActiveGame, initialSync } from '../lib/sync';
import type {
  Difficulty, SudokuCell, GameSnapshot, GameState,
  GameSettings, GameStats, GameRecord,
} from '../types';
import { SudokuGenerator, SudokuValidator } from '../utils/sudoku';

let _unsubscribeRealtime: (() => void) | null = null;

let _timerInterval: ReturnType<typeof setInterval> | null = null;
let _persistTimer: ReturnType<typeof setTimeout> | null = null;

export const MAX_SECOND_CHANCES = 3;

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
  unlockedDifficulties: ['beginner', 'skill'],
  zoomLevel: 100,
};

const defaultStats: GameStats = {
  totalCompleted: 0,
  gamesWon: 0,
  totalGamesPlayed: 0,
  winsByDifficulty: {},
  totalByDifficulty: {},
  currentStreak: 0,
  bestStreak: 0,
  lastWinDate: null,
  totalMinutesPlayed: 0,
  bestTimes: {},
  recentGames: [],
};

const GUEST_STORAGE_KEY = 'sudoku-desktop-guest-storage';
const userStorageKey = (userId: string) => `sudoku-desktop-user-storage:${userId}`;

const POINTS_PER_CELL: Record<string, number> = {
  beginner: 5,
  skill: 10,
  hard: 20,
  advanced: 30,
  expert: 50,
  master: 75,
};

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
  combo: number;
  // Sync
  syncEnabled: boolean;
  activeUserId: string | null;
  dataMode: 'guest' | 'account';
  syncToCloud: (userId: string) => Promise<void>;
  syncFromCloud: (userId: string) => Promise<void>;
  applyCloudSync: (remoteStats: GameStats, remoteSettings: GameSettings) => void;
  enableSync: (userId: string) => Promise<void>;
  disableSync: () => void;
  syncAfterGame: () => Promise<void>;
  pushActiveGameToCloud: () => Promise<void>;
  switchToGuest: () => void;
  switchToAccount: (userId: string) => Promise<void>;
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
  setZoomLevel: (level: number) => void;
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
  difficulty: 'beginner' as Difficulty,
  elapsedSeconds: 0,
  mistakes: 0,
  hintsUsed: 0,
  isPaused: false,
  isCompleted: false,
  isFailed: false,
  secondChancesUsed: 0,
  livePoints: 0,
  combo: 0,
  startTime: null,
  selectedCellIndex: null,
  notesMode: false,
  moveHistory: [] as GameSnapshot[],
  settings: defaultSettings,
  stats: defaultStats,
  syncEnabled: false,
  activeUserId: null,
  dataMode: 'guest',

  syncToCloud: async (userId: string) => {
    const state = get();
    await Promise.all([
      pushStats(userId, state.stats),
      pushSettings(userId, state.settings),
    ]);
  },


  applyCloudSync: (remoteStats: GameStats, remoteSettings: GameSettings) => {
    const local = get();
    const localKeys = new Set(
      local.stats.recentGames.map((g) => new Date(g.date).toISOString())
    );
    const mergedGames = [...local.stats.recentGames];
    for (const g of remoteStats.recentGames ?? []) {
      if (!localKeys.has(new Date(g.date).toISOString())) mergedGames.push(g);
    }
    // Merge totalByDifficulty: take max per difficulty key from both sources
    const allDiffs = new Set([
      ...Object.keys(local.stats.totalByDifficulty ?? {}),
      ...Object.keys(remoteStats.totalByDifficulty ?? {}),
    ]);
    const mergedTotalByDiff: Partial<Record<string, number>> = {};
    for (const d of allDiffs) {
      mergedTotalByDiff[d] = Math.max(
        (local.stats.totalByDifficulty as Record<string, number>)[d] ?? 0,
        (remoteStats.totalByDifficulty as Record<string, number>)[d] ?? 0,
      );
    }
    // lastWinDate: keep whichever is more recent
    const localWin  = local.stats.lastWinDate  ? new Date(local.stats.lastWinDate).getTime()  : 0;
    const remoteWin = remoteStats.lastWinDate ? new Date(remoteStats.lastWinDate).getTime() : 0;
    const mergedLastWinDate = localWin >= remoteWin ? local.stats.lastWinDate : remoteStats.lastWinDate;

    set({
      stats: {
        ...local.stats,
        totalCompleted:    Math.max(local.stats.totalCompleted, remoteStats.totalCompleted),
        gamesWon:          Math.max(local.stats.gamesWon ?? 0, remoteStats.gamesWon ?? 0),
        totalGamesPlayed:  Math.max(local.stats.totalGamesPlayed ?? 0, remoteStats.totalGamesPlayed ?? 0),
        winsByDifficulty:  { ...remoteStats.winsByDifficulty, ...local.stats.winsByDifficulty },
        totalByDifficulty: mergedTotalByDiff as Partial<Record<import('../types').Difficulty, number>>,
        lastWinDate:       mergedLastWinDate,
        currentStreak:     Math.max(local.stats.currentStreak, remoteStats.currentStreak),
        bestStreak:        Math.max(local.stats.bestStreak, remoteStats.bestStreak),
        totalMinutesPlayed: Math.max(local.stats.totalMinutesPlayed, remoteStats.totalMinutesPlayed ?? 0),
        bestTimes:         { ...remoteStats.bestTimes, ...local.stats.bestTimes },
        recentGames:       mergedGames.slice(-50),
      },
      settings: {
        ...remoteSettings,
        unlockedDifficulties: local.settings.unlockedDifficulties,
      },
    });
  },

  syncFromCloud: async (userId: string) => {
    try {
      const { stats, settings, activeGame } = await initialSync(userId);
      get().applyCloudSync(stats, settings);
      if (activeGame && !get().isCompleted && get().cells.length === 0) {
        set(activeGame);
      }
    } catch (e) {
      console.warn('syncFromCloud failed:', e);
    }
  },

  switchToGuest: () => {
    set({ dataMode: 'guest', activeUserId: null, syncEnabled: false });
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) {
      set({ settings: defaultSettings, stats: defaultStats, cells: [], solution: [] });
      return;
    }
    const persisted = JSON.parse(raw) as Partial<ReturnType<typeof getPersistedState>>;
    set((state) => ({
      ...state,
      ...persisted,
      settings: { ...defaultSettings, ...persisted.settings },
      stats: { ...defaultStats, ...persisted.stats },
      moveHistory: persisted.moveHistory ?? [],
    }));
  },

  switchToAccount: async (userId: string) => {
    set({
      dataMode: 'account',
      activeUserId: userId,
      cells: [],
      solution: [],
      difficulty: 'beginner' as Difficulty,
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
      moveHistory: [],
      settings: defaultSettings,
      stats: defaultStats,
    });

    const cached = localStorage.getItem(userStorageKey(userId));
    if (cached) {
      const persisted = JSON.parse(cached) as Partial<ReturnType<typeof getPersistedState>>;
      set((state) => ({
        ...state,
        ...persisted,
        settings: { ...defaultSettings, ...persisted.settings },
        stats: { ...defaultStats, ...persisted.stats },
        moveHistory: persisted.moveHistory ?? [],
      }));
    }

    await get().syncFromCloud(userId);
  },

  enableSync: async (userId: string) => {
    set({ syncEnabled: true, activeUserId: userId });
    await get().syncFromCloud(userId);
  },

  syncAfterGame: async () => {
    const { activeUserId, stats, settings } = get();
    if (!activeUserId) return;
    try {
      await Promise.all([
        pushStats(activeUserId, stats),
        pushSettings(activeUserId, settings),
      ]);
    } catch (e) {
      console.warn('syncAfterGame failed:', e);
    }
  },

  pushActiveGameToCloud: async () => {
    const state = get();
    if (!state.activeUserId || !state.cells.length || state.isCompleted) return;
    try {
      await pushActiveGame(state.activeUserId, state);
    } catch (e) {
      console.warn('pushActiveGameToCloud failed:', e);
    }
  },

  disableSync: () => {
    if (_unsubscribeRealtime) { _unsubscribeRealtime(); _unsubscribeRealtime = null; }
    set({ syncEnabled: false });
  },

  startNewGame: (difficulty: Difficulty) => {
    const { cells, solution } = SudokuGenerator.generatePuzzle(difficulty);
    set({
      cells, solution, difficulty,
      elapsedSeconds: 0, mistakes: 0, hintsUsed: 0,
      isPaused: false, isCompleted: false, isFailed: false,
      secondChancesUsed: 0, livePoints: 0, combo: 0,
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
      set({ cells: updatedCells, moveHistory: [...state.moveHistory, snapshot].slice(-50) });
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

      // Combo scoring logic
      const newCombo = state.combo + 1;
      let pointsEarned = pts;
      if (newCombo >= 3) {
        const comboTotal = newCombo * 10;
        const bonus = Math.floor(comboTotal / 2);
        pointsEarned += bonus;
      }

      set({ 
        cells: updatedCells, 
        moveHistory: [...state.moveHistory, snapshot].slice(-50), 
        livePoints: state.livePoints + pointsEarned,
        combo: newCombo
      });

      // Reset combo after 3 seconds
      setTimeout(() => {
        const currentState = get();
        if (currentState.combo === newCombo) {
          set({ combo: 0 });
        }
      }, 3000);

      if (SudokuValidator.isBoardComplete(updatedCells, state.solution)) {
        set({ isPaused: true, isCompleted: true, combo: 0 });
        get().stopTimer();
        get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: state.mistakes, won: true, points: state.livePoints + pointsEarned });
        get().syncAfterGame();
      }
    } else {
      const newMistakes = state.mistakes + 1;
      set({ cells: updatedCells, mistakes: newMistakes, moveHistory: [...state.moveHistory, snapshot].slice(-50), combo: 0 });
      if (settings.mistakeLimit > 0 && newMistakes >= settings.mistakeLimit) {
        set({ isPaused: true, isCompleted: true, isFailed: true });
        get().stopTimer();
        get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: newMistakes, won: false, points: 0 });
        get().syncAfterGame();
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
    set({ cells: updatedCells, moveHistory: [...state.moveHistory, createSnapshot(state)].slice(-50) });
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
    set({ cells: updatedCells, hintsUsed: state.hintsUsed + 1, livePoints: state.livePoints + pts, moveHistory: [...state.moveHistory, createSnapshot(state)].slice(-50) });
    if (SudokuValidator.isBoardComplete(updatedCells, state.solution)) {
      set({ isPaused: true, isCompleted: true });
      get().stopTimer();
      get().updateStats({ date: new Date().toISOString(), difficulty: state.difficulty, durationSeconds: state.elapsedSeconds, mistakes: state.mistakes, won: true, points: state.livePoints + pts });
      get().syncAfterGame();
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

  setZoomLevel: (level: number) => {
    set((state) => ({ settings: { ...state.settings, zoomLevel: Math.max(65, Math.min(100, level)) } }));
  },

  updateStats: (record: GameRecord) => {
    set((state) => {
      const stats = {
        ...state.stats,
        recentGames: [...state.stats.recentGames],
        winsByDifficulty: { ...state.stats.winsByDifficulty },
        totalByDifficulty: { ...state.stats.totalByDifficulty },
        bestTimes: { ...state.stats.bestTimes },
      };
      const settings = { ...state.settings };

      // All-time totals — always increment regardless of win/loss
      stats.totalGamesPlayed = (stats.totalGamesPlayed ?? 0) + 1;
      stats.totalByDifficulty[record.difficulty] = ((stats.totalByDifficulty[record.difficulty] ?? 0) + 1);

      if (record.won) {
        stats.totalCompleted += 1;
        stats.gamesWon = (stats.gamesWon ?? 0) + 1;
        stats.winsByDifficulty[record.difficulty] = ((stats.winsByDifficulty[record.difficulty] ?? 0) + 1);

        // Day-streak: increment only if today or yesterday was last win date
        const today = new Date().toDateString();
        const lastWin = stats.lastWinDate ? new Date(stats.lastWinDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastWin === today) {
          // already won today — streak unchanged
        } else if (!lastWin || lastWin === yesterday) {
          // first win ever, or consecutive day
          stats.currentStreak += 1;
        } else {
          // gap of more than one day — reset
          stats.currentStreak = 1;
        }
        stats.lastWinDate = new Date().toISOString();
        if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;

        const cur = stats.bestTimes[record.difficulty];
        if (!cur || record.durationSeconds < cur) stats.bestTimes[record.difficulty] = record.durationSeconds;

        // Unlock logic — uses persistent winsByDifficulty, not capped recentGames
        const winsForDiff = stats.winsByDifficulty[record.difficulty] ?? 0;
        const unlocked = new Set(settings.unlockedDifficulties);
        if (record.difficulty === 'skill' && winsForDiff >= 4 && !unlocked.has('hard')) unlocked.add('hard');
        if (record.difficulty === 'hard' && winsForDiff >= 8 && !unlocked.has('advanced')) unlocked.add('advanced');
        if (record.difficulty === 'advanced' && winsForDiff >= 16) {
          if (!unlocked.has('expert')) unlocked.add('expert');
          if (!unlocked.has('master')) unlocked.add('master');
        }
        settings.unlockedDifficulties = Array.from(unlocked);
      } else {
        // Loss breaks the streak only if not already won today
        const today = new Date().toDateString();
        const lastWin = stats.lastWinDate ? new Date(stats.lastWinDate).toDateString() : null;
        if (lastWin !== today) stats.currentStreak = 0;
      }

      stats.totalMinutesPlayed += Math.floor(record.durationSeconds / 60);
      stats.recentGames = [record, ...stats.recentGames].slice(0, 50);
      return { stats, settings };
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
  const saved = localStorage.getItem(GUEST_STORAGE_KEY);
  if (saved) {
    try {
      const persisted = JSON.parse(saved) as Partial<ReturnType<typeof getPersistedState>>;
      useStore.setState((state) => ({
        ...state,
        ...persisted,
        settings: { ...defaultSettings, ...persisted.settings },
        stats: { ...defaultStats, ...persisted.stats },
        moveHistory: persisted.moveHistory ?? [],
      }));
    } catch (err) {
      console.error('Failed to load persisted state:', err);
    }
  }
} catch (err) {
  console.error('Failed to access localStorage:', err);
}

useStore.subscribe((state) => {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => {
    try {
      const mode = state.dataMode;
      const userId = state.activeUserId;
      const key = mode === 'account' && userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(getPersistedState(state)));
    } catch (err) {
      console.error('Failed to persist state:', err);
    }
  }, 500);
});
