import { activityIdentity } from "@/lib/activity-evidence";

interface ActivityNode {
  name?: string | null;
  children?: ActivityNode[];
  attributes?: unknown[];
  position?: { start: { offset?: number }; end: { offset?: number } };
}

/** Inject source-versioned identities while collecting every required lesson activity. */
export function lessonActivities(
  body: string,
  lessonId: string,
  required: string[]
): () => (tree: ActivityNode) => void {
  return () =>
    (tree: ActivityNode): void => {
      const occurrences = new Map<string, number>();
      const visit = (node: ActivityNode): void => {
        if (
          node.name &&
          ["Quiz", "FillBlank", "ParsonsPanel", "WrittenExercise", "SandboxExercise"].includes(
            node.name
          )
        ) {
          const source = body.slice(node.position?.start.offset, node.position?.end.offset);
          const base = activityIdentity(node.name, source);
          const occurrence = occurrences.get(base) ?? 0;
          occurrences.set(base, occurrence + 1);
          const id = `${base}:${occurrence}`;
          required.push(id);
          node.attributes ??= [];
          node.attributes.push(
            { type: "mdxJsxAttribute", name: "activityId", value: id },
            { type: "mdxJsxAttribute", name: "activityLessonId", value: lessonId }
          );
        }
        node.children?.forEach(visit);
      };
      visit(tree);
    };
}
