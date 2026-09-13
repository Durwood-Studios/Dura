export const STORAGE_KEY = "dura-notes-lab-v1";
export const MAX_BYTES = 1000000;
/** Validate the entire archive before it can replace stored or active data. */
export function validateArchive(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.notes) || value.notes.length > 100)
    throw new Error("Expected a version 1 archive with at most 100 notes");
  const ids = new Set();
  const notes = value.notes.map((note) => {
    if (
      !note ||
      typeof note.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,80}$/.test(note.id) ||
      ids.has(note.id)
    )
      throw new Error("Invalid or duplicate note ID");
    ids.add(note.id);
    if (
      typeof note.title !== "string" ||
      note.title.length > 200 ||
      typeof note.content !== "string" ||
      note.content.length > 20000 ||
      !Array.isArray(note.tags) ||
      note.tags.length > 20 ||
      note.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 40) ||
      !Number.isSafeInteger(note.createdAt) ||
      note.createdAt < 0 ||
      !Number.isSafeInteger(note.updatedAt) ||
      note.updatedAt < note.createdAt
    )
      throw new Error("Invalid note fields or size limits");
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: [...new Set(note.tags)],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  });
  const archive = { version: 1, notes };
  if (new TextEncoder().encode(JSON.stringify(archive)).byteLength > MAX_BYTES)
    throw new Error("Archive exceeds 1 MB");
  return archive;
}
/** Parse bounded JSON; malformed storage remains untouched for manual recovery. */
export function parseArchive(raw) {
  if (typeof raw !== "string" || new TextEncoder().encode(raw).byteLength > MAX_BYTES)
    throw new Error("File exceeds 1 MB");
  return validateArchive(JSON.parse(raw));
}
export function createNote() {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "Untitled note",
    content: "",
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}
/** Incoming ID collisions receive new identities so import never overwrites local work. */
export function mergeArchive(existing, incoming) {
  const local = validateArchive(existing);
  const imported = validateArchive(incoming);
  const ids = new Set(local.notes.map((note) => note.id));
  return validateArchive({
    version: 1,
    notes: [
      ...local.notes,
      ...imported.notes.map((note) => {
        const id = ids.has(note.id) ? crypto.randomUUID() : note.id;
        ids.add(id);
        return { ...note, id };
      }),
    ],
  });
}
/** Search text and exact tag filter compose rather than replace one another. */
export function searchNotes(notes, query, tag) {
  const normalized = query.trim().toLowerCase();
  return notes
    .filter(
      (note) =>
        (!tag || note.tags.includes(tag)) &&
        (!normalized ||
          [note.title, note.content, ...note.tags].some((value) =>
            value.toLowerCase().includes(normalized)
          ))
    )
    .sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
}
/** A Web Lock plus expected serialized value prevents stale tabs overwriting newer notes. */
export function createStorage(storage, lock) {
  let expected;
  return {
    load() {
      const raw = storage.getItem(STORAGE_KEY);
      const archive = raw === null ? { version: 1, notes: [] } : parseArchive(raw);
      expected = raw;
      return archive;
    },
    async save(archive) {
      const serialized = JSON.stringify(validateArchive(archive));
      if (expected === undefined) throw new Error("Load storage before saving");
      if (!lock)
        throw new Error(
          "This browser lacks Web Locks; export your draft or use a supported browser"
        );
      await lock(async () => {
        if (storage.getItem(STORAGE_KEY) !== expected)
          throw new Error(
            "Another tab changed your notes. Export this draft, then reload before continuing"
          );
        storage.setItem(STORAGE_KEY, serialized);
        expected = serialized;
      });
    },
  };
}
