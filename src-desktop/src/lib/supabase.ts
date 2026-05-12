// ─── Supabase Client Configuration (Desktop) ──────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          games_played: number;
          games_won: number;
          current_streak: number;
          best_streak: number;
          best_times: Record<string, number>;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          games_played?: number;
          games_won?: number;
          current_streak?: number;
          best_streak?: number;
          best_times?: Record<string, number>;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          games_played?: number;
          games_won?: number;
          current_streak?: number;
          best_streak?: number;
          best_times?: Record<string, number>;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          dark_mode: boolean;
          show_mistakes: boolean;
          highlight_duplicates: boolean;
          auto_remove_notes: boolean;
          mistake_limit: number;
          show_timer: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          dark_mode?: boolean;
          show_mistakes?: boolean;
          highlight_duplicates?: boolean;
          auto_remove_notes?: boolean;
          mistake_limit?: number;
          show_timer?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          dark_mode?: boolean;
          show_mistakes?: boolean;
          highlight_duplicates?: boolean;
          auto_remove_notes?: boolean;
          mistake_limit?: number;
          show_timer?: boolean;
          updated_at?: string;
        };
      };
      active_game: {
        Row: {
          user_id: string;
          game_state: unknown;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          game_state?: unknown;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          game_state?: unknown;
          updated_at?: string;
        };
      };
    };
  };
};
