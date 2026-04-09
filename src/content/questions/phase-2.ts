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

  // ── Module 2-2: CSS Fundamentals ─────────────────────────────────────────
  q(
    "2-2-q1",
    "2-2",
    "multiple-choice",
    "What does `box-sizing: border-box` do?",
    [
      "Makes the box invisible",
      "Includes padding and border in the element's total width/height",
      "Removes all borders",
      "Centers the box",
    ],
    1,
    "border-box means padding and border are inside the declared width, not added to it.",
    "easy",
    ["box-model", "css"]
  ),
  q(
    "2-2-q2",
    "2-2",
    "multiple-choice",
    "Which CSS display value makes an element take the full width and start on a new line?",
    ["inline", "block", "inline-block", "flex"],
    1,
    "Block elements take the full width and start on a new line. Inline elements do not.",
    "easy",
    ["display", "css"]
  ),
  q(
    "2-2-q3",
    "2-2",
    "multiple-choice",
    "In flexbox, which property aligns items along the main axis?",
    ["align-items", "justify-content", "flex-wrap", "flex-direction"],
    1,
    "justify-content aligns along the main axis; align-items aligns along the cross axis.",
    "easy",
    ["flexbox", "css"]
  ),
  q(
    "2-2-q4",
    "2-2",
    "true-false",
    "True or false: CSS Grid and Flexbox solve different layout problems and are often used together.",
    ["True", "False"],
    0,
    "Grid is for 2D layouts; Flexbox is for 1D. They complement each other.",
    "easy",
    ["grid", "flexbox"]
  ),
  q(
    "2-2-q5",
    "2-2",
    "multiple-choice",
    "What does 'mobile-first' mean in responsive design?",
    [
      "Design for desktop first, then adapt",
      "Write CSS for small screens first, then add media queries for larger screens",
      "Only support mobile devices",
      "Use only viewport units",
    ],
    1,
    "Mobile-first means base styles target small screens; @media (min-width) adds complexity for larger viewports.",
    "medium",
    ["responsive", "mobile-first"]
  ),
  q(
    "2-2-q6",
    "2-2",
    "multiple-choice",
    "Which position value keeps an element in normal flow but offsets it relative to its original position?",
    ["static", "relative", "absolute", "fixed"],
    1,
    "relative offsets from the element's normal position without removing it from flow.",
    "medium",
    ["position", "css"]
  ),
  q(
    "2-2-q7",
    "2-2",
    "multiple-choice",
    "Which CSS property should you prefer for animations to avoid triggering layout recalculations?",
    ["top/left", "margin", "transform", "width/height"],
    2,
    "transform and opacity are composited on the GPU. top/left/margin trigger layout.",
    "medium",
    ["animation", "performance"]
  ),
  q(
    "2-2-q8",
    "2-2",
    "multiple-choice",
    "What does the CSS `fr` unit represent in Grid?",
    ["Fixed pixels", "A fraction of the available space", "Font-relative size", "Full row"],
    1,
    "fr distributes remaining space proportionally. 1fr 2fr gives a 1:2 ratio.",
    "medium",
    ["grid", "fr"]
  ),
  q(
    "2-2-q9",
    "2-2",
    "multiple-choice",
    "Which CSS selector has the highest specificity?",
    [".class", "#id", "element", "*"],
    1,
    "ID selectors (#) have higher specificity than class (.) which beats element selectors.",
    "hard",
    ["specificity", "selector"]
  ),
  q(
    "2-2-q10",
    "2-2",
    "multiple-choice",
    "What does `position: sticky` do?",
    [
      "Removes the element from flow",
      "Acts like relative until a scroll threshold, then like fixed",
      "Centers the element",
      "Makes the element invisible",
    ],
    1,
    "sticky toggles between relative and fixed based on the scroll position.",
    "hard",
    ["position", "sticky"]
  ),
];
