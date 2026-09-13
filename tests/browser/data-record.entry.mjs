import { getDB, closeLearnerDatabase } from "@/lib/db";
import { selectStorageOwner } from "@/lib/storage/owner";
import { resolveEncryptionKey } from "@/lib/idb/encryption-key";
import { setActiveKey } from "@/lib/idb/active-key";
import { putCard, getAllCards } from "@/lib/db/flashcards";
import { createCard } from "@/lib/fsrs";
import { adoptGuestRecord } from "@/lib/learner-record/adopt-guest";
import { exportLearnerRecord } from "@/lib/learner-record/export";
import { parseLearnerRecordZip, applyLearnerRecord } from "@/lib/learner-record/import";
Object.assign(window, {
  dataTest: {
    getDB,
    closeLearnerDatabase,
    selectStorageOwner,
    resolveEncryptionKey,
    setActiveKey,
    putCard,
    getAllCards,
    createCard,
    adoptGuestRecord,
    exportLearnerRecord,
    parseLearnerRecordZip,
    applyLearnerRecord,
  },
});
import { buildLearnerSnapshot, restoreSnapshotToIDB } from "@/lib/storage/snapshot";
Object.assign(window.dataTest, { buildLearnerSnapshot, restoreSnapshotToIDB });

import { getJudgmentAttempts, saveJudgmentAttempt } from "@/lib/db/judgment";
Object.assign(window.dataTest, { getJudgmentAttempts, saveJudgmentAttempt });

import { buildPortableRecord, applyPortableRecord } from "@/lib/learner-record/portable";
Object.assign(window.dataTest, { buildPortableRecord, applyPortableRecord });
