import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, GameState, GameSettings, GameStats, GameRecord, GameSnapshot, SudokuCell } from '../types';
import { SudokuGenerator, SudokuValidator } from '../utils/sudoku';
import * as Haptics from 'expo-haptics';

// Module-level singleton so React StrictMode double-mount never creates 2 intervals
let _timerInterval: ReturnType<typeof setInterval> | null = null;

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
};

const defaultStats: GameStats = {
  totalCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalMinutesPlayed: 0,
  bestTimes: {},
  recentGames: [],
};

const STORAGE_KEY = 'sudoku-storage';

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

const MAX_SECOND_CHANCES = 3;
const POINTS_PER_CELL: Record<string, number> = {
  easy: 10, medium: 20, hard: 30, expert: 50,
};

interface GameStore extends GameState {
  settings: GameSettings;
  stats: GameStats;
  // Second-chance & scoring
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
      difficulty: Difficulty.Easy,
      elapsedSeconds: 0,
      mistakes: 0,
      hintsUsed: 0,
      isPaused: false,
      isCompleted: false,
      isFailed: false,
      secondChancesUsed: 0,
      livePoints: 0,
      startTime: null as Date | null,
      selectedCellIndex: null as number | null,
      notesMode: false,
      moveHistory: [] as GameSnapshot[],
      settings: defaultSettings,
      stats: defaultStats,
      
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
          startTime: new Date(),
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
          set({ cells: updatedCells, moveHistory: [...(state.moveHistory ?? []), snapshot] });
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
            moveHistory: [...(state.moveHistory ?? []), snapshot],
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
          }
        } else {
          // ── Incorrect entry ────────────────────────────────────────────────
          const newMistakes = state.mistakes + 1;
          set({
            cells: updatedCells,
            mistakes: newMistakes,
            moveHistory: [...(state.moveHistory ?? []), snapshot],
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
        
        set({ cells: updatedCells, moveHistory: [...(state.moveHistory ?? []), createSnapshot(state)] });
        
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
          moveHistory: [...(state.moveHistory ?? []), createSnapshot(state)],
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
      },
      
      updateStats: (record: GameRecord) => {
        set((state) => {
          const stats = { ...state.stats };
          
          if (record.won) {
            stats.totalCompleted += 1;
            stats.currentStreak += 1;
            if (stats.currentStreak > stats.bestStreak) {
              stats.bestStreak = stats.currentStreak;
            }
            
            const diffName = record.difficulty;
            const currentBest = stats.bestTimes[diffName];
            if (!currentBest || record.durationSeconds < currentBest) {
              stats.bestTimes[diffName] = record.durationSeconds;
            }
          } else {
            stats.currentStreak = 0;
          }
          
          stats.totalMinutesPlayed += Math.floor(record.durationSeconds / 60);
          stats.recentGames = [record, ...stats.recentGames].slice(0, 10);
          
          return { stats };
        });
      },
      
      resetStats: () => {
        set({ stats: defaultStats });
      },
      
      tick: () => {
        set((state) => {
          if (state.isPaused || state.isCompleted) return state;
          return { elapsedSeconds: state.elapsedSeconds + 1 };
        });
      },
    })
);

AsyncStorage.getItem(STORAGE_KEY)
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
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState(state))).catch(() => {});
});
