import { vi } from "vitest";

/**
 * In-memory OPFS stub for jsdom. Mounts a fake FileSystemDirectoryHandle
 * onto navigator.storage.getDirectory so opfs.ts behaves as if real
 * OPFS were available.
 */
export interface OPFSStub {
  files: Map<string, string>;
  unmount(): void;
}

export function mountOPFSStub(): OPFSStub {
  const files = new Map<string, string>();

  const makeFileHandle = (name: string) => ({
    async getFile() {
      const text = files.get(name);
      if (text === undefined) {
        throw new DOMException("file not found", "NotFoundError");
      }
      return {
        async text() {
          return text;
        },
      };
    },
    async createWritable() {
      let buffer = "";
      return {
        async write(chunk: string) {
          buffer = chunk;
        },
        async close() {
          files.set(name, buffer);
        },
      };
    },
  });

  const directoryHandle = {
    async getFileHandle(name: string, options?: { create?: boolean }) {
      if (!files.has(name) && !options?.create) {
        throw new DOMException("file not found", "NotFoundError");
      }
      if (!files.has(name) && options?.create) {
        files.set(name, "");
      }
      return makeFileHandle(name);
    },
    async removeEntry(name: string) {
      if (!files.has(name)) {
        throw new DOMException("file not found", "NotFoundError");
      }
      files.delete(name);
    },
  };

  vi.stubGlobal("navigator", {
    ...navigator,
    storage: {
      ...navigator.storage,
      getDirectory: vi.fn(async () => directoryHandle),
    },
  });

  return {
    files,
    unmount: () => {
      vi.unstubAllGlobals();
    },
  };
}

export function unmountOPFSStub(): void {
  vi.unstubAllGlobals();
}
