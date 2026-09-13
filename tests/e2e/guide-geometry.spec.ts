import { readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";
import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers/geometry";

const guides = ["tutorials", "howto"].flatMap((group) =>
  readdirSync(`src/content/${group}`)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data } = matter(readFileSync(`src/content/${group}/${file}`, "utf8"));
      if (typeof data.slug !== "string") throw new Error(`Missing route for ${group}/${file}`);
      return `/${group}/${data.slug}`;
    })
);

for (let shard = 0; shard < 4; shard++) {
  test(`every guide and curriculum navigation page fits320px, batch${shard + 1}/4`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/settings");
    await page.getByRole("button", { name: "No thanks", exact: true }).click();
    await page.getByRole("button", { name: "Dismiss durability warning" }).click();
    const response = await page.request.get("/api/offline/manifest");
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as { pages: string[] };
    const routes = [
      ...guides,
      ...manifest.pages.filter((route) => /^\/paths(?:\/\d+(?:\/\d+-\d+)?)?$/.test(route)),
    ].filter((_, index) => index % 4 === shard);
    const failures: { route: string; overflow: Awaited<ReturnType<typeof horizontalOverflow>> }[] =
      [];
    for (const route of routes) {
      const loaded = await page.goto(route);
      expect(loaded?.ok(), route).toBe(true);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const overflow = await horizontalOverflow(page);
      if (overflow.length) failures.push({ route, overflow });
    }
    await testInfo.attach("guide-geometry.json", {
      body: JSON.stringify({ routes, failures }, null, 2),
      contentType: "application/json",
    });
    expect(failures).toEqual([]);
  });
}
