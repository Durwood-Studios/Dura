"use client";

/** Browser download helpers. No-op on the server. */

export function downloadText(filename: string, contents: string, mime = "text/plain"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown): void {
  downloadText(filename, JSON.stringify(data, null, 2), "application/json");
}

export function downloadCSV(filename: string, csv: string): void {
  downloadText(filename, csv, "text/csv");
}
