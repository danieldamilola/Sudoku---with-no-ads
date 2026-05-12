// ─── Supabase Client Configuration (Mobile) ──────────────────────────────────────
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: require('@react-native-async-storage/async-storage').default,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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
          game_state: any;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          game_state?: any;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          game_state?: any;
          updated_at?: string;
        };
      };
    };
  };
};
