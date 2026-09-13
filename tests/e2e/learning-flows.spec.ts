import { expect, test, type Page } from "@playwright/test";

const LESSON = "/paths/0/0-1/01";

test("written lesson response survives reload and exposes its worked answer", async ({ page }) => {
  await page.goto("/paths/9/9-1/01");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const exercise = page.getByRole("region", { name: "Decision exercise", exact: true });
  const response = exercise.getByRole("textbox", { name: "Your response", exact: true });
  await response.fill(
    "I would delegate the implementation, agree on outcomes, and schedule a review of the risks."
  );
  await expect(exercise).toContainText(
    "Responses save with this learner’s encrypted lesson records"
  );
  await page.reload();
  await expect(response).toHaveValue(
    "I would delegate the implementation, agree on outcomes, and schedule a review of the risks."
  );
  await exercise.getByText("Compare with a worked response", { exact: true }).click();
  await expect(exercise.locator("details")).toHaveAttribute("open", "");
});

/** Read durable browser state to distinguish rendered success from an actual save. */
async function readStore(page: Page, store: string): Promise<unknown[]> {
  return page.evaluate(async (storeName): Promise<unknown[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("dura");
      request.onerror = (): void => reject(request.error);
      request.onsuccess = (): void => {
        const db = request.result;
        const transaction = db.transaction(storeName, "readonly");
        const read = transaction.objectStore(storeName).getAll();
        read.onsuccess = (): void => resolve(read.result as unknown[]);
        read.onerror = (): void => reject(read.error);
        transaction.oncomplete = (): void => db.close();
      };
    });
  }, store);
}

test("guest completes a lesson and keeps completion after reload", async ({ page }) => {
  await page.clock.install();
  await page.goto(LESSON);
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Binary: The Language of Machines", exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "256", exact: true }).click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await page.getByRole("button", { name: "110", exact: true }).click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.evaluate((): void => window.scrollTo(0, document.documentElement.scrollHeight));
  // Run observed timer ticks; a single wall-clock jump is deliberately rejected
  // as unobserved study time. Passing the quiz alone must not complete this lesson.
  // Observe bounded ten-second intervals without replaying thousands of animation frames.
  for (let tick = 0; tick < 13; tick++) await page.clock.fastForward(10_000);
  await expect(page.getByText("Time logged.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Keep going", exact: true })).toBeDisabled();
  await page.getByRole("textbox", { name: "Blank 1", exact: true }).fill("bit");
  await page.getByRole("textbox", { name: "Blank 2", exact: true }).fill("byte");
  await page.getByRole("button", { name: "Check answers", exact: true }).click();
  await expect(page.getByText("All correct.", { exact: true })).toBeVisible();
  await page.evaluate((): void => window.scrollTo(0, document.documentElement.scrollHeight));
  const complete = page.getByRole("button", { name: /^Complete lesson/ });
  await expect(complete).toBeEnabled();
  await complete.click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
});

test("a visited lesson remains readable after the browser goes offline", async ({
  page,
  context,
}) => {
  await page.goto(LESSON);
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.evaluate(async (): Promise<void> => {
    await navigator.serviceWorker.ready;
  });
  // The worker intentionally does not claim existing pages; navigate once to be controlled.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
  await expect(
    page.getByRole("heading", { name: "Binary: The Language of Machines", exact: true })
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Binary: The Language of Machines", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "256", exact: true })).toBeVisible();
});

test("offline feedback survives reload and local reset removes it and the AI key", async ({
  page,
  context,
}) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.getByRole("button", { name: "Send feedback", exact: true }).click();
  await context.setOffline(true);
  const dialog = page.getByRole("dialog", { name: "Feedback" });
  await dialog
    .getByRole("textbox", { name: "Feedback message" })
    .fill("Offline browser regression test");
  await dialog.getByRole("button", { name: "Send feedback", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Saved on this device");
  await expect.poll(async () => (await readStore(page, "feedback")).length).toBe(1);
  expect(
    await page.evaluate(() => sessionStorage.getItem("dura:chunk-recovery-attempted"))
  ).toBeNull();
  await context.setOffline(false);
  await page.reload();
  await expect.poll(async () => (await readStore(page, "feedback")).length).toBe(1);
  await page.evaluate((): void =>
    localStorage.setItem("dura:ai:anthropic-key", "test-key-to-erase")
  );
  await page.getByRole("button", { name: "Clear local data", exact: true }).click();
  await page
    .getByRole("alertdialog", { name: "Clear local data?" })
    .getByRole("button", { name: "Delete local data", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  expect(await page.evaluate(() => localStorage.getItem("dura:ai:anthropic-key"))).toBeNull();
  expect(await readStore(page, "feedback")).toEqual([]);
  expect(await readStore(page, "dojo-sessions")).toEqual([]);
});

test("sign-in and certificate routes remain available to a guest", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await page.goto("/verify");
  await expect(page.getByRole("heading", { name: "No certificates yet" })).toBeVisible();
});

test("dictionary cards can be reviewed and the scheduled review survives reload", async ({
  page,
}) => {
  await page.goto("/dictionary");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.getByRole("searchbox").fill("binary");
  const term = page.getByRole("article").first();
  await term.getByRole("button", { name: "Add", exact: true }).click();
  await expect(term.getByRole("button", { name: "In deck", exact: true })).toBeDisabled();
  await page.goto("/review");
  await page.getByRole("button", { name: "Card term — click or press space to flip" }).click();
  await page.getByRole("button", { name: /^Good/ }).click();
  await expect(page.getByRole("heading", { name: "Session complete", exact: true })).toBeVisible();
  expect(await readStore(page, "reviewLogs")).toHaveLength(1);
  await page.reload();
  expect(await readStore(page, "reviewLogs")).toHaveLength(1);
  await expect(page.getByRole("heading", { name: "Session complete", exact: true })).toHaveCount(0);
});

test("reset pauses another open tab before it can restore stale learner data", async ({
  page,
  context,
}) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const otherTab = await context.newPage();
  await otherTab.goto("/review");
  await expect(
    otherTab.getByRole("heading", { name: "Local data reset", exact: true })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Clear local data", exact: true }).click();
  await page
    .getByRole("alertdialog", { name: "Clear local data?" })
    .getByRole("button", { name: "Delete local data", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(
    otherTab.getByRole("heading", { name: "Local data reset", exact: true })
  ).toBeVisible();
  await otherTab.getByRole("button", { name: "Reload DURA", exact: true }).click();
  await expect(
    otherTab.getByRole("heading", { name: "Local data reset", exact: true })
  ).toHaveCount(0);
});
