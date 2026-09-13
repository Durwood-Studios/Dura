import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { expect, test } from "@playwright/test";

test("written drafts and Discovery stamps reload and appear in the learner export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("dura:storage:durability-warning-dismissed", "1");
  });
  await page.goto("/paths/1/1-6/44");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const response =
    "My deployment check uses a rollback rehearsal, an explicit failure threshold, and an owner who can stop the rollout.";
  const input = page.getByRole("textbox", { name: "Your response", exact: true }).first();
  await input.fill(response);
  const storage = page.locator(`#${await input.getAttribute("id")}`);
  const described = (await storage.getAttribute("aria-describedby"))
    ?.split(" ")
    .find((id) => id.endsWith("-storage"));
  expect(described).toBeTruthy();
  await expect(page.locator(`[id="${described}"]`)).toContainText(
    "Responses save with this learner’s encrypted lesson records"
  );
  await page.reload();
  await expect(input).toHaveValue(response);
  expect(
    await page.evaluate(
      (text) => Object.values(localStorage).some((value) => value.includes(text)),
      response
    )
  ).toBe(false);

  await page.goto("/discover/secret-codes/binary-painter");
  for (let bit = 0; bit < 4; bit++)
    await page.getByRole("button", { name: `Bit ${bit}: off`, exact: true }).click();
  await expect(
    page.getByText("Exploration stamp saved in this learner’s passport.", { exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Exploration stamp saved in this learner’s passport.", { exact: true })
  ).toBeVisible();
  await page.goto("/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save progress to file", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const zip = await JSZip.loadAsync(await readFile(path!));
  const record = JSON.parse(await zip.file("learner-record.json")!.async("string")) as {
    "x-dura": {
      portable: { preferences: Array<{ discoveryActivities?: string[] }>; progress: unknown[] };
    };
  };
  expect(
    record["x-dura"].portable.preferences.some((preference) =>
      preference.discoveryActivities?.includes("binary-painter")
    )
  ).toBe(true);
  expect(JSON.stringify(record["x-dura"].portable.progress)).toContain(response);
});
