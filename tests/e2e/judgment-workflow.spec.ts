import { expect, test } from "@playwright/test";

test("judgment drafts survive reload and committed reasoning leads to a durable self-review", async ({
  page,
  browserName,
}, testInfo) => {
  const reloadJournal = async (): Promise<void> => {
    if (browserName !== "firefox") {
      await page.reload();
      return;
    }
    // Playwright's Firefox reload command loses its Juggler frame under COOP + SW.
    // A browser-native reload retains both protections and exercises the real document lifecycle.
    await Promise.all([
      page.waitForEvent("domcontentloaded"),
      page.evaluate(() => {
        setTimeout(() => window.location.reload(), 0);
      }),
    ]);
    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true);
  };
  await page.setViewportSize({ width: 320, height: 700 });
  // A prior acknowledgement is browser-independent; Firefox can grant persistence automatically.
  await page.addInitScript(() => {
    localStorage.setItem("dura:storage:durability-warning-dismissed", "1");
  });
  await page.goto("/judgment");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.locator('a[href^="/judgment/"]:not([href="/judgment/guide"])').first().click();
  await expect(
    page.getByRole("button", { name: "Commit initial decision and reveal new evidence" })
  ).toBeVisible();
  const fields = page.locator("textarea");
  for (let index = 0; index < (await fields.count()); index++) {
    await fields
      .nth(index)
      .fill(
        `Evidence E1 identifies a constraint. Compare the safer alternative, measure failure recovery, and stop if the required bound is exceeded. Dimension ${index}.`
      );
  }
  await page
    .getByRole("combobox", { name: "Choose an option", exact: true })
    .selectOption({ index: 1 });
  await page.locator('input[type="checkbox"]').first().check();
  await expect(
    page.getByRole("status").filter({ hasText: /^Saved on this device$/ })
  ).toBeVisible();
  await reloadJournal();
  await expect(page.locator("textarea").first()).toHaveValue(/Evidence E1/);
  await page
    .getByRole("button", { name: "Commit initial decision and reveal new evidence" })
    .click();
  await expect(
    page.getByRole("button", { name: "Commit revision and compare reasoning" })
  ).toBeVisible();
  await page
    .locator("textarea")
    .first()
    .fill(
      "New evidence changes the constraint: require a measured recovery check before allowing operation and stop on any missed bound."
    );
  await page.getByRole("button", { name: "Commit revision and compare reasoning" }).click();
  await expect(
    page.getByRole("heading", { name: "Self-review with anchored criteria" })
  ).toBeVisible();
  await page.getByText("Read your committed initial decision", { exact: true }).click();
  await expect(page.locator("details")).toContainText("Dimension 0.");
  await expect(page.locator("details")).not.toContainText("New evidence changes the constraint");
  for (const select of await page.locator("form select").all()) await select.selectOption("1");
  await page
    .locator("textarea")
    .fill(
      "The changed evidence required a safer constraint. I would transfer the measurement and explicit stop rule to a different system before deployment."
    );
  await page.getByRole("button", { name: "Save self-review and schedule a return" }).click();
  await expect(page.getByRole("heading", { name: "Self-review recorded" })).toBeVisible();
  await reloadJournal();
  await expect(page.getByRole("heading", { name: "Self-review recorded" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("heading", { name: "Self-review recorded" }).scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished)
    );
  });
  await page.screenshot({ path: testInfo.outputPath("judgment-reviewed-320.png") });
});
