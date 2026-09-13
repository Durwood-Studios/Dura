import test from "node:test";
import assert from "node:assert/strict";
import { createStorage, mergeArchive, parseArchive, searchNotes, STORAGE_KEY } from "./model.mjs";
const note = (id = "one", content = "") => ({
  id,
  title: "Alpha",
  content,
  tags: ["work"],
  createdAt: 1,
  updatedAt: 2,
});
const archive = (notes = [note()]) => ({ version: 1, notes });
test("imports preserve empty notes and reject malformed and duplicate identities atomically", () => {
  assert.equal(parseArchive(JSON.stringify(archive())).notes[0].content, "");
  assert.throws(() => parseArchive(JSON.stringify(archive([{ id: "bad", content: "x" }]))));
  assert.throws(() => parseArchive(JSON.stringify(archive([note(), note()]))));
  assert.throws(() => parseArchive("x".repeat(1000001)));
  const merged = mergeArchive(archive(), archive());
  assert.equal(merged.notes.length, 2);
  assert.notEqual(merged.notes[0].id, merged.notes[1].id);
});
test("search text and exact tags compose", () => {
  const notes = [note("a", "first"), { ...note("b", "first"), tags: ["other"] }];
  assert.deepEqual(
    searchNotes(notes, "FIRST", "work").map((value) => value.id),
    ["a"]
  );
  assert.equal(searchNotes(notes, "missing", "work").length, 0);
});
test("quota failures keep previous stored data and reject stale tabs instead of false success", async () => {
  const data = new Map([[STORAGE_KEY, JSON.stringify(archive())]]);
  let quota = false;
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      if (quota) throw new Error("Quota exceeded");
      data.set(key, value);
    },
  };
  let queue = Promise.resolve();
  const lock = (operation) => {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  };
  const first = createStorage(storage, lock),
    second = createStorage(storage, lock);
  first.load();
  second.load();
  quota = true;
  await assert.rejects(first.save(archive([note("new")])));
  assert.equal(JSON.parse(data.get(STORAGE_KEY)).notes[0].id, "one");
  quota = false;
  await first.save(archive([note("new")]));
  await assert.rejects(second.save(archive([note("stale")])), /Another tab/);
  assert.equal(JSON.parse(data.get(STORAGE_KEY)).notes[0].id, "new");
});
test("corrupt startup is not replaced with empty successful storage", async () => {
  let raw = "not JSON";
  const repository = createStorage(
    {
      getItem: () => raw,
      setItem: (_, value) => {
        raw = value;
      },
    },
    async (operation) => operation()
  );
  assert.throws(() => repository.load());
  assert.equal(raw, "not JSON");
});
