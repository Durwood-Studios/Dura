import { horizontalOverflow } from "./helpers/geometry";
import { expect, test } from "@playwright/test";
import { PATHS } from "@/lib/paths";
import { PRACTICAL_LABS } from "@/lib/labs";
import { JUDGMENT_CASES } from "@/lib/judgment/cases";

const pages = [
  ...PATHS.map((path) => `/paths/p/${path.slug}`),
  ...JUDGMENT_CASES.map((scenario) => `/judgment/${scenario.id}`),
  "/labs",
  ...PRACTICAL_LABS.map((lab) => `/labs/${lab.id}`),
  "/judgment/guide",
  "/standards-watch",
  "/paths/0/0-1/01",
  "/paths/14/14-11/01",
];
for (const viewport of [
  { width: 320, height: 568 },
  { width: 667, height: 320 },
]) {
  test(`authored paths, cases, labs and sample lessons contain visible content at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize(viewport);
    await page.goto("/settings");
    await page.getByRole("button", { name: "No thanks", exact: true }).click();
    await page.getByRole("button", { name: "Dismiss durability warning" }).click();
    for (const route of pages) {
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("body")).not.toContainText("DURA hit a snag");
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const overflow = await horizontalOverflow(page);
      expect(overflow, `${route} visible content must remain horizontally reachable`).toEqual([]);
    }
  });
}
