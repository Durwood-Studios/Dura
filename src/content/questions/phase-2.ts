import type { AssessmentQuestion } from "@/types/assessment";

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "2",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_2_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 2-1: HTML Foundations ─────────────────────────────────────────
  q(
    "2-1-q1",
    "2-1",
    "multiple-choice",
    "What does an HTML attribute do?",
    [
      "Styles the element",
      "Adds information or behavior to an element",
      "Closes the element",
      "Creates a new page",
    ],
    1,
    "Attributes add metadata or behavior — like href on a link or src on an image.",
    "easy",
    ["html", "attribute"]
  ),
  q(
    "2-1-q2",
    "2-1",
    "true-false",
    "True or false: every HTML element requires a closing tag.",
    ["True", "False"],
    1,
    "Self-closing elements like <br /> and <img /> have no closing tag.",
    "easy",
    ["html", "self-closing"]
  ),
  q(
    "2-1-q3",
    "2-1",
    "multiple-choice",
    "What happens if you omit <!DOCTYPE html>?",
    [
      "The page won't load",
      "The browser enters quirks mode",
      "JavaScript is disabled",
      "Nothing changes",
    ],
    1,
    "Without DOCTYPE, browsers fall back to quirks mode rendering.",
    "easy",
    ["doctype", "html"]
  ),
  q(
    "2-1-q4",
    "2-1",
    "multiple-choice",
    "Which element is the correct way to label a form input for accessibility?",
    ["<span>", "<div>", "<label>", "<p>"],
    2,
    "The <label> element associates text with a form control for screen readers and click targets.",
    "easy",
    ["form", "label", "accessibility"]
  ),
  q(
    "2-1-q5",
    "2-1",
    "multiple-choice",
    "What is the purpose of the alt attribute on an <img> tag?",
    [
      "Sets the image size",
      "Provides a tooltip on hover",
      "Describes the image for screen readers and when the image fails to load",
      "Links to another page",
    ],
    2,
    "Alt text is essential for accessibility and is displayed when the image cannot be loaded.",
    "medium",
    ["img", "alt", "accessibility"]
  ),
  q(
    "2-1-q6",
    "2-1",
    "multiple-choice",
    "Which is a semantic HTML element?",
    ["<div>", "<span>", "<article>", "<b>"],
    2,
    "<article> has semantic meaning (self-contained content). <div> and <span> are generic containers.",
    "medium",
    ["semantic-html"]
  ),
  q(
    "2-1-q7",
    "2-1",
    "multiple-select",
    "Which are semantic HTML5 elements? Select all that apply.",
    ["<header>", "<div>", "<nav>", "<span>"],
    [0, 2],
    "<header> and <nav> carry semantic meaning. <div> and <span> are generic.",
    "medium",
    ["semantic-html"]
  ),
  q(
    "2-1-q8",
    "2-1",
    "multiple-choice",
    "What does ARIA stand for?",
    [
      "Accessible Rich Internet Applications",
      "Automated Rendering Interface API",
      "Applied Responsive Interface Architecture",
      "Accessible Resource Indexing Algorithm",
    ],
    0,
    "ARIA provides roles and attributes that make dynamic content accessible to assistive technologies.",
    "medium",
    ["aria", "accessibility"]
  ),
  q(
    "2-1-q9",
    "2-1",
    "multiple-choice",
    "When should you use a <table> in HTML?",
    [
      "For page layout",
      "For displaying tabular data",
      "For navigation menus",
      "For image galleries",
    ],
    1,
    "Tables are for tabular data only. Use CSS (flexbox/grid) for layout.",
    "hard",
    ["table", "html"]
  ),
  q(
    "2-1-q10",
    "2-1",
    "multiple-choice",
    "What is the purpose of a skip link?",
    [
      "Skips to the next page",
      "Lets keyboard users skip the navigation and jump to main content",
      "Skips loading CSS",
      "Skips JavaScript execution",
    ],
    1,
    "Skip links improve keyboard navigation by letting users bypass repeated navigation blocks.",
    "hard",
    ["accessibility", "skip-link"]
  ),
];
