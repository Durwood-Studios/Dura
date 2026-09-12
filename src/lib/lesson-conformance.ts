/** Machine-checkable LP-1.0 findings. Passing does not replace a pedagogical review. */
export interface LessonConformanceInput {
  frontmatter: Record<string, unknown>;
  body: string;
}

function isTextList(value: unknown, allowEmpty: boolean = false): value is string[] {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every((item: unknown): boolean => typeof item === "string" && item.trim().length > 0)
  );
}

function writtenAssessmentMatches(assessment: string, bloom: unknown): boolean {
  const exercises: string[] = [];
  for (const match of assessment.matchAll(/<WrittenExercise\b/g)) {
    const start = match.index;
    let quote = "";
    let isEscaped = false;
    for (let index = start; index < assessment.length; index += 1) {
      const character = assessment[index];
      if (quote) {
        if (isEscaped) isEscaped = false;
        else if (character === "\\") isEscaped = true;
        else if (character === quote) quote = "";
      } else if (['"', "'", "`"].includes(character)) quote = character;
      else if (assessment.slice(index, index + 2) === "/>") {
        exercises.push(assessment.slice(start, index + 2));
        break;
      }
    }
  }
  return exercises.some((exercise: string): boolean => {
    const readText = (name: string): string => {
      const attribute = exercise.match(
        new RegExp(
          `${name}=\\s*(?:\\{\\s*)?(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)'|\x60([\\s\\S]+?)\x60)`
        )
      );
      return attribute?.[1] ?? attribute?.[2] ?? attribute?.[3] ?? "";
    };
    const instructions = readText("instructions");
    const answer = readText("modelAnswer");
    const rubric = exercise.match(/rubric=\{\[([\s\S]+?)\]\}/)?.[1] ?? "";
    if (instructions.trim().length < 20 || answer.trim().length < 20) return false;
    if ([...rubric.matchAll(/(?:"[^"\n]+"|'[^'\n]+'|`[^`]+`)/g)].length < 3) return false;
    // A prose assessment needs a task at the claimed level, not merely a revealable answer.
    if (bloom === "analyze")
      return /\b(analy[sz]e|compare|trace|classify|distinguish)\b/i.test(instructions);
    if (bloom === "evaluate")
      return (
        /\b(justify|defend|evaluate)\b/i.test(instructions) &&
        /\b(compare|alternative|trade.?off|criteria)\b/i.test(instructions)
      );
    if (bloom === "create")
      return (
        /\b(design|create|build|propose)\b/i.test(instructions) &&
        /\b(explain|justify|reflect|defend)\b/i.test(instructions)
      );
    return (
      bloom === "apply" &&
      /\b(apply|produce|write|construct|implement|calculate|solve)\b/i.test(instructions)
    );
  });
}

/** Check metadata, section order, practice, and assessment structure without executing MDX. */
export function auditLesson({ frontmatter, body }: LessonConformanceInput): string[] {
  const issues: string[] = [];
  for (const field of ["title", "description", "module"]) {
    if (typeof frontmatter[field] !== "string" || !frontmatter[field].trim()) {
      issues.push(`metadata:${field}`);
    }
  }
  for (const field of ["phase", "order", "estimatedMinutes"]) {
    if (
      typeof frontmatter[field] !== "number" ||
      !Number.isFinite(frontmatter[field]) ||
      frontmatter[field] < (field === "phase" ? 0 : 1)
    ) {
      issues.push(`metadata:${field}`);
    }
  }
  if (![1, 2, 3, 4, 5].includes(Number(frontmatter.difficulty))) {
    issues.push("metadata:difficulty");
  }
  if (!isTextList(frontmatter.prerequisites, true)) issues.push("metadata:prerequisites");
  if (!isTextList(frontmatter.vocabulary, true)) issues.push("metadata:vocabulary");
  if (!isTextList(frontmatter.learningOutcomes)) {
    issues.push("metadata:learningOutcomes");
  } else if (
    frontmatter.learningOutcomes.some((outcome: string): boolean =>
      /^(understand|know|learn|appreciate)\b/i.test(outcome)
    )
  ) {
    issues.push("outcomes:unmeasurable");
  }
  if (typeof frontmatter.thresholdConcept !== "boolean") issues.push("metadata:thresholdConcept");
  const standards = frontmatter.standards;
  const hasStandards = typeof standards === "object" && standards !== null;
  const bloom = hasStandards && "bloom" in standards ? standards.bloom : undefined;
  const dreyfus = hasStandards && "dreyfus" in standards ? standards.dreyfus : undefined;
  if (!["remember", "understand", "apply", "analyze", "evaluate", "create"].includes(String(bloom)))
    issues.push("metadata:bloom");
  if (
    !["novice", "advanced-beginner", "competent", "proficient", "expert"].includes(String(dreyfus))
  )
    issues.push("metadata:dreyfus");
  if (
    Number(frontmatter.phase) >= 4 &&
    (!hasStandards || !("sfia" in standards) || typeof standards.sfia !== "number")
  )
    issues.push("metadata:sfia");
  if (
    ["evaluate", "create"].includes(String(bloom)) &&
    (typeof frontmatter.professionalContext !== "string" || !frontmatter.professionalContext.trim())
  )
    issues.push("metadata:professionalContext");

  const headings = [...body.matchAll(/^## (.+)$/gm)];
  if (headings[0]?.[1].toLowerCase() !== "why this matters") issues.push("structure:opening");
  const check = body.indexOf("## Check your understanding");
  const recap = body.indexOf("## What you learned");
  if (check < 0 || recap < check) issues.push("structure:assessment-and-recap");
  const beforeCheck = check < 0 ? body : body.slice(0, check);
  if (!/^> .+/m.test(beforeCheck)) issues.push("structure:mental-model");
  if (
    !/<(?:SandboxExercise|FillBlank|ParsonsPanel)\b/.test(beforeCheck) &&
    !(/<details>/.test(beforeCheck) && /<summary>/.test(beforeCheck))
  )
    issues.push("structure:practice");
  const assessment = check < 0 ? "" : body.slice(check, recap < 0 ? undefined : recap);
  const component =
    bloom === "remember" ? "FillBlank" : bloom === "understand" ? "Quiz" : "SandboxExercise";
  if (
    !new RegExp(`<${component}\\b`).test(assessment) &&
    !writtenAssessmentMatches(assessment, bloom)
  )
    issues.push("assessment:bloom-shape");
  if (frontmatter.thresholdConcept === true && !body.includes("What changes for you after this"))
    issues.push("structure:threshold-callout");
  const summary = recap < 0 ? "" : body.slice(recap).split(/\n## /, 1)[0];
  const bulletCount = [...summary.matchAll(/^- /gm)].length;
  if (bulletCount < 3 || bulletCount > 5) issues.push("structure:recap-bullets");
  return issues.sort();
}
