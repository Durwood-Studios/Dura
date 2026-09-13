import { test, expect, type Locator, type Page } from "@playwright/test";

async function inViewport(page: Page, target: Locator): Promise<void> {
  await expect
    .poll(async () => {
      const box = await target.boundingBox();
      const viewport = page.viewportSize();
      return Boolean(
        box &&
        viewport &&
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= viewport.width + 1 &&
        box.y + box.height <= viewport.height + 1
      );
    })
    .toBe(true);
}
for (const viewport of [
  { width: 320, height: 568 },
  { width: 667, height: 320 },
]) {
  test(`settings, feedback, search and goals fit ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    // A prior acknowledgement is browser-independent; Firefox can grant persistence automatically.
    await page.addInitScript(() => {
      localStorage.setItem("dura:storage:durability-warning-dismissed", "1");
    });
    await page.goto("/settings");
    const decline = page.getByRole("button", { name: "No thanks", exact: true });
    await decline.click();
    await expect(page.getByRole("heading", { name: "Appearance", exact: true })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page.getByRole("button", { name: "Send feedback", exact: true }).last().click();
    const feedback = page.getByRole("dialog", { name: "Send feedback" });
    await inViewport(page, feedback.locator(":scope > div").last());
    await page.getByRole("button", { name: "Close feedback" }).click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    const search = page.getByRole("dialog", { name: "Search", exact: true });
    await expect(search).toBeVisible();
    await inViewport(page, search);
    await page.keyboard.press("Escape");
    await page.goto("/goals");
    await page.getByRole("button", { name: "Add goal", exact: true }).click();
    const goal = page.getByRole("dialog", { name: "New goal", exact: true });
    await inViewport(page, goal.locator(":scope > div"));
    await page.keyboard.press("Escape");
    await page.goto("/paths/0/0-1/01");
    await page.getByRole("button", { name: "bits", exact: true }).click();
    const vocabulary = page.getByRole("dialog", { name: /^Definition:/ });
    await expect(vocabulary).toBeVisible();
    await inViewport(page, vocabulary);
  });
}
