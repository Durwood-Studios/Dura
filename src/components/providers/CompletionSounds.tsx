"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { useToastsStore } from "@/stores/toasts";

/** Optional synthesized completion chimes; no audio files, network, or background playback. */
export function CompletionSounds(): null {
  useEffect(() => {
    let context: AudioContext | null = null;
    const unlock = (): void => {
      if (!usePreferencesStore.getState().prefs.soundEnabled || typeof AudioContext === "undefined")
        return;
      context ??= new AudioContext();
      void context.resume().catch((error) => console.warn("[sound] Audio unavailable", error));
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    const unsubscribe = useToastsStore.subscribe((state, previous) => {
      if (
        !usePreferencesStore.getState().prefs.soundEnabled ||
        !context ||
        context.state !== "running"
      )
        return;
      if (!state.toasts.some((toast) => !previous.toasts.some((old) => old.id === toast.id)))
        return;
      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.21);
        oscillator.onended = (): void => {
          oscillator.disconnect();
          gain.disconnect();
        };
      } catch (error) {
        console.warn("[sound] Chime failed", error);
      }
    });
    return () => {
      unsubscribe();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      if (context)
        void context.close().catch((error) => console.warn("[sound] Cleanup failed", error));
    };
  }, []);
  return null;
}
