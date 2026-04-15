"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fullSync, startBackgroundSync, stopBackgroundSync } from "@/lib/supabase/sync";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with Supabase auth state. Listens to onAuthStateChange
 * and triggers sync operations on sign-in/sign-out.
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncTriggeredRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth
      .getUser()
      .then(({ data: { user: initialUser } }) => {
        setUser(initialUser);
        setLoading(false);

        if (initialUser && !syncTriggeredRef.current) {
          syncTriggeredRef.current = true;
          fullSync().catch((err: unknown) => {
            console.error("[auth] Initial sync failed:", err);
          });
          startBackgroundSync();
        }
      })
      .catch(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      if (sessionUser) {
        // User signed in — trigger full sync and start background sync
        fullSync().catch((err: unknown) => {
          console.error("[auth] Sync on auth change failed:", err);
        });
        startBackgroundSync();
      } else {
        // User signed out — stop background sync
        stopBackgroundSync();
        syncTriggeredRef.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      stopBackgroundSync();
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("[auth] Sign out failed:", err);
      throw err;
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state. Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  return context;
}
