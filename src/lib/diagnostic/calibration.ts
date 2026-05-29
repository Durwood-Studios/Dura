import type { CalibrationFlag, CalibrationReading, ConfidenceLevel } from "./types";

/**
 * Confidence calibration math. Pure function of (correct, confidence).
 *
 * The matrix below is the load-bearing decision and the reason the algorithm
 * is inspectable: a reader can see the entire policy in nine cells.
 *
 *                   confidence 1-2     confidence 3      confidence 4-5
 *   correct: true   underconfident     calibrated        calibrated
 *   correct: false  calibrated         calibrated        overconfident
 *
 * The notes are what the learner reads. They name the metacognitive signal
 * rather than restating the score.
 */

interface Reading {
  flag: CalibrationFlag;
  note: string;
}

function read(correct: boolean, confidence: ConfidenceLevel): Reading {
  if (correct) {
    if (confidence <= 2) {
      return {
        flag: "underconfident",
        note: "You knew this and didn't believe yourself. Trust the signal next time.",
      };
    }
    return { flag: "calibrated", note: "Confidence matched the answer. Locked in." };
  }
  if (confidence >= 4) {
    return {
      flag: "overconfident",
      note: "You were certain and wrong — the most expensive kind of mistake. Slow down on this topic and re-derive from scratch.",
    };
  }
  return {
    flag: "calibrated",
    note: "You weren't sure and you were right to doubt. The shape of the doubt is useful data.",
  };
}

export function calibrate(correct: boolean, confidence: ConfidenceLevel): CalibrationReading {
  const { flag, note } = read(correct, confidence);
  return { confidence, flag, note };
}
