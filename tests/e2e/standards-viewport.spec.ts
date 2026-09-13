import { test, expect } from "@playwright/test";

test("standards popovers remain inside narrow and resized viewports", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  // A prior acknowledgement is browser-independent; Firefox can grant persistence automatically.
  await page.addInitScript(() => {
    localStorage.setItem("dura:storage:durability-warning-dismissed", "1");
  });
  await page.goto("/paths/4/4-1/01");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const trigger = page.getByRole("button", { name: /SFIA|Skills Framework/i }).first();
  await trigger.click();
  const popup = page.getByRole("dialog");
  await expect(popup).toBeVisible();
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 250 },
    { width: 800, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return (
          !!box &&
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= viewport.width + 1 &&
          box.y + box.height <= viewport.height + 1
        );
      })
      .toBe(true);
    if (viewport.width === 320)
      await page.screenshot({ path: testInfo.outputPath("sfia-320.png") });
  }
  await page.keyboard.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
