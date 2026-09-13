import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers/geometry";

// Fresh contexts bound hydration/cache memory during the exhaustive content sweep.
// Shards remain manifest-derived: no authored lesson is sampled or omitted.
const SHARDS = 10;
for (let shard = 0; shard < SHARDS; shard++) {
  test(`authored lesson geometry at320px, batch${shard + 1}/${SHARDS}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/settings");
    await page.getByRole("button", { name: "No thanks", exact: true }).click();
    await page.getByRole("button", { name: "Dismiss durability warning" }).click();
    const response = await page.request.get("/api/offline/manifest");
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as { pages: string[]; lessons: number };
    const all = manifest.pages.filter((route) => /^\/paths\/\d+\/\d+-\d+\/\d+$/.test(route));
    expect(all.length).toBe(manifest.lessons);
    const lessons = all.filter((_, index) => index % SHARDS === shard);
    const checked: string[] = [];
    const failures: { route: string; overflow: Awaited<ReturnType<typeof horizontalOverflow>> }[] =
      [];
    try {
      for (const route of lessons) {
        const loaded = await page.goto(route);
        expect(loaded?.ok(), route).toBe(true);
        await expect(page.locator("h1").first()).toBeVisible();
        await page.evaluate(async () => {
          await document.fonts.ready;
        });
        const overflow = await horizontalOverflow(page);
        if (overflow.length) failures.push({ route, overflow });
        checked.push(route);
      }
      expect(failures, `Batch${shard + 1} visible content and painted text`).toEqual([]);
    } finally {
      const report = testInfo.outputPath(`lesson-geometry-batch-${shard + 1}.json`);
      await writeFile(report, JSON.stringify({ checked, expected: lessons, failures }, null, 2));
      await testInfo.attach(`lesson-geometry-batch-${shard + 1}.json`, {
        path: report,
        contentType: "application/json",
      });
    }
  });
}
