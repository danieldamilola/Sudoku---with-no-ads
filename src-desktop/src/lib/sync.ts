// ─── Supabase Sync Utility (Desktop) ───────────────────────────────────────────────
import { supabase, type Database } from './supabase';
import type { GameSettings, GameStats, GameState } from '../types';

type UserStats = Database['public']['Tables']['user_stats']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type ActiveGame = Database['public']['Tables']['active_game']['Row'];

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

function mapRemoteStats(remote: UserStats, base: GameStats): GameStats {
  const rawTimes = remote.best_times ?? {};
  const { _wins, _totalByDiff, _lastWinDate, _totalGamesPlayed, _totalMinutes, _recentGames, ...bestTimes } =
    rawTimes as Record<string, unknown> & {
      _wins?: Record<string, number>;
      _totalByDiff?: Record<string, number>;
      _lastWinDate?: string | null;
      _totalGamesPlayed?: number;
      _totalMinutes?: number;
      _recentGames?: GameStats['recentGames'];
    };
  return {
    ...base,
    totalCompleted: remote.games_played,
    gamesWon: remote.games_won,
    totalGamesPlayed: (_totalGamesPlayed as number) ?? remote.games_played,
    winsByDifficulty: (_wins as Partial<Record<string, number>>) ?? {},
    totalByDifficulty: (_totalByDiff as Partial<Record<string, number>>) ?? {},
    lastWinDate: (_lastWinDate as string | null) ?? null,
    currentStreak: remote.current_streak,
    bestStreak: remote.best_streak,
    totalMinutesPlayed: (_totalMinutes as number) ?? base.totalMinutesPlayed,
    bestTimes: bestTimes as Record<string, number>,
    recentGames: (_recentGames as GameStats['recentGames']) ?? base.recentGames,
  };
}

function mapRemoteSettings(remote: UserSettings, base: GameSettings): GameSettings {
  return {
    ...base,
    darkMode: remote.dark_mode,
    showMistakes: remote.show_mistakes,
    highlightDuplicates: remote.highlight_duplicates,
    autoRemoveNotes: remote.auto_remove_notes,
    mistakeLimit: remote.mistake_limit,
    showTimer: remote.show_timer,

  };
}

// ─── Push Functions ─────────────────────────────────────────────────────────────

async function ensureProfile(userId: string, email?: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email: email ?? null, updated_at: new Date().toISOString() });
  if (error) console.error('Failed to ensure profile:', error);
}

export async function pushStats(userId: string, stats: GameStats): Promise<void> {
  await ensureProfile(userId);
  const { error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      games_played: stats.totalCompleted,
      games_won: stats.gamesWon ?? 0,
      current_streak: stats.currentStreak,
      best_streak: stats.bestStreak,
      best_times: {
        ...stats.bestTimes,
        _wins: stats.winsByDifficulty,
        _totalByDiff: stats.totalByDifficulty,
        _lastWinDate: stats.lastWinDate,
        _totalGamesPlayed: stats.totalGamesPlayed,
        _totalMinutes: stats.totalMinutesPlayed,
        _recentGames: stats.recentGames,
      },
    });
  if (error) console.error('Failed to push stats:', error);
}

export async function pushSettings(userId: string, settings: GameSettings): Promise<void> {
  await ensureProfile(userId);
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      dark_mode: settings.darkMode,
      show_mistakes: settings.showMistakes,
      highlight_duplicates: settings.highlightDuplicates,
      auto_remove_notes: settings.autoRemoveNotes,
      mistake_limit: settings.mistakeLimit,
      show_timer: settings.showTimer,

    });
  if (error) console.error('Failed to push settings:', error);
}

export async function pushActiveGame(userId: string, gameState: GameState): Promise<void> {
  await ensureProfile(userId);
  const { error } = await supabase
    .from('active_game')
    .upsert({
      user_id: userId,
      game_state: {
        cells: gameState.cells,
        solution: gameState.solution,
        difficulty: gameState.difficulty,
        elapsedSeconds: gameState.elapsedSeconds,
        mistakes: gameState.mistakes,
        hintsUsed: gameState.hintsUsed,
        isPaused: gameState.isPaused,
        isCompleted: gameState.isCompleted,
        selectedCellIndex: gameState.selectedCellIndex,
        notesMode: gameState.notesMode,
      },
    });
  if (error) console.error('Failed to push active game:', error);
}

export async function deleteAccount(userId: string): Promise<void> {
  const tableDeletes = [
    { table: 'active_game', column: 'user_id' },
    { table: 'user_stats', column: 'user_id' },
    { table: 'user_settings', column: 'user_id' },
    { table: 'profiles', column: 'id' },
  ];

  await Promise.all(
    tableDeletes.map(async ({ table, column }) => {
      const query = supabase.from(table).delete().eq(column, userId);
      const { error } = await query;
      if (error && error.code !== 'PGRST100') {
        console.warn(`Failed to delete ${table} for user ${userId}:`, error);
      }
    })
  );

  // Account deletion from auth.users requires server-side service role privileges.
  // From client, we can only sign out and remove app-owned data.
}

// ─── Pull Functions ─────────────────────────────────────────────────────────────

export async function pullStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Failed to pull stats:', error);
    return null;
  }
  return data;
}

export async function pullSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Failed to pull settings:', error);
    return null;
  }
  return data;
}

export async function pullActiveGame(userId: string): Promise<ActiveGame | null> {
  const { data, error } = await supabase
    .from('active_game')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Failed to pull active game:', error);
    return null;
  }
  return data;
}

// ─── Real-time Subscriptions ─────────────────────────────────────────────────────

export function subscribeToStats(
  userId: string,
  onStatsChange: (stats: UserStats) => void
): () => void {
  const channel = supabase
    .channel(`user_stats_changes:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onStatsChange(payload.new as UserStats);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSettings(
  userId: string,
  onSettingsChange: (settings: UserSettings) => void
): () => void {
  const channel = supabase
    .channel(`user_settings_changes:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onSettingsChange(payload.new as UserSettings);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToActiveGame(
  userId: string,
  onGameChange: (game: ActiveGame) => void
): () => void {
  const channel = supabase
    .channel(`active_game_changes:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_game',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onGameChange(payload.new as ActiveGame);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Initial Sync (Pull and Merge) ───────────────────────────────────────────────

export async function initialSync(userId: string) {
  await ensureProfile(userId);
  const [remoteStats, remoteSettings, remoteGame] = await Promise.all([
    pullStats(userId),
    pullSettings(userId),
    pullActiveGame(userId),
  ]);

  const nextStats = remoteStats ? mapRemoteStats(remoteStats, defaultStats) : defaultStats;
  const nextSettings = remoteSettings
    ? mapRemoteSettings(remoteSettings, defaultSettings)
    : defaultSettings;
  const nextGameState = (remoteGame?.game_state ?? null) as any;

  return { stats: nextStats, settings: nextSettings, activeGame: nextGameState };
}
