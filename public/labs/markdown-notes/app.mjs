import {
  createNote,
  createStorage,
  mergeArchive,
  parseArchive,
  searchNotes,
  MAX_BYTES,
} from "./model.mjs";
import { renderMarkdown } from "./markdown.mjs";
const byId = (id) => document.getElementById(id);
const status = byId("status");
let archive = { version: 1, notes: [] },
  selected = null,
  dirty = false,
  timer = null,
  busy = false,
  loaded = false;
const lock = navigator.locks
  ? (callback) => navigator.locks.request("dura-notes-lab-v1", callback)
  : null;
let storage;
const active = () => archive.notes.find((note) => note.id === selected);
function report(error) {
  console.error("Notes operation failed:", error);
  status.textContent = `Not saved: ${error.message}. Your draft stays in this tab; export it before leaving.`;
}
function renderList() {
  const tag = byId("tag-filter").value;
  byId("tag-filter").replaceChildren(
    ...["", ...new Set(archive.notes.flatMap((note) => note.tags))].sort().map((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value || "All tags";
      return option;
    })
  );
  byId("tag-filter").value = tag;
  byId("note-list").replaceChildren(
    ...searchNotes(archive.notes, byId("search").value, byId("tag-filter").value).map((note) => {
      const item = document.createElement("li"),
        button = document.createElement("button");
      button.textContent = note.title || "Untitled note";
      button.setAttribute("aria-current", String(note.id === selected));
      button.addEventListener("click", () => {
        selected = note.id;
        renderEditor();
      });
      item.append(button);
      return item;
    })
  );
}
function renderEditor() {
  const note = active();
  byId("fields").disabled = !note || !loaded;
  byId("title").value = note?.title ?? "";
  byId("tags").value = note?.tags.join(", ") ?? "";
  byId("editor").value = note?.content ?? "";
  byId("preview").replaceChildren(renderMarkdown(note?.content ?? "", document));
  renderList();
}
async function save() {
  if (!loaded || busy || !dirty) return;
  busy = true;
  const snapshot = structuredClone(archive);
  try {
    await storage.save(snapshot);
    if (JSON.stringify(snapshot) === JSON.stringify(archive)) {
      dirty = false;
      status.textContent = "Saved in this browser";
    }
  } catch (error) {
    report(error);
  } finally {
    busy = false;
    if (dirty && JSON.stringify(snapshot) !== JSON.stringify(archive)) schedule();
  }
}
function schedule() {
  dirty = true;
  status.textContent = "Unsaved changes";
  clearTimeout(timer);
  timer = setTimeout(() => {
    void save();
  }, 400);
}
function update() {
  const note = active();
  if (!note) return;
  note.title = byId("title").value;
  note.content = byId("editor").value;
  note.tags = [
    ...new Set(
      byId("tags")
        .value.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  ];
  note.updatedAt = Math.max(Date.now(), note.updatedAt + 1);
  byId("preview").replaceChildren(renderMarkdown(note.content, document));
  schedule();
  renderList();
}
for (const id of ["title", "tags", "editor"]) byId(id).addEventListener("input", update);
byId("new-note").addEventListener("click", () => {
  if (!loaded) return;
  if (archive.notes.length >= 100) {
    report(new Error("Note limit reached"));
    return;
  }
  const note = createNote();
  archive.notes.push(note);
  selected = note.id;
  schedule();
  renderEditor();
  byId("title").focus();
});
byId("delete").addEventListener("click", () => {
  const note = active();
  if (!note || !confirm(`Delete ${note.title || "Untitled note"}?`)) return;
  archive.notes = archive.notes.filter((item) => item.id !== selected);
  selected = archive.notes[0]?.id ?? null;
  schedule();
  renderEditor();
});
byId("save").addEventListener("click", () => {
  clearTimeout(timer);
  void save();
});
byId("search").addEventListener("input", renderList);
byId("tag-filter").addEventListener("change", renderList);
function download() {
  const raw = loaded
    ? JSON.stringify(archive, null, 2)
    : (localStorage.getItem("dura-notes-lab-v1") ?? "");
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = loaded ? "markdown-notes-v1.json" : "markdown-notes-unreadable-recovery.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
byId("export").addEventListener("click", () => {
  try {
    download();
  } catch (error) {
    report(error);
  }
});
byId("import").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file || !loaded) return;
  try {
    if (file.size > MAX_BYTES) throw new Error("File exceeds 1 MB");
    const incoming = parseArchive(await file.text());
    archive = mergeArchive(archive, incoming);
    selected ??= archive.notes[0]?.id ?? null;
    schedule();
    renderEditor();
  } catch (error) {
    report(error);
  } finally {
    event.target.value = "";
  }
});
window.addEventListener("beforeunload", (event) => {
  if (dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === "dura-notes-lab-v1") {
    status.textContent =
      "Another tab changed storage. Export your draft, then reload; stale saves will be rejected.";
  }
});
document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    void save();
  }
  if (event.key === "/") {
    event.preventDefault();
    byId("search").focus();
  }
  if (event.key.toLowerCase() === "n" && event.shiftKey) {
    event.preventDefault();
    byId("new-note").click();
  }
});
try {
  storage = createStorage(localStorage, lock);
  archive = storage.load();
  loaded = true;
  selected = archive.notes[0]?.id ?? null;
  status.textContent = archive.notes.length
    ? "Loaded saved notes"
    : "No notes yet. Create your first note.";
  renderEditor();
} catch (error) {
  report(error);
  byId("new-note").disabled = true;
  byId("save").disabled = true;
  byId("import").disabled = true;
}
