"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fullSync, startBackgroundSync, stopBackgroundSync } from "@/lib/supabase/sync";
import {
  resolveEncryptionKey,
  rememberLastAuthUser,
  readLastAuthUser,
  forgetLastAuthUser,
} from "@/lib/idb/encryption-key";
import { setActiveKey } from "@/lib/idb/active-key";
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
    let cancelled = false;
    let generation = 0;

    const initialize = async (nextUser: User | null, signedOut = false): Promise<void> => {
      const request = ++generation;
      try {
        if (signedOut) forgetLastAuthUser();
        if (nextUser) rememberLastAuthUser(nextUser.id);
        // Children must not read encrypted IDB records until their key is installed.
        const resolution = await resolveEncryptionKey(
          nextUser?.id ?? (signedOut ? null : readLastAuthUser())
        );
        if (cancelled || request !== generation) return;
        setActiveKey(resolution);
        setUser(nextUser);
        setLoading(false);
        if (nextUser && isSupabaseConfigured()) {
          if (!syncTriggeredRef.current) {
            syncTriggeredRef.current = true;
            void fullSync().catch((error: unknown): void => {
              console.error("[auth] Initial sync failed:", error);
            });
          }
          startBackgroundSync();
        } else {
          stopBackgroundSync();
          if (signedOut) syncTriggeredRef.current = false;
        }
      } catch (error) {
        console.error("[auth] Initialization failed:", error);
        if (!cancelled) setLoading(false);
      }
    };

    if (!isSupabaseConfigured()) {
      void initialize(null);
      return (): void => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    // Cached sessions allow local records to remain readable without a network round trip.
    void supabase.auth
      .getSession()
      .then(({ data: { session } }): void => {
        if (generation === 0) void initialize(session?.user ?? null);
      })
      .catch((error: unknown): void => {
        console.error("[auth] Cached session unavailable:", error);
        if (generation === 0) void initialize(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session): void => {
      void initialize(session?.user ?? null, event === "SIGNED_OUT");
    });

    return (): void => {
      cancelled = true;
      subscription.unsubscribe();
      stopBackgroundSync();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      stopBackgroundSync();
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("[auth] Sign out failed:", err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {loading ? (
        <p role="status" className="p-6">
          Preparing your local learning record…
        </p>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state. Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  return context;
}
