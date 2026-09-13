"use client";
/** Invoke the browser's local print/PDF flow; no learner data is sent anywhere. */
export function JudgmentPrintButton(): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm print:hidden"
    >
      Print or save teacher guide as PDF
    </button>
  );
}
