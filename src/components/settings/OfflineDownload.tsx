"use client";

import { useEffect, useRef, useState } from "react";
import {
  planOfflineDownload,
  downloadOfflinePack,
  getOfflinePack,
  removeOfflinePack,
  type OfflinePlan,
  type OfflinePack,
} from "@/lib/offline/download";

/** Explicit full-curriculum download with quota errors, cancellation and an atomic completion marker. */
export function OfflineDownload(): React.ReactElement {
  const [plan, setPlan] = useState<OfflinePlan | null>(null);
  const [pack, setPack] = useState<OfflinePack | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    void getOfflinePack().then(setPack);
    return () => controller.current?.abort();
  }, []);
  async function prepare(): Promise<void> {
    setIsBusy(true);
    setError(null);
    try {
      setPlan(await planOfflineDownload());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Download information unavailable.");
    } finally {
      setIsBusy(false);
    }
  }
  async function download(): Promise<void> {
    if (!plan) return;
    setIsBusy(true);
    setError(null);
    controller.current = new AbortController();
    try {
      const completed = await downloadOfflinePack(
        plan,
        (done, total, bytes) =>
          setStatus(
            `${done} / ${total} resources · ${(bytes / 1048576).toFixed(1)} MiB downloaded`
          ),
        controller.current.signal
      );
      setPack(completed);
      setPlan(null);
      setStatus("Every listed curriculum page and application asset was downloaded.");
    } catch (failure) {
      setError(
        controller.current.signal.aborted
          ? "Download cancelled. Your previous completed pack is unchanged."
          : failure instanceof Error
            ? failure.message
            : "Download failed. Free browser storage and retry."
      );
    } finally {
      setIsBusy(false);
      controller.current = null;
    }
  }
  async function remove(): Promise<void> {
    try {
      await removeOfflinePack();
      setPack(null);
      setStatus("Downloaded curriculum removed. Your learning records are unchanged.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not remove download.");
    }
  }
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Download the curriculum for offline use</h3>
      <p className="text-sm">
        Downloads every authored lesson and its navigation pages plus this version’s application
        assets. External web previews, AI, account sync and server-scored receipts still require
        internet. Browsers may evict cached files; test a lesson offline before travel and keep a
        separate progress export.
      </p>
      {pack && (
        <p className="text-sm">
          Downloaded {pack.lessons} lessons · {(pack.bytes / 1048576).toFixed(1)} MiB ·{" "}
          {new Date(pack.downloadedAt).toLocaleDateString()}. Version {pack.version}.
        </p>
      )}
      {plan && (
        <p className="text-sm">
          {plan.lessons} lessons and {plan.urls.length} total resources. Application assets:{" "}
          {(plan.assetBytes / 1048576).toFixed(1)} MiB; lesson HTML adds further storage. Progress
          reports actual bytes as they arrive. Keep this page open.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void (plan ? download() : prepare())}
          className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm disabled:opacity-50"
        >
          {plan ? "Download all lessons" : "Check download size"}
        </button>
        {isBusy && (
          <button
            type="button"
            onClick={() => controller.current?.abort()}
            className="min-h-12 px-4 text-sm underline"
          >
            Cancel download
          </button>
        )}
        {pack && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void remove()}
            className="min-h-12 px-4 text-sm underline"
          >
            Remove downloaded curriculum
          </button>
        )}
      </div>
      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
    </section>
  );
}
