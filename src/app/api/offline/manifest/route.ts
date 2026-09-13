import { PRACTICAL_LABS } from "@/lib/labs";
import { JUDGMENT_CASES } from "@/lib/judgment/cases";
import { listAllLessons } from "@/lib/curriculum";

/** Enumerate every authored lesson and its curriculum navigation pages for an explicit offline download. */
export async function GET(): Promise<Response> {
  try {
    const tree = await listAllLessons();
    const pages = new Set<string>([
      "/paths",
      "/labs",
      ...PRACTICAL_LABS.flatMap((lab) => [`/labs/${lab.id}`, `/labs/${lab.id}.zip`]),
      "/offline",
      "/judgment",
      "/judgment/guide",
      ...JUDGMENT_CASES.map((scenario) => `/judgment/${scenario.id}`),
    ]);
    let lessons = 0;
    for (const phase of tree) {
      pages.add(`/paths/${phase.phase.id}`);
      for (const entry of phase.modules) {
        pages.add(`/paths/${phase.phase.id}/${entry.module.id}`);
        for (const lesson of entry.lessons) {
          pages.add(`/paths/${phase.phase.id}/${entry.module.id}/${lesson.id}`);
          lessons++;
        }
      }
    }
    return Response.json({ pages: [...pages], lessons });
  } catch (error) {
    console.error("[offline] Curriculum manifest unavailable", error);
    return Response.json(
      { error: "The curriculum download list could not be loaded." },
      { status: 503 }
    );
  }
}
