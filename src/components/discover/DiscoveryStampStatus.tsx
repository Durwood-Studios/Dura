"use client";

import { useEffect, useState } from "react";
import { getStorageOwner } from "@/lib/storage/owner";
import { getDiscoveryPassport, saveDiscoveryActivity } from "@/lib/discovery/passport";

export const DISCOVERY_CHANGED = "dura:discovery-changed";
interface StampEvent {
  owner: string;
  slug: string;
  error?: string;
}

/** Activities retain their existing completion callbacks while all persistence failures remain visible. */
export async function markActivityComplete(slug: string): Promise<boolean> {
  const owner = getStorageOwner();
  try {
    await saveDiscoveryActivity(slug);
    window.dispatchEvent(
      new CustomEvent<StampEvent>(DISCOVERY_CHANGED, { detail: { owner, slug } })
    );
    return true;
  } catch (error) {
    console.error("[discovery] Stamp not saved", error);
    window.dispatchEvent(
      new CustomEvent<StampEvent>(DISCOVERY_CHANGED, {
        detail: {
          owner,
          slug,
          error: "The activity was explored, but its passport stamp was not saved.",
        },
      })
    );
    return false;
  }
}

/** Report saved stamps separately from finishing the activity itself, with a working retry control. */
export function DiscoveryStampStatus({ slug }: { slug: string }): React.ReactElement {
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingStamp, setHasPendingStamp] = useState(false);
  const [reload, setReload] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let request = 0;
    const load = (): void => {
      const current = ++request;
      void getDiscoveryPassport()
        .then((record) => {
          if (active && current === request) {
            setIsSaved(record.activities.some((id) => id === slug));
            setWarning(record.warning ?? null);
            setError(null);
          }
        })
        .catch((failure) => {
          if (active && current === request)
            setError(failure instanceof Error ? failure.message : "Passport unavailable.");
        });
    };
    const ownerReady = (): void => {
      setIsSaved(false);
      setHasPendingStamp(false);
      load();
    };
    const changed = (event: Event): void => {
      const detail = (event as CustomEvent<StampEvent>).detail;
      if (detail?.owner !== getStorageOwner() || detail.slug !== slug) return;
      request += 1;
      setError(detail.error ?? null);
      setHasPendingStamp(Boolean(detail.error));
      if (!detail.error) load();
    };
    load();
    window.addEventListener(DISCOVERY_CHANGED, changed);
    window.addEventListener("dura:storage-owner-ready", ownerReady);
    return () => {
      active = false;
      window.removeEventListener(DISCOVERY_CHANGED, changed);
      window.removeEventListener("dura:storage-owner-ready", ownerReady);
    };
  }, [slug, reload]);
  return (
    <div className="mt-4 text-sm [overflow-wrap:anywhere]">
      <p role="status">
        {isSaved
          ? "Exploration stamp saved in this learner’s passport."
          : "Explore the activity to earn its passport stamp. Stamps record exploration, not mastery."}
      </p>
      {warning && <p role="status">{warning}</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 min-h-12 rounded-lg border px-3"
            onClick={() => {
              if (hasPendingStamp) void markActivityComplete(slug);
              else setReload((value) => value + 1);
            }}
          >
            {hasPendingStamp ? "Retry saving stamp" : "Retry loading passport"}
          </button>
        </div>
      )}
    </div>
  );
}
