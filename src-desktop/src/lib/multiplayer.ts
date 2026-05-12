// ─── Multiplayer Supabase Utilities ──────────────────────────────────────────
import { supabase } from './supabase';
import type { SudokuCell } from '../types';

export interface LobbySettings {
  timeLimitSeconds: number | null; // null = no limit
  allowHints: boolean;
  allowUndo: boolean;
  hintsPerGame: number;
  difficulty?: string; // set by host when game starts
}

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  progress: number;       // 0-81 cells filled
  finishedAt: string | null;
  mistakes: number;
  hintsUsed: number;
  isHost: boolean;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  settings: LobbySettings;
  status: 'waiting' | 'playing' | 'finished';
  puzzle: SudokuCell[] | null;
  solution: number[] | null;
  startedAt: string | null;
  createdAt: string;
  players: LobbyPlayer[];
}

// ── Generate a random 6-char uppercase code ───────────────────────────────────
export function generateLobbyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Create a new lobby ────────────────────────────────────────────────────────
export async function createLobby(
  hostId: string,
  displayName: string,
  settings: LobbySettings,
): Promise<Lobby | null> {
  const code = generateLobbyCode();

  const { data: lobby, error: lobbyErr } = await supabase
    .from('lobbies')
    .insert({ code, host_id: hostId, settings, status: 'waiting' })
    .select()
    .single();

  if (lobbyErr || !lobby) {
    throw new Error(lobbyErr?.message ?? 'Could not create lobby (table may not exist — run the SQL setup)');
  }

  const { error: playerErr } = await supabase
    .from('lobby_players')
    .insert({ lobby_id: lobby.id, user_id: hostId, display_name: displayName, is_host: true });

  if (playerErr) {
    throw new Error(playerErr.message ?? 'Could not add host to lobby');
  }

  return mapLobby(lobby, [{ userId: hostId, displayName, progress: 0, finishedAt: null, mistakes: 0, hintsUsed: 0, isHost: true }]);
}

// ── Join an existing lobby by code ────────────────────────────────────────────
export async function joinLobby(
  code: string,
  userId: string,
  displayName: string,
): Promise<Lobby | null> {
  const { data: lobby, error: lobbyErr } = await supabase
    .from('lobbies')
    .select('*, lobby_players(*)')
    .eq('code', code.toUpperCase())
    .single();

  if (lobbyErr || !lobby) { console.error('joinLobby:', lobbyErr); return null; }
  // Allow re-joining a playing lobby (e.g. after page refresh); reject only 'finished'
  if (lobby.status === 'finished') return null;

  const alreadyIn = lobby.lobby_players.some((p: { user_id: string }) => p.user_id === userId);
  if (!alreadyIn) {
    const { error } = await supabase
      .from('lobby_players')
      .insert({ lobby_id: lobby.id, user_id: userId, display_name: displayName, is_host: false });
    if (error) { console.error('joinLobby/player:', error); return null; }
  }

  return fetchLobby(lobby.id);
}

// ── Fetch full lobby state ────────────────────────────────────────────────────
export async function fetchLobby(lobbyId: string): Promise<Lobby | null> {
  const { data, error } = await supabase
    .from('lobbies')
    .select('*, lobby_players(*)')
    .eq('id', lobbyId)
    .single();
  if (error || !data) return null;
  return mapLobby(data, data.lobby_players.map(mapPlayer));
}

// ── Start game — host only ─────────────────────────────────────────────────────
export async function startLobbyGame(
  lobbyId: string,
  puzzle: SudokuCell[],
  solution: number[],
  difficulty: string,
): Promise<void> {
  // Read current settings first so we can merge difficulty in
  const { data } = await supabase.from('lobbies').select('settings').eq('id', lobbyId).single();
  const settings = { ...(data?.settings ?? {}), difficulty };
  await supabase
    .from('lobbies')
    .update({ status: 'playing', puzzle, solution, started_at: new Date().toISOString(), settings })
    .eq('id', lobbyId);
}

// ── Push player progress ──────────────────────────────────────────────────────
export async function pushProgress(
  lobbyId: string,
  userId: string,
  progress: number,
  mistakes: number,
  hintsUsed: number,
  finished: boolean,
): Promise<void> {
  await supabase
    .from('lobby_players')
    .update({
      progress,
      mistakes,
      hints_used: hintsUsed,
      finished_at: finished ? new Date().toISOString() : null,
    })
    .eq('lobby_id', lobbyId)
    .eq('user_id', userId);
}

// ── Subscribe to lobby changes (Realtime) ─────────────────────────────────────
export function subscribeLobby(
  lobbyId: string,
  onUpdate: (lobby: Lobby) => void,
): () => void {
  const channel = supabase
    .channel(`lobby:${lobbyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      () => { fetchLobby(lobbyId).then((l) => { if (l) onUpdate(l); }); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_players', filter: `lobby_id=eq.${lobbyId}` },
      () => { fetchLobby(lobbyId).then((l) => { if (l) onUpdate(l); }); })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapPlayer(row: Record<string, unknown>): LobbyPlayer {
  return {
    userId: row.user_id as string,
    displayName: row.display_name as string,
    progress: (row.progress as number) ?? 0,
    finishedAt: (row.finished_at as string) ?? null,
    mistakes: (row.mistakes as number) ?? 0,
    hintsUsed: (row.hints_used as number) ?? 0,
    isHost: (row.is_host as boolean) ?? false,
  };
}

function mapLobby(row: Record<string, unknown>, players: LobbyPlayer[]): Lobby {
  const settings = (row.settings as LobbySettings) ?? { timeLimitSeconds: null, allowHints: true, allowUndo: true, hintsPerGame: 3 };
  return {
    id: row.id as string,
    code: row.code as string,
    hostId: row.host_id as string,
    settings,
    status: (row.status as Lobby['status']) ?? 'waiting',
    puzzle: (row.puzzle as SudokuCell[]) ?? null,
    solution: (row.solution as number[]) ?? null,
    startedAt: (row.started_at as string) ?? null,
    createdAt: row.created_at as string,
    players,
  };
}
