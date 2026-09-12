import { useSyncExternalStore } from "react";
import { isAIConsented, subscribeAIConsentChanges } from "@/lib/ai/consent-gate";
import { hasAnthropicKey } from "@/lib/ai/key-storage";

const readAvailability = (): boolean => isAIConsented() && hasAnthropicKey();
const serverAvailability = (): boolean => false;

/** Subscribe to the shared consent/key state while keeping server output disabled. */
export function useAIAvailability(): boolean {
  return useSyncExternalStore(subscribeAIConsentChanges, readAvailability, serverAvailability);
}
