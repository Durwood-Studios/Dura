import { PHASES, TOTAL_HOURS, TOTAL_LESSONS, TOTAL_MODULES } from "@/content/phases";
import { jsonResponse, optionsResponse } from "../_lib";

export function GET(): Response {
  return jsonResponse({
    totals: {
      phases: PHASES.length,
      modules: TOTAL_MODULES,
      lessons: TOTAL_LESSONS,
      hours: TOTAL_HOURS,
    },
    phases: PHASES.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      color: p.color,
      estimatedHours: p.estimatedHours,
      moduleCount: p.moduleCount,
      lessonCount: p.lessonCount,
      order: p.order,
      modules: p.modules,
    })),
  });
}

export function OPTIONS(): Response {
  return optionsResponse();
}
