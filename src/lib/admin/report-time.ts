/** Capture the server report window outside React rendering; never sent as learner state. */
export function currentReportTime(): number {
  return Date.now();
}
