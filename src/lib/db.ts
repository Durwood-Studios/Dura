import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LessonProgress, ModuleProgress, PhaseProgress } from "@/types/curriculum";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";
import type { Preferences } from "@/types/preferences";
import type { AnalyticsEvent } from "@/types/analytics";

export const DB_NAME = "dura";
export const DB_VERSION = 1;

export interface DuraDBSchema extends DBSchema {
  progress: {
    key: string;
    value: LessonProgress;
    indexes: { "by-phase": string; "by-module": string; "by-synced": number };
  };
  moduleProgress: {
    key: string;
    value: ModuleProgress;
    indexes: { "by-phase": string };
  };
  phaseProgress: {
    key: string;
    value: PhaseProgress;
  };
  flashcards: {
    key: string;
    value: FlashCard;
    indexes: { "by-due": number; "by-lesson": string; "by-state": string };
  };
  reviewLogs: {
    key: string;
    value: ReviewLog;
    indexes: { "by-card": string; "by-reviewed": number };
  };
  goals: {
    key: string;
    value: Goal;
    indexes: { "by-type": string };
  };
  preferences: {
    key: string;
    value: Preferences;
  };
  dictionaryCache: {
    key: string;
    value: { slug: string; data: unknown; cachedAt: number };
  };
  analytics: {
    key: string;
    value: AnalyticsEvent;
    indexes: { "by-synced": number; "by-timestamp": number };
  };
}

export type DuraDB = IDBPDatabase<DuraDBSchema>;

let dbPromise: Promise<DuraDB> | null = null;

export function getDB(): Promise<DuraDB> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in the browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB<DuraDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("progress")) {
          const store = db.createObjectStore("progress", { keyPath: "lessonId" });
          store.createIndex("by-phase", "phaseId");
          store.createIndex("by-module", "moduleId");
          store.createIndex("by-synced", "synced");
        }
        if (!db.objectStoreNames.contains("moduleProgress")) {
          const store = db.createObjectStore("moduleProgress", { keyPath: "moduleId" });
          store.createIndex("by-phase", "phaseId");
        }
        if (!db.objectStoreNames.contains("phaseProgress")) {
          db.createObjectStore("phaseProgress", { keyPath: "phaseId" });
        }
        if (!db.objectStoreNames.contains("flashcards")) {
          const store = db.createObjectStore("flashcards", { keyPath: "id" });
          store.createIndex("by-due", "due");
          store.createIndex("by-lesson", "lessonId");
          store.createIndex("by-state", "state");
        }
        if (!db.objectStoreNames.contains("reviewLogs")) {
          const store = db.createObjectStore("reviewLogs", { keyPath: "id" });
          store.createIndex("by-card", "cardId");
          store.createIndex("by-reviewed", "reviewedAt");
        }
        if (!db.objectStoreNames.contains("goals")) {
          const store = db.createObjectStore("goals", { keyPath: "id" });
          store.createIndex("by-type", "type");
        }
        if (!db.objectStoreNames.contains("preferences")) {
          db.createObjectStore("preferences", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("dictionaryCache")) {
          db.createObjectStore("dictionaryCache", { keyPath: "slug" });
        }
        if (!db.objectStoreNames.contains("analytics")) {
          const store = db.createObjectStore("analytics", { keyPath: "id" });
          store.createIndex("by-synced", "synced");
          store.createIndex("by-timestamp", "timestamp");
        }
      },
      blocked() {
        console.warn("[dura-db] upgrade blocked by another tab");
      },
      blocking() {
        console.warn("[dura-db] this tab is blocking an upgrade");
      },
      terminated() {
        console.error("[dura-db] connection terminated unexpectedly");
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}
