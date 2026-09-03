"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fullSync, startBackgroundSync, stopBackgroundSync } from "@/lib/supabase/sync";
import {
  resolveEncryptionKey,
  rememberLastAuthUser,
  readLastAuthUser,
  forgetLastAuthUser,
} from "@/lib/idb/encryption-key";
import { setActiveKey } from "@/lib/idb/active-key";
import type { User } from "@supabase/supabase-js";

/**
 * Resolve and install the IDB encryption key for the current auth state.
 * Anonymous users get the device-tier key; signed-in users get the
 * auth-tier key. P5-A.2 — the IDB encryption wrapper reads peekActiveKey()
 * synchronously on every flashcard read/write.
 */
async function installEncryptionKey(authUserId: string | null): Promise<void> {
  try {
    const resolution = await resolveEncryptionKey(authUserId);
    setActiveKey(resolution);
  } catch (err) {
    console.error("[auth] Failed to resolve IDB encryption key:", err);
  }
}

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

    // Boot from the LOCALLY cached session — getSession() reads storage
    // and never blocks on the network. getUser() (a network validation
    // call) used to run here, and when the backend was unreachable it
    // reported "no user", downgrading the app to the device-tier key
    // while every record was encrypted under the auth tier — the learner
    // was locked out of their own local data. Offline-first means the
    // cloud can never be required just to READ what's on this device.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const bootUser = session?.user ?? null;
        setUser(bootUser);
        setLoading(false);

        if (bootUser) rememberLastAuthUser(bootUser.id);
        // No resolvable session (expired + refresh unreachable) still
        // decrypts with the last signed-in user's key — reads are local.
        void installEncryptionKey(bootUser?.id ?? readLastAuthUser());

        if (bootUser && !syncTriggeredRef.current) {
          syncTriggeredRef.current = true;
          fullSync().catch((err: unknown) => {
            console.error("[auth] Initial sync failed:", err);
          });
          startBackgroundSync();
        }
      })
      .catch(() => {
        setLoading(false);
        void installEncryptionKey(readLastAuthUser());
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      if (sessionUser) {
        rememberLastAuthUser(sessionUser.id);
        void installEncryptionKey(sessionUser.id);
        // Guarded: this event also fires on TOKEN_REFRESHED and
        // INITIAL_SESSION — a full sync per hourly refresh is waste.
        if (!syncTriggeredRef.current) {
          syncTriggeredRef.current = true;
          fullSync().catch((err: unknown) => {
            console.error("[auth] Sync on auth change failed:", err);
          });
        }
        startBackgroundSync();
      } else if (event === "SIGNED_OUT") {
        // Explicit sign-out: drop the auth-tier key entirely.
        forgetLastAuthUser();
        void installEncryptionKey(null);
        stopBackgroundSync();
        syncTriggeredRef.current = false;
      } else {
        // Session lost without a sign-out (refresh failed while the
        // backend is unreachable). Keep decrypting with the last known
        // auth key; pause sync until a real session returns.
        void installEncryptionKey(readLastAuthUser());
        stopBackgroundSync();
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
