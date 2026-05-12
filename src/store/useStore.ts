import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, GameState, GameSettings, GameStats, GameRecord, GameSnapshot, SudokuCell } from '../types';
import { SudokuGenerator, SudokuValidator } from '../utils/sudoku';
import * as Haptics from 'expo-haptics';
import { pushStats, pushSettings, pushActiveGame, initialSync, subscribeToStats, subscribeToSettings } from '../lib/sync';

let _unsubscribeRealtime: (() => void) | null = null;

// Module-level singleton so React StrictMode double-mount never creates 2 intervals
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
  hapticFeedback: true,
  soundEffects: false,
  unlockedDifficulties: [Difficulty.Beginner, Difficulty.Skill],
};

const defaultStats: GameStats = {
  totalCompleted: 0,
  gamesWon: 0,
  winsByDifficulty: {},
  currentStreak: 0,
  bestStreak: 0,
  totalMinutesPlayed: 0,
  bestTimes: {},
  recentGames: [],
};

const GUEST_STORAGE_KEY = 'sudoku-guest-storage';
const userStorageKey = (userId: string) => `sudoku-user-storage:${userId}`;

const createSnapshot = (state: GameState): GameSnapshot => ({
  cells: state.cells.map((cell) => ({
    ...cell,
    notes: cell.notes ? [...cell.notes] : null,
  })),
  mistakes: state.mistakes,
  hintsUsed: state.hintsUsed,
  isPaused: state.isPaused,
  isCompleted: state.isCompleted,
  selectedCellIndex: state.selectedCellIndex,
  notesMode: state.notesMode,
});

const POINTS_PER_CELL: Record<string, number> = {
  beginner: 5,
  skill: 10,
  hard: 20,
  advanced: 30,
  expert: 50,
  master: 75,
};

interface GameStore extends GameState {
  settings: GameSettings;
  stats: GameStats;
  // Second-chance & scoring
  isFailed: boolean;
  secondChancesUsed: number;
  livePoints: number;
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
  switchToGuest: () => Promise<void>;
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
  pauseGame: () => void;       // force-pause (called on blur / background)
  resumeGame: () => void;      // force-resume (called on focus)
  startTimer: () => void;      // starts the singleton interval
  stopTimer: () => void;       // clears the singleton interval
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

type PersistedState = ReturnType<typeof getPersistedState>;

export const useStore = create<GameStore>()(
    (set, get) => ({
      cells: [] as SudokuCell[],
      solution: [] as number[],
      difficulty: Difficulty.Beginner,
      elapsedSeconds: 0,
      mistakes: 0,
      hintsUsed: 0,
      isPaused: false,
      isCompleted: false,
      isFailed: false,
      secondChancesUsed: 0,
      livePoints: 0,
      startTime: null as string | null,
      selectedCellIndex: null as number | null,
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
          pushActiveGame(userId, state),
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
        set({
          stats: {
            ...local.stats,
            totalCompleted: Math.max(local.stats.totalCompleted, remoteStats.totalCompleted),
            gamesWon: Math.max(local.stats.gamesWon ?? 0, remoteStats.gamesWon ?? 0),
            winsByDifficulty: {
              ...remoteStats.winsByDifficulty,
              ...local.stats.winsByDifficulty,
            },
            currentStreak: Math.max(local.stats.currentStreak, remoteStats.currentStreak),
            bestStreak: Math.max(local.stats.bestStreak, remoteStats.bestStreak),
            bestTimes: { ...remoteStats.bestTimes, ...local.stats.bestTimes },
            recentGames: mergedGames.slice(-50),
          },
          settings: {
            ...remoteSettings,
            unlockedDifficulties: local.settings.unlockedDifficulties,
          },
        });
      },

      syncFromCloud: async (userId: string) => {
        const { stats, settings, activeGame } = await initialSync(userId);
        set({
          stats,
          settings,
          ...(activeGame
            ? {
                cells: activeGame.cells ?? [],
                solution: activeGame.solution ?? [],
                difficulty: activeGame.difficulty ?? Difficulty.Beginner,
                elapsedSeconds: activeGame.elapsedSeconds ?? 0,
                mistakes: activeGame.mistakes ?? 0,
                hintsUsed: activeGame.hintsUsed ?? 0,
                isPaused: activeGame.isPaused ?? false,
                isCompleted: activeGame.isCompleted ?? false,
                selectedCellIndex: activeGame.selectedCellIndex ?? null,
                notesMode: activeGame.notesMode ?? false,
              }
            : {
                // Fresh account, no cloud game loaded
                cells: [],
                solution: [],
                difficulty: Difficulty.Beginner,
                elapsedSeconds: 0,
                mistakes: 0,
                hintsUsed: 0,
                isPaused: false,
                isCompleted: false,
                selectedCellIndex: null,
                notesMode: false,
              }),
        });
      },

      switchToGuest: async () => {
        // persist current (account) state automatically via subscription
        set({ dataMode: 'guest', activeUserId: null, syncEnabled: false });
        const raw = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
        if (!raw) {
          set({ settings: defaultSettings, stats: defaultStats, cells: [], solution: [] });
          return;
        }
        const persistedState = JSON.parse(raw) as Partial<PersistedState>;
        set((state) => ({
          ...state,
          ...persistedState,
          settings: { ...defaultSettings, ...persistedState.settings },
          stats: { ...defaultStats, ...persistedState.stats },
          moveHistory: persistedState.moveHistory ?? [],
        }));
      },

      switchToAccount: async (userId: string) => {
        // Account always overwrites guest/local data (fresh account if no cloud data)
        set({
          dataMode: 'account',
          activeUserId: userId,
          cells: [],
          solution: [],
          difficulty: Difficulty.Beginner,
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

        // Load per-user local cache first (fast), then overwrite with cloud
        const cached = await AsyncStorage.getItem(userStorageKey(userId));
        if (cached) {
          const persistedState = JSON.parse(cached) as Partial<PersistedState>;
          set((state) => ({
            ...state,
            ...persistedState,
            settings: { ...defaultSettings, ...persistedState.settings },
            stats: { ...defaultStats, ...persistedState.stats },
            moveHistory: persistedState.moveHistory ?? [],
          }));
        }

        await get().syncFromCloud(userId);
      },

      enableSync: async (userId: string) => {
        if (_unsubscribeRealtime) { _unsubscribeRealtime(); _unsubscribeRealtime = null; }
        try {
          const result = await initialSync(userId);
          if (result) {
            const isNewAccount =
              result.stats.totalCompleted === 0 &&
              Object.keys(result.stats.bestTimes).length === 0;
            if (isNewAccount) {
              // Brand new account — push local guest progress to cloud
              await pushStats(userId, get().stats);
              await pushSettings(userId, get().settings);
            } else {
              // Existing account — merge remote into local
              get().applyCloudSync(result.stats, result.settings);
            }
            set({ syncEnabled: true });
          }
        } catch (e) {
          console.warn('Sync pull failed, using local data:', e);
        }
        const unsubStats = subscribeToStats(userId, (remoteRow) => {
          const s = get().stats;
          set({
            stats: {
              ...s,
              totalCompleted: remoteRow.games_played,
              gamesWon: remoteRow.games_won,
              currentStreak: remoteRow.current_streak,
              bestStreak: remoteRow.best_streak,
            },
          });
        });
        const unsubSettings = subscribeToSettings(userId, (remoteRow) => {
          const s = get().settings;
          set({
            settings: {
              ...s,
              darkMode: remoteRow.dark_mode,
              showMistakes: remoteRow.show_mistakes,
              highlightDuplicates: remoteRow.highlight_duplicates,
              autoRemoveNotes: remoteRow.auto_remove_notes,
              mistakeLimit: remoteRow.mistake_limit,
              showTimer: remoteRow.show_timer,
            },
          });
        });
        _unsubscribeRealtime = () => { unsubStats(); unsubSettings(); };
      },

      syncAfterGame: async () => {
        const state = get();
        if (!state.activeUserId) return;
        try {
          await Promise.all([
            pushStats(state.activeUserId, state.stats),
            pushSettings(state.activeUserId, state.settings),
          ]);
        } catch (e) {
          console.warn('Sync after game failed:', e);
        }
      },

      pushActiveGameToCloud: async () => {
        const state = get();
        if (!state.activeUserId || state.cells.length === 0) return;
        try {
          await pushActiveGame(state.activeUserId, state);
        } catch (e) {
          console.warn('Active game push failed:', e);
        }
      },

      disableSync: () => {
        if (_unsubscribeRealtime) { _unsubscribeRealtime(); _unsubscribeRealtime = null; }
        set({ syncEnabled: false });
      },

      startNewGame: (difficulty: Difficulty) => {
        const { cells, solution } = SudokuGenerator.generatePuzzle(difficulty);
        set({
          cells,
          solution,
          difficulty,
          elapsedSeconds: 0,
          mistakes: 0,
          hintsUsed: 0,
          isPaused: false,
          isCompleted: false,
          isFailed: false,
          secondChancesUsed: 0,
          livePoints: 0,
          startTime: new Date().toISOString(),
          selectedCellIndex: null,
          notesMode: false,
          moveHistory: [],
        });
      },

      selectCell: (index: number) => {
        const { settings } = get();
        set({ selectedCellIndex: index });
        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      enterNumber: (number: number) => {
        const state = get();
        if (state.selectedCellIndex === null) return;

        const cell = state.cells[state.selectedCellIndex];
        if (cell.isGiven) return;

        const { settings } = get();
        const snapshot = createSnapshot(state);

        // ── Notes mode ────────────────────────────────────────────────────────
        if (state.notesMode) {
          const notes = cell.notes ? [...cell.notes] : [];
          const noteIndex = notes.indexOf(number);
          if (noteIndex >= 0) notes.splice(noteIndex, 1);
          else notes.push(number);

          const updatedCells = [...state.cells];
          updatedCells[state.selectedCellIndex] = {
            ...cell,
            notes: notes.length > 0 ? notes : null,
          };
          set({ cells: updatedCells, moveHistory: [...(state.moveHistory ?? []), snapshot].slice(-50) });
          if (settings.hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return;
        }

        // ── Normal mode ───────────────────────────────────────────────────────
        // Correctness is ALWAYS checked — showMistakes only controls visual display
        const isCorrect = state.solution[cell.row * 9 + cell.col] === number;
        const updatedCells = [...state.cells];
        const cellIndex = state.selectedCellIndex;
        const pts = POINTS_PER_CELL[state.difficulty] ?? 10;

        // Mark the error internally; getCellBg uses showMistakes to decide whether to show it
        updatedCells[cellIndex] = { ...cell, value: number, isError: !isCorrect };

        if (isCorrect) {
          // ── Correct entry ──────────────────────────────────────────────────
          if (settings.autoRemoveNotes) {
            const affectedIndices = new Set(
              SudokuValidator.getRelatedCellsIndices(cell.row, cell.col)
            );
            for (const i of affectedIndices) {
              const c = updatedCells[i];
              if (!c.isGiven && c.value === null && c.notes?.includes(number)) {
                const newNotes = c.notes.filter((n) => n !== number);
                updatedCells[i] = { ...c, notes: newNotes.length > 0 ? newNotes : null };
              }
            }
          }

          set({
            cells: updatedCells,
            moveHistory: [...(state.moveHistory ?? []), snapshot].slice(-50),
            livePoints: (state.livePoints ?? 0) + pts,
          });
          if (settings.hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          // Check puzzle completion
          if (updatedCells.every((c, i) => c.value === state.solution[i])) {
            set({ isPaused: true, isCompleted: true });
            if (settings.hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            get().updateStats({
              date: new Date(),
              difficulty: state.difficulty,
              durationSeconds: state.elapsedSeconds,
              mistakes: state.mistakes,
              won: true,
            });
            get().syncAfterGame();
          }
        } else {
          // ── Incorrect entry ────────────────────────────────────────────────
          const newMistakes = state.mistakes + 1;
          set({
            cells: updatedCells,
            mistakes: newMistakes,
            moveHistory: [...(state.moveHistory ?? []), snapshot].slice(-50),
          });
          if (settings.hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          if (settings.mistakeLimit > 0 && newMistakes >= settings.mistakeLimit) {
            set({ isPaused: true, isCompleted: true, isFailed: true });
            get().updateStats({
              date: new Date(),
              difficulty: state.difficulty,
              durationSeconds: state.elapsedSeconds,
              mistakes: newMistakes,
              won: false,
            });
            get().syncAfterGame();
          }
        }
      },

      eraseCell: () => {
        const state = get();
        if (state.selectedCellIndex === null) return;

        const cell = state.cells[state.selectedCellIndex];
        if (cell.isGiven) return;

        const updatedCells = [...state.cells];
        updatedCells[state.selectedCellIndex] = {
          ...cell,
          value: null,
          notes: null,
          isError: false,
        };

        set({ cells: updatedCells, moveHistory: [...(state.moveHistory ?? []), createSnapshot(state)].slice(-50) });

        const { settings } = get();
        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      undoMove: () => {
        const state = get();
        const history = state.moveHistory ?? [];
        const previous = history[history.length - 1];
        if (!previous || state.isCompleted) return;

        set({
          ...previous,
          moveHistory: history.slice(0, -1),
        });

        const { settings } = get();
        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      toggleNotesMode: () => {
        const { settings } = get();
        set((state) => ({ notesMode: !state.notesMode }));
        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      useHint: () => {
        const state = get();
        if (state.selectedCellIndex === null) return;

        const { settings } = get();
        if (settings.hintsPerGame === 0) return;
        if (state.hintsUsed >= settings.hintsPerGame) return;

        const cell = state.cells[state.selectedCellIndex];
        if (cell.isGiven || cell.value !== null) return;

        const correctNumber = state.solution[cell.row * 9 + cell.col];
        if (!correctNumber) return;

        const updatedCells = [...state.cells];
        updatedCells[state.selectedCellIndex] = {
          ...cell,
          value: correctNumber,
          notes: null,
          isError: false,
        };

        // Auto-remove this number from notes in related cells
        if (settings.autoRemoveNotes) {
          const affectedIndices = new Set(
            SudokuValidator.getRelatedCellsIndices(cell.row, cell.col)
          );
          for (const i of affectedIndices) {
            const c = updatedCells[i];
            if (!c.isGiven && c.value === null && c.notes?.includes(correctNumber)) {
              const newNotes = c.notes.filter((n) => n !== correctNumber);
              updatedCells[i] = { ...c, notes: newNotes.length > 0 ? newNotes : null };
            }
          }
        }

        // Half points for a hint (assisted solve)
        const pts = Math.floor((POINTS_PER_CELL[state.difficulty] ?? 10) / 2);

        set({
          cells: updatedCells,
          hintsUsed: state.hintsUsed + 1,
          livePoints: (state.livePoints ?? 0) + pts,
          moveHistory: [...(state.moveHistory ?? []), createSnapshot(state)].slice(-50),
        });

        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Check puzzle completion after hint
        if (updatedCells.every((c, i) => c.value === state.solution[i])) {
          set({ isPaused: true, isCompleted: true });
          if (settings.hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          get().updateStats({
            date: new Date(),
            difficulty: state.difficulty,
            durationSeconds: state.elapsedSeconds,
            mistakes: state.mistakes,
            won: true,
          });
          get().syncAfterGame();
        }
      },

      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
      },

      // Force-pause — called when app goes to background or screen loses focus
      pauseGame: () => {
        const s = get();
        if (!s.isCompleted) set({ isPaused: true });
      },

      // Force-resume — called when app comes back to foreground (screen regains focus)
      resumeGame: () => {
        // We do NOT auto-resume; user must tap Resume manually.
        // This is intentional — just ensures we don't corrupt state.
      },

      // Start the singleton timer — safe to call multiple times
      startTimer: () => {
        if (_timerInterval) return; // already running
        _timerInterval = setInterval(() => {
          const s = useStore.getState();
          if (!s.isPaused && !s.isCompleted && s.cells.length > 0) {
            s.tick();
          }
        }, 1000);
      },

      // Stop the singleton timer
      stopTimer: () => {
        if (_timerInterval) {
          clearInterval(_timerInterval);
          _timerInterval = null;
        }
      },

      useSecondChance: () => {
        const state = get();
        if (state.secondChancesUsed >= MAX_SECOND_CHANCES) return;
        set({
          mistakes: 0,
          isFailed: false,
          isCompleted: false,
          isPaused: false,
          secondChancesUsed: state.secondChancesUsed + 1,
        });
      },

      updateSettings: (newSettings: Partial<GameSettings>) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
        const userId = get().activeUserId;
        if (userId) {
          pushSettings(userId, get().settings).catch(() => {});
        }
      },

      updateStats: (record: GameRecord) => {
        set((state) => {
          const stats = { ...state.stats };
          const settings = { ...state.settings };

          if (record.won) {
            stats.totalCompleted += 1;
            stats.gamesWon = (stats.gamesWon ?? 0) + 1;
            stats.winsByDifficulty = { ...stats.winsByDifficulty };
            stats.winsByDifficulty[record.difficulty] =
              ((stats.winsByDifficulty[record.difficulty] ?? 0) + 1);

            stats.currentStreak += 1;
            if (stats.currentStreak > stats.bestStreak) {
              stats.bestStreak = stats.currentStreak;
            }

            const currentBest = stats.bestTimes[record.difficulty];
            if (!currentBest || record.durationSeconds < currentBest) {
              stats.bestTimes[record.difficulty] = record.durationSeconds;
            }

            // Unlock logic — uses persistent winsByDifficulty, not capped recentGames
            const winsForDiff = stats.winsByDifficulty[record.difficulty] ?? 0;
            const unlocked = new Set(settings.unlockedDifficulties);

            if (record.difficulty === Difficulty.Skill && winsForDiff >= 4 && !unlocked.has(Difficulty.Hard)) {
              unlocked.add(Difficulty.Hard);
            }
            if (record.difficulty === Difficulty.Hard && winsForDiff >= 8 && !unlocked.has(Difficulty.Advanced)) {
              unlocked.add(Difficulty.Advanced);
            }
            if (record.difficulty === Difficulty.Advanced && winsForDiff >= 16) {
              if (!unlocked.has(Difficulty.Expert)) unlocked.add(Difficulty.Expert);
              if (!unlocked.has(Difficulty.Master)) unlocked.add(Difficulty.Master);
            }

            settings.unlockedDifficulties = Array.from(unlocked);
          } else {
            stats.currentStreak = 0;
          }

          stats.totalMinutesPlayed += Math.floor(record.durationSeconds / 60);
          stats.recentGames = [record, ...stats.recentGames].slice(0, 50);

          return { stats, settings };
        });
      },

      resetStats: () => {
        set({ stats: defaultStats });
      },

      resetAppState: () => {
        const mode = get().dataMode;
        const userId = get().activeUserId;
        const key = mode === 'account' && userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
        AsyncStorage.removeItem(key).catch(() => {});
        set({
          cells: [],
          solution: [],
          difficulty: Difficulty.Beginner,
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
          syncEnabled: false,
          activeUserId: null,
          dataMode: 'guest',
        });
      },

      tick: () => {
        set((state) => {
          if (state.isPaused || state.isCompleted) return state;
          return { elapsedSeconds: state.elapsedSeconds + 1 };
        });
      },
    })
);

AsyncStorage.getItem(GUEST_STORAGE_KEY)
  .then((value) => {
    if (!value) return;

    const persistedState = JSON.parse(value) as Partial<PersistedState>;
    useStore.setState((state) => ({
      ...state,
      ...persistedState,
      settings: { ...defaultSettings, ...persistedState.settings },
      stats: { ...defaultStats, ...persistedState.stats },
      moveHistory: persistedState.moveHistory ?? [],
    }));
  })
  .catch(() => {});

useStore.subscribe((state) => {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => {
    const mode = state.dataMode;
    const userId = state.activeUserId;
    const key = mode === 'account' && userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
    AsyncStorage.setItem(key, JSON.stringify(getPersistedState(state))).catch(() => {});
  }, 500);
});
