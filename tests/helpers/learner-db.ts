import type { DuraDB } from "@/lib/db";
interface Row {
  [key: string]: unknown;
}
/** Memory adapter for exercising snapshot and migration orchestration with actual encrypted records. */
export function memoryLearnerDB(): { db: DuraDB; stores: Map<string, Map<string, Row>> } {
  const stores = new Map<string, Map<string, Row>>();
  function store(name: string): Map<string, Row> {
    if (!stores.has(name)) stores.set(name, new Map());
    return stores.get(name)!;
  }
  function adapter(name: string): object {
    return {
      get: async (id: string): Promise<Row | undefined> => store(name).get(id),
      getAll: async (): Promise<Row[]> => [...store(name).values()],
      put: async (row: Row): Promise<void> => {
        store(name).set(
          String(
            row[name === "progress" ? "lessonId" : name === "moduleProgress" ? "moduleId" : "id"]
          ),
          row
        );
      },
      delete: async (id: string): Promise<void> => {
        store(name).delete(id);
      },
    };
  }
  const db = {
    getAll: async (name: string): Promise<Row[]> => [...store(name).values()],
    get: async (name: string, id: string): Promise<Row | undefined> => store(name).get(id),
    put: async (name: string, row: Row): Promise<void> => {
      store(name).set(String(row[name === "progress" ? "lessonId" : "id"]), row);
    },
    transaction: (names: string | string[]): object => ({
      store: adapter(typeof names === "string" ? names : names[0]),
      objectStore: adapter,
      done: Promise.resolve(),
      abort: (): void => {},
    }),
  } as unknown as DuraDB;
  return { db, stores };
}
