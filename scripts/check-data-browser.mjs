import { build } from "vite";
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const root = process.cwd();
const outputDirectory = await mkdtemp(join(tmpdir(), "dura-data-browser-"));
await build({
  configFile: false,
  root,
  resolve: { alias: { "@": root + "/src" } },
  define: {
    "process.env.NEXT_PUBLIC_SUPABASE_URL": "undefined",
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": "undefined",
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    lib: {
      entry: root + "/tests/browser/data-record.entry.mjs",
      name: "DuraDataTest",
      formats: ["iife"],
      fileName: () => "test.js",
    },
  },
});
const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", req.url === "/test.js" ? "text/javascript" : "text/html");
  res.end(
    req.url === "/test.js"
      ? await readFile(join(outputDirectory, "test.js"))
      : '<script src="/test.js"></script>'
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(e));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => window.dataTest);
  const result = await page.evaluate(async () => {
    const t = window.dataTest;
    const select = async (uid) => {
      await t.closeLearnerDatabase();
      t.selectStorageOwner(uid);
      t.setActiveKey(await t.resolveEncryptionKey(uid));
    };
    await select(null);
    await t.putCard(
      t.createCard({
        id: "guest-card",
        front: "guest question",
        back: "guest answer",
        termSlug: null,
      })
    );
    await select("A");
    if ((await t.getAllCards()).length) throw Error("Guest leaked before adoption");
    await t.adoptGuestRecord();
    if ((await t.getAllCards())[0]?.front !== "guest question")
      throw Error("Guest adoption failed");
    await (
      await t.getDB()
    ).put("goals", {
      id: "a-goal",
      type: "custom",
      unit: "lessons",
      target: 1,
      current: 0,
      startedAt: 1,
      deadline: null,
      achievedAt: null,
      label: "A only",
    });
    const journal = {
      schemaVersion: 1,
      id: crypto.randomUUID(),
      caseId: "test-case",
      caseVersion: 1,
      createdAt: 1,
      updatedAt: 1,
      stage: "draft",
      initial: {
        optionId: "a",
        constraints: "private reasoning",
        evidence: "observed",
        tradeoffs: "latency",
        standardIds: [],
        standardReasoning: "scope",
        validationPlan: "measure",
        stopRule: "stop",
        confidence: 50,
      },
    };
    await t.saveJudgmentAttempt(journal);
    await t.saveJudgmentAttempt(journal); // identical replay is safe
    let rejectedStale = false;
    try {
      await t.saveJudgmentAttempt({
        ...journal,
        initial: { ...journal.initial, constraints: "stale edit" },
      });
    } catch {
      rejectedStale = true;
    }
    if (!rejectedStale) throw Error("A rejected stale journal edit reported success");

    const raw = await (await t.getDB()).get("judgmentAttempts", journal.id);
    if (!raw._e || raw.initial) throw Error("Journal was not encrypted");
    const bundle = await t.exportLearnerRecord();
    await select("B");
    if ((await t.getAllCards()).length || (await (await t.getDB()).getAll("goals")).length)
      throw Error("A leaked into B");
    if ((await t.getJudgmentAttempts()).length) throw Error("Journal leaked between owners");
    const parsed = await t.parseLearnerRecordZip(bundle.blob);
    await t.applyLearnerRecord(parsed);
    if ((await t.getJudgmentAttempts())[0]?.initial.constraints !== "private reasoning")
      throw Error("Journal cross-key export restore failed");
    if ((await t.getAllCards())[0]?.front !== "guest question")
      throw Error("Cross-key import failed");
    const withDeletion = await t.buildPortableRecord();
    withDeletion.tombstones.push({
      id: "flashcards:guest-card",
      table: "flashcards",
      recordId: "guest-card",
      deletedAt: 1,
      synced: 0,
    });
    await t.applyPortableRecord(withDeletion);
    if ((await t.getAllCards()).length)
      throw Error("Imported tombstone did not delete existing card");
    await select(null);
    if ((await t.getAllCards()).length !== 1) throw Error("Guest source lost");
    const snapshot = await t.buildLearnerSnapshot();
    await select("atomic-recovery");
    snapshot.progress = [{ lessonId: "p", phaseId: "1", moduleId: "1-1" }];
    snapshot.flashcards = [{ front: "missing key" }];
    let failed = false;
    try {
      await t.restoreSnapshotToIDB(snapshot);
    } catch {
      failed = true;
    }
    if (!failed || (await (await t.getDB()).getAll("progress")).length)
      throw Error("Restore partially committed");
    await (
      await t.getDB()
    ).put("progress", { lessonId: "new-work", phaseId: "1", moduleId: "1-1" });
    let cancelledRecovery = false;
    try {
      await t.restoreSnapshotToIDB(snapshot);
    } catch {
      cancelledRecovery = true;
    }
    if (
      !cancelledRecovery ||
      (await (await t.getDB()).getAll("progress"))[0]?.lessonId !== "new-work"
    )
      throw Error("Backup overwrote work created during recovery");
    return "PASS: actual IndexedDB owner isolation, explicit guest copy, cross-key ZIP restore, preserved guest source, atomic recovery rollback";
  });
  console.log(result);
} finally {
  await browser?.close();
  server.close();
  await rm(outputDirectory, { recursive: true, force: true });
}
