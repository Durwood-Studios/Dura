import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { chromium, expect } from "@playwright/test";
import { createLabServer } from "./server.mjs";

test(
  "actual browser controls save drafts across fast switching, reload, hostile import, quota failure and deletion",
  { timeout: 30000 },
  async () => {
    const server = createLabServer();
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 320, height: 700 },
    });
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}`;
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    try {
      await page.goto(url);
      await page.getByRole("button", { name: "New note", exact: true }).click();
      await page.getByLabel("Title", { exact: true }).fill("First draft");
      await page
        .getByLabel("Markdown", { exact: true })
        .fill("# First\n\nOriginal draft before rapid note switch");
      await page.getByRole("button", { name: "New note", exact: true }).click();
      await page.getByLabel("Title", { exact: true }).fill("Second draft");
      await page.getByLabel("Markdown", { exact: true }).fill("**Second** draft survives");
      await expect(page.getByRole("status")).toHaveText("Saved in this browser");
      await page.reload();
      await page.getByRole("button", { name: "First draft", exact: true }).click();
      await expect(page.getByLabel("Markdown", { exact: true })).toHaveValue(/Original draft/);
      await expect(page.locator("#preview h1")).toHaveText("First");
      await page.getByRole("button", { name: "Second draft", exact: true }).click();
      await expect(page.getByLabel("Markdown", { exact: true })).toHaveValue(/Second/);
      const hostile = {
        version: 1,
        notes: [
          {
            id: "evil",
            title: '<img src=x onerror="window.hacked=1">',
            content:
              '<img src=x onerror="window.hacked=1">\n\n[bad](javascript:alert(1))\n\n```html\n<strong>literal</strong>\n```',
            tags: ['<img src=x onerror="window.hacked=1">'],
            createdAt: 1,
            updatedAt: 2,
          },
        ],
      };
      await page.locator("#import").setInputFiles({
        name: "hostile.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(hostile)),
      });
      await page.getByRole("button", { name: hostile.notes[0].title, exact: true }).click();
      assert.equal(await page.locator("img").count(), 0);
      assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
      await expect(page.locator("#preview pre code")).toContainText("<strong>literal</strong>");
      assert.equal(await page.evaluate(() => window.hacked), undefined);
      await expect(page.getByRole("status")).toHaveText("Saved in this browser");
      const before = await page.evaluate(() => localStorage.getItem("dura-notes-lab-v1"));
      await page.evaluate(() => {
        Storage.prototype.setItem = function () {
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        };
      });
      await page
        .getByLabel("Markdown", { exact: true })
        .fill("This unsaved quota-failure draft must remain visible.");
      await expect(page.getByRole("status")).toContainText("Not saved");
      await expect(page.getByLabel("Markdown", { exact: true })).toHaveValue(/quota-failure/);
      assert.equal(await page.evaluate(() => localStorage.getItem("dura-notes-lab-v1")), before);
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export all drafts" }).click();
      assert.equal((await downloadPromise).suggestedFilename(), "markdown-notes-v1.json");
      page.on("dialog", (dialog) => dialog.accept());
      await page.reload();
      await page.getByRole("button", { name: "Second draft", exact: true }).click();
      await page.getByRole("button", { name: "Delete selected note" }).click();
      await expect(page.getByRole("button", { name: "Second draft", exact: true })).toHaveCount(0);
      await expect(page.getByRole("status")).toHaveText("Saved in this browser");
      await page.reload();
      await expect(page.getByRole("button", { name: "Second draft", exact: true })).toHaveCount(0);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      );
      assert.deepEqual(failures, []);
    } finally {
      await browser.close();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
