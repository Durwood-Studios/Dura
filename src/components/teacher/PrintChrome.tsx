"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * Strips the app chrome (sidebar, top bar, mobile nav, breadcrumbs,
 * focus exit button, tip button, toast layer) whenever a print route
 * is mounted, and renders a small "Print / Save as PDF" button that
 * screen media sees but print media hides.
 *
 * Reuses the same CSS rules as focus mode by toggling html.dura-print.
 */
export function PrintChrome(): React.ReactElement {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dura-print");
    return () => root.classList.remove("dura-print");
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-md transition hover:bg-neutral-50 print:hidden"
    >
      <Printer className="h-3.5 w-3.5" />
      Save as PDF
    </button>
  );
}
