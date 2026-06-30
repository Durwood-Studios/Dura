import { useEffect, useRef } from "react";

/**
 * Selector for all natively-focusable elements.
 * Excludes disabled controls and elements with tabindex="-1".
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Trap keyboard focus within `containerRef` while `active` is true.
 *
 * Behaviour:
 *  - On activate: saves the element that currently holds focus, then
 *    moves focus to the first focusable descendant.  If there are no
 *    focusable descendants, focuses the container itself (adding a
 *    transient tabindex="-1" only if none exists).
 *  - While active: Tab and Shift+Tab wrap at the boundary edges.
 *    Focusable children are re-queried on every keystroke so elements
 *    added dynamically after activation are always included.
 *  - On deactivate or unmount: removes the listener and returns focus
 *    to the element that was focused before activation.
 *
 * WCAG 2.1 AA — SC 2.1.2 (No Keyboard Trap requires the inverse: that
 * focus *can* be moved away from a component, but WAI-ARIA authoring
 * practice for modal dialogs additionally requires focus to be
 * *confined* within the dialog while it is open).
 *
 * @param containerRef - Ref pointing to the dialog/panel root element.
 * @param active       - Whether the trap should currently be engaged.
 */
export function useFocusTrap(
  containerRef: { readonly current: HTMLElement | null },
  active: boolean
): void {
  // Persisted across renders without triggering re-runs.
  const savedFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Remember what had focus so we can restore it when the modal closes.
    savedFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const container = containerRef.current;
    if (!container) return;

    /** Re-query on every call so dynamically added children are captured. */
    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    // Move focus into the trap.
    const elements = getFocusable();
    if (elements.length > 0) {
      elements[0].focus();
    } else {
      // No focusable children — give the container itself a programmatic
      // focus target without affecting natural tab order.
      if (!container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
      }
      container.focus();
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== "Tab") return;

      const focusable = getFocusable();

      if (focusable.length === 0) {
        // Nothing to cycle through — prevent focus leaving the container.
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        // Shift+Tab: if focus is on the first element (or somehow outside
        // the container), wrap around to the last element.
        if (current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on the last element (or somehow outside),
        // wrap around to the first element.
        if (current === last || !container.contains(current)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the element that triggered the modal.
      savedFocusRef.current?.focus();
      savedFocusRef.current = null;
    };
  }, [active, containerRef]);
}
