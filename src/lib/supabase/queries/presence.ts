import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  onlineCount: number;
  phaseBreakdown: Record<string, number>;
}

interface PresencePayload {
  phaseId: string | null;
}

/**
 * Subscribe to the studying-now presence channel.
 * Tracks the current user's phase and aggregates online counts.
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeToPresence(
  currentPhaseId: string | null,
  onUpdate: (state: PresenceState) => void
): () => void {
  let channel: RealtimeChannel | null = null;

  try {
    const supabase = createClient();
    channel = supabase.channel("studying", {
      config: { presence: { key: "user" } },
    });

    const aggregate = (): void => {
      if (!channel) return;

      const presenceState = channel.presenceState<PresencePayload>();
      let total = 0;
      const breakdown: Record<string, number> = {};

      for (const key of Object.keys(presenceState)) {
        const entries = presenceState[key];
        total += entries.length;
        for (const entry of entries) {
          const phase = entry.phaseId;
          if (phase) {
            breakdown[phase] = (breakdown[phase] ?? 0) + 1;
          }
        }
      }

      onUpdate({ onlineCount: total, phaseBreakdown: breakdown });
    };

    channel.on("presence", { event: "sync" }, aggregate).subscribe(async (status) => {
      if (status === "SUBSCRIBED" && channel) {
        await channel.track({ phaseId: currentPhaseId });
      }
    });
  } catch (err) {
    console.error("[subscribeToPresence] Failed:", err);
  }

  return () => {
    if (channel) {
      try {
        const supabase = createClient();
        void supabase.removeChannel(channel);
      } catch (err) {
        console.error("[subscribeToPresence] Cleanup failed:", err);
      }
    }
  };
}

/**
 * Get current online count without subscribing (one-shot).
 * Briefly joins the presence channel, reads the state, then leaves.
 * Returns 0 if the connection fails or times out.
 */
export async function getOnlineCount(): Promise<number> {
  try {
    const supabase = createClient();

    return new Promise<number>((resolve) => {
      const timeout = setTimeout(() => {
        void supabase.removeChannel(channel);
        resolve(0);
      }, 5000);

      const channel = supabase.channel("studying-count", {
        config: { presence: { key: "counter" } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          clearTimeout(timeout);
          const state = channel.presenceState();
          let count = 0;
          for (const key of Object.keys(state)) {
            count += state[key].length;
          }
          void supabase.removeChannel(channel);
          resolve(count);
        })
        .subscribe();
    });
  } catch (err) {
    console.error("[getOnlineCount] Failed:", err);
    return 0;
  }
}
