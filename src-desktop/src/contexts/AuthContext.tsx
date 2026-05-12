// ─── Auth Context (Desktop) ───────────────────────────────────────────────────────
// Simplified: anonymous Supabase session identified only by a display name.
// No email/password. No stat sync. Identity is used for multiplayer lobbies only.
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const DISPLAY_NAME_KEY = 'sudoku_display_name';

interface AuthContextType {
  user: User | null;
  displayName: string;
  loading: boolean;
  setDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  displayName: '',
  loading: true,
  setDisplayName: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayNameState] = useState<string>(
    () => localStorage.getItem(DISPLAY_NAME_KEY) ?? ''
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
        } else {
          try {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (!mounted) return;
            if (!error && data.user) setUser(data.user);
          } catch (anonErr) {
            console.warn('Anonymous sign-in unavailable:', anonErr);
          }
        }
      } catch (sessionErr) {
        console.warn('Could not retrieve session:', sessionErr);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const setDisplayName = async (name: string) => {
    const trimmed = name.trim();
    localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
    setDisplayNameState(trimmed);
    if (user) {
      await supabase.auth.updateUser({ data: { display_name: trimmed } });
    }
  };

  return (
    <AuthContext.Provider value={{ user, displayName, loading, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
