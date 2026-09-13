import { test, expect } from "@playwright/test";

test("complete curriculum pack opens an unvisited final lesson offline", async ({
  page,
  context,
}) => {
  test.setTimeout(300000);
  await page.goto("/settings");
  const decline = page.getByRole("button", { name: "No thanks", exact: true });
  await decline.click();
  await page.getByRole("button", { name: "Dismiss durability warning" }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole("button", { name: "Check download size", exact: true }).click();
  await page.getByRole("button", { name: "Download all lessons", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Every listed curriculum" })).toBeVisible(
    { timeout: 240000 }
  );
  const response = await page.request.get("/api/offline/manifest");
  const manifest = (await response.json()) as { pages: string[]; lessons: number };
  const lessons = manifest.pages.filter((url) => url.split("/").length === 5);
  expect(lessons.length).toBe(manifest.lessons);
  await context.setOffline(true);
  await page.goto(lessons[lessons.length - 1]);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("You’re offline");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    .toBe(true);
  await context.setOffline(false);
});
