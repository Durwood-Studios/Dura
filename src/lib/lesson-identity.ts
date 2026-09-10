/** Stable record identity; route lesson IDs remain short for existing links. */
export function lessonIdentity(phaseId: string, moduleId: string, lessonId: string): string {
  return `${phaseId}/${moduleId}/${lessonRouteId(lessonId)}`;
}

/** Recover the final URL segment from a durable lesson identity. */
export function lessonRouteId(lessonId: string): string {
  return lessonId.split("/").at(-1) ?? lessonId;
}
