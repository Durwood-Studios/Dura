import type { Page } from "@playwright/test";

/** Measure visible content and painted text; clipping the document is not a passing result. */
export async function horizontalOverflow(
  page: Page
): Promise<{ tag: string; text: string | undefined; left: number; right: number }[]> {
  return page.evaluate(() => {
    const title = document.querySelector("h1")?.textContent?.trim();
    const failedBoundary = document.querySelector(
      'template[data-dgst]:not([data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"])'
    );
    const failedFlight = [...document.scripts].some(
      (script) =>
        script.textContent?.includes("self.__next_f.push") &&
        /[0-9a-f]+:E\{\\?"digest\\?":/i.test(script.textContent)
    );
    if (
      failedBoundary ||
      failedFlight ||
      document.getElementById("__next_error__") ||
      title === "DURA hit a snag" ||
      title === "Something went wrong"
    ) {
      return [
        {
          tag: "RENDER ERROR",
          text: title ?? "Server render error digest",
          left: 0,
          right: innerWidth,
        },
      ];
    }
    const exemptionCache = new WeakMap<Element, boolean>();
    function exempt(element: Element): boolean {
      const cached = exemptionCache.get(element);
      if (cached !== undefined) return cached;
      const style = getComputedStyle(element);
      let value =
        style.visibility === "hidden" ||
        element.getAttribute("aria-hidden") === "true" ||
        element.hasAttribute("inert") ||
        ["SCRIPT", "STYLE"].includes(element.tagName);
      if (
        !value &&
        ["auto", "scroll"].includes(style.overflowX) &&
        element.scrollWidth > element.clientWidth
      ) {
        const bounds = element.getBoundingClientRect();
        value = bounds.left >= -1 && bounds.right <= innerWidth + 1;
      }
      if (!value && element.parentElement) value = exempt(element.parentElement);
      exemptionCache.set(element, value);
      return value;
    }
    const failures: { tag: string; text: string | undefined; left: number; right: number }[] = [];
    const targets = document.querySelectorAll(
      "main h1,main h2,main h3,main p,main li,main a,main button,main input,main select,main textarea,main label,main dt,main dd"
    );
    for (const element of targets) {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height || exempt(element)) continue;
      if (box.left < -1 || box.right > innerWidth + 1)
        failures.push({
          tag: element.tagName,
          text: element.textContent?.slice(0, 90),
          left: box.left,
          right: box.right,
        });
    }
    for (const main of document.querySelectorAll("main")) {
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let text: Node | null;
      while ((text = walker.nextNode())) {
        const parent = text.parentElement;
        if (!parent || !text.textContent?.trim() || exempt(parent)) continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        for (const box of range.getClientRects()) {
          if (box.width > 0 && box.height > 0 && (box.left < -1 || box.right > innerWidth + 1)) {
            failures.push({
              tag: `${parent.tagName} text`,
              text: text.textContent.slice(0, 90),
              left: box.left,
              right: box.right,
            });
            break;
          }
        }
      }
    }
    return failures.slice(0, 20);
  });
}
