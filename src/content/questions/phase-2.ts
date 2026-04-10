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

  // ── Module 2-3: JavaScript in the Browser ────────────────────────────────
  q(
    "2-3-q1",
    "2-3",
    "multiple-choice",
    "What does the DOM stand for?",
    ["Document Object Model", "Data Object Manager", "Display Output Method", "Dynamic Object Map"],
    0,
    "The DOM is a live tree of objects the browser creates from your HTML, which JavaScript can read and modify.",
    "easy",
    ["dom"]
  ),
  q(
    "2-3-q2",
    "2-3",
    "multiple-choice",
    "Which method selects the first element matching a CSS selector?",
    ["getElementById", "querySelector", "getElement", "selectFirst"],
    1,
    "querySelector accepts any valid CSS selector and returns the first matching element, or null.",
    "easy",
    ["dom", "querySelector"]
  ),
  q(
    "2-3-q3",
    "2-3",
    "true-false",
    "True or false: setting innerHTML is always safe for inserting user-supplied text.",
    ["True", "False"],
    1,
    "innerHTML parses HTML, so user text with <script> tags or event attributes can execute as XSS. Use textContent for plain text.",
    "easy",
    ["dom-manipulation", "xss", "security"]
  ),
  q(
    "2-3-q4",
    "2-3",
    "multiple-choice",
    "What does event.preventDefault() do?",
    [
      "Stops the event from bubbling up",
      "Cancels the browser's default behavior for the event",
      "Removes the event listener",
      "Prevents the event from firing at all",
    ],
    1,
    "preventDefault() stops the browser's default action (e.g., form submission, link navigation) while still running your handler.",
    "easy",
    ["events", "preventDefault"]
  ),
  q(
    "2-3-q5",
    "2-3",
    "multiple-choice",
    "What does fetch() return?",
    ["The response body directly", "A Promise", "An XMLHttpRequest", "A callback"],
    1,
    "fetch() returns a Promise that resolves to a Response object. You then call .json() (also a Promise) to parse the body.",
    "medium",
    ["fetch", "promise"]
  ),
  q(
    "2-3-q6",
    "2-3",
    "multiple-choice",
    "What is event delegation?",
    [
      "Adding separate listeners to every child element",
      "Listening on a parent element and checking event.target to handle child events",
      "Forwarding events to a server",
      "Preventing events from firing on child elements",
    ],
    1,
    "Event delegation uses bubbling: one listener on the parent checks event.target to act on the right child — efficient for dynamic lists.",
    "medium",
    ["events", "event-delegation", "bubbling"]
  ),
  q(
    "2-3-q7",
    "2-3",
    "multiple-choice",
    "What is the primary difference between localStorage and sessionStorage?",
    [
      "localStorage is faster",
      "sessionStorage is cleared when the tab closes; localStorage persists until explicitly removed",
      "localStorage is encrypted; sessionStorage is not",
      "They are identical in behavior",
    ],
    1,
    "sessionStorage scopes data to the tab's lifetime. localStorage persists across sessions until the user or code clears it.",
    "medium",
    ["localStorage", "sessionStorage"]
  ),
  q(
    "2-3-q8",
    "2-3",
    "multiple-choice",
    "Which browser API is best for detecting when an element enters the viewport?",
    ["scroll event listener", "setInterval polling", "Intersection Observer", "MutationObserver"],
    2,
    "IntersectionObserver fires a callback when target elements enter or leave the viewport — far more efficient than scroll events.",
    "medium",
    ["intersection-observer", "browser-apis"]
  ),
  q(
    "2-3-q9",
    "2-3",
    "multiple-choice",
    "What triggers a browser reflow?",
    [
      "Changing an element's color",
      "Adding a CSS class that changes the element's width",
      "Changing opacity",
      "Modifying a CSS custom property",
    ],
    1,
    "Reflow (layout recalculation) is triggered by geometry changes: width, height, padding, margin, etc. Color changes cause repaint only.",
    "hard",
    ["dom-performance", "reflow"]
  ),
  q(
    "2-3-q10",
    "2-3",
    "multiple-choice",
    "In a vanilla JS todo app using the state-first pattern, what is the single source of truth?",
    [
      "The DOM elements",
      "The CSS classes",
      "A JavaScript array or object holding the current data",
      "The URL hash",
    ],
    2,
    "State-first means your JS array IS the truth. The DOM is always derived from it by calling render(). Never read state back from the DOM.",
    "hard",
    ["state-first", "vanilla-js", "dom"]
  ),

  // ── Module 2-4: React Fundamentals ───────────────────────────────────────
  q(
    "2-4-q1",
    "2-4",
    "multiple-choice",
    "What problem does React's virtual DOM solve?",
    [
      "It makes the browser load pages faster",
      "It minimizes expensive real DOM updates by diffing a JS object tree first",
      "It eliminates the need for CSS",
      "It replaces the browser's HTML parser",
    ],
    1,
    "React diffs virtual DOM trees in JS (cheap), then applies only the minimal real DOM changes (expensive).",
    "easy",
    ["virtual-dom", "react", "reconciliation"]
  ),
  q(
    "2-4-q2",
    "2-4",
    "true-false",
    "True or false: JSX is valid JavaScript and runs directly in the browser without a build step.",
    ["True", "False"],
    1,
    "JSX must be compiled to React.createElement() calls by a build tool (Babel, SWC, esbuild). Browsers do not understand JSX.",
    "easy",
    ["jsx", "build-tool"]
  ),
  q(
    "2-4-q3",
    "2-4",
    "multiple-choice",
    "Why must you call the setter function from useState instead of mutating state directly?",
    [
      "Direct mutation is a syntax error",
      "React only schedules a re-render when you call the setter — direct mutation is invisible to React",
      "The setter applies the change asynchronously",
      "useState returns a read-only value",
    ],
    1,
    "React tracks state changes by intercepting setter calls. Mutating the value directly bypasses React's knowledge, so the UI won't update.",
    "easy",
    ["useState", "state", "re-render"]
  ),
  q(
    "2-4-q4",
    "2-4",
    "multiple-choice",
    "What does the dependency array in useEffect control?",
    [
      "The order in which effects run",
      "Which components are allowed to call the effect",
      "When the effect re-runs — it re-runs only when one of the listed values changes",
      "How many times the effect can run total",
    ],
    2,
    "[] runs once (mount only); [a, b] re-runs when a or b changes; omitting it runs after every render.",
    "medium",
    ["useEffect", "dependency-array"]
  ),
  q(
    "2-4-q5",
    "2-4",
    "multiple-choice",
    "Why is using the array index as a key prop problematic for reorderable lists?",
    [
      "Array indexes are strings, not numbers",
      "Indexes change when items reorder, causing React to match the wrong elements and corrupt component state",
      "React does not accept numeric keys",
      "Index-based keys prevent re-renders",
    ],
    1,
    "When you reorder, index 0 still maps to index 0 in the new list — React thinks it's the same element and doesn't re-initialize it.",
    "medium",
    ["key-prop", "list-rendering"]
  ),
  q(
    "2-4-q6",
    "2-4",
    "multiple-choice",
    "What is a controlled input in React?",
    [
      "An input rendered inside a form element",
      "An input whose value is driven by React state via the value prop",
      "An input with built-in validation",
      "An input that cannot be edited by the user",
    ],
    1,
    "Controlled: value={state} + onChange={setter}. React owns the value. Uncontrolled: the DOM owns the value, accessed via a ref.",
    "medium",
    ["controlled-input", "forms"]
  ),
  q(
    "2-4-q7",
    "2-4",
    "multiple-choice",
    "What does `condition && <Component />` render when condition is 0?",
    [
      "Nothing — 0 is falsy so the component is skipped",
      "The number 0 is rendered in the DOM",
      "An error is thrown",
      "The component renders with a default prop",
    ],
    1,
    "&&-short-circuit returns the left operand when falsy. 0 is falsy — but React renders the number 0 as text. Use !!condition or condition > 0.",
    "hard",
    ["conditional-rendering", "jsx"]
  ),
  q(
    "2-4-q8",
    "2-4",
    "true-false",
    "True or false: React hooks can be called inside if statements or loops.",
    ["True", "False"],
    1,
    "Hooks must be called at the top level of a component or custom hook — never conditionally or in loops. React relies on call order to track hook state.",
    "medium",
    ["hook-rules", "useState", "useEffect"]
  ),
  q(
    "2-4-q9",
    "2-4",
    "multiple-choice",
    "When should you reach for React Context?",
    [
      "Whenever you need to share state between any two components",
      "For frequently-updated data like mouse position or scroll offset",
      "For slowly-changing global data like theme, locale, or authenticated user",
      "Instead of useState for all component state",
    ],
    2,
    "Context is best for data that changes infrequently and needs to be accessible deep in the tree. Frequent updates cause all consumers to re-render.",
    "hard",
    ["context", "prop-drilling", "performance"]
  ),
  q(
    "2-4-q10",
    "2-4",
    "multiple-choice",
    "In the state-first pattern for a flashcard app, where should the deck array live?",
    [
      "In a global CSS variable",
      "In the DOM as data attributes",
      "In React state (useState or useReducer) so renders derive from it",
      "In a separate JSON file loaded each render",
    ],
    2,
    "State-first: the JS array is the truth. The UI renders from state. Changes flow from state, not from the DOM.",
    "hard",
    ["state-design", "react", "state-first"]
  ),

  // ── Module 2-5: Next.js 15 ────────────────────────────────────────────────
  q(
    "2-5-q1",
    "2-5",
    "multiple-choice",
    "What does SSR stand for and what is its key advantage?",
    [
      "Static Site Rendering — faster build times",
      "Server-Side Rendering — HTML is generated on the server per request, improving initial load and SEO",
      "Slow Script Running — improves accessibility",
      "Shared State Repository — syncs state across tabs",
    ],
    1,
    "SSR sends complete HTML from the server so users and crawlers see content immediately, before JavaScript loads.",
    "easy",
    ["ssr", "rendering"]
  ),
  q(
    "2-5-q2",
    "2-5",
    "multiple-choice",
    "What is the role of layout.tsx in the App Router?",
    [
      "It defines API endpoints for the route",
      "It wraps its segment's pages in a persistent shell that does not remount on navigation",
      "It replaces page.tsx for static routes",
      "It contains the route's loading animation",
    ],
    1,
    "layout.tsx wraps child pages and segments. It persists across navigations within its scope — the shell stays mounted.",
    "easy",
    ["layout", "app-router"]
  ),
  q(
    "2-5-q3",
    "2-5",
    "multiple-choice",
    "What can a Server Component do that a Client Component cannot?",
    [
      "Handle onClick events",
      "Use useState",
      "Directly access a database or the filesystem without exposing credentials to the browser",
      "Render JSX",
    ],
    2,
    "Server Components run only on the server — they can read env vars, hit databases, and read files. None of their server-only code is sent to the client.",
    "easy",
    ["server-component", "security"]
  ),
  q(
    "2-5-q4",
    "2-5",
    "multiple-choice",
    "What does `cache: 'no-store'` do in a Next.js fetch call?",
    [
      "Disables the browser cache",
      "Tells Next.js to never cache this response — always fetch fresh data per request",
      "Stores the response in localStorage",
      "Enables streaming for this response",
    ],
    1,
    "no-store opts out of Next.js's extended fetch cache, making the route dynamic — data is always fresh from the origin.",
    "medium",
    ["data-fetching", "cache-strategy"]
  ),
  q(
    "2-5-q5",
    "2-5",
    "multiple-choice",
    "What is the purpose of `generateStaticParams`?",
    [
      "It generates CSS custom properties at build time",
      "It tells Next.js which dynamic route values to pre-render as static HTML at build time",
      "It creates API route parameters automatically",
      "It validates route params at runtime",
    ],
    1,
    "generateStaticParams returns an array of param objects. Next.js pre-renders each combination as a static HTML file.",
    "medium",
    ["generateStaticParams", "static-generation"]
  ),
  q(
    "2-5-q6",
    "2-5",
    "multiple-choice",
    "What makes Server Actions different from traditional API routes?",
    [
      "Server Actions run on the client",
      "Server Actions are called directly from components without manually defining an API endpoint",
      "Server Actions only work with GET requests",
      "Server Actions require a separate server process",
    ],
    1,
    "Server Actions are async functions marked 'use server' that can be imported and called directly — Next.js handles the network round-trip automatically.",
    "medium",
    ["server-action", "forms"]
  ),
  q(
    "2-5-q7",
    "2-5",
    "true-false",
    "True or false: environment variables prefixed with NEXT_PUBLIC_ are accessible in both server and client code.",
    ["True", "False"],
    0,
    "NEXT_PUBLIC_ variables are inlined into the client bundle at build time and available everywhere. Variables without this prefix are server-only.",
    "medium",
    ["environment-variable", "deployment"]
  ),
  q(
    "2-5-q8",
    "2-5",
    "multiple-choice",
    "In Tailwind CSS v4, where do you define custom design tokens?",
    ["tailwind.config.js", "theme.json", "The @theme block in globals.css", "next.config.ts"],
    2,
    "Tailwind v4 eliminates the config file. Custom tokens (colors, fonts, spacing) go in @theme inside your CSS file.",
    "medium",
    ["tailwind-v4", "design-token"]
  ),
  q(
    "2-5-q9",
    "2-5",
    "multiple-choice",
    "What does middleware.ts in Next.js do?",
    [
      "Adds CSS preprocessing",
      "Runs on every matching request before it reaches the page — used for auth, redirects, and A/B testing",
      "Replaces the API layer",
      "Compiles TypeScript before deployment",
    ],
    1,
    "Middleware runs at the edge before the request hits the route. It can rewrite URLs, redirect, add headers, or block unauthorized requests.",
    "hard",
    ["middleware", "edge-runtime"]
  ),
  q(
    "2-5-q10",
    "2-5",
    "multiple-choice",
    "What is Incremental Static Regeneration (ISR) in Next.js?",
    [
      "Rebuilding the entire site every hour",
      "Serving a cached static page and regenerating it in the background after a specified time interval",
      "Loading page sections incrementally as the user scrolls",
      "Running server-side code on every request",
    ],
    1,
    "ISR: `next: {revalidate: N}` serves the cached page immediately, then regenerates it in the background after N seconds. Best of both static and dynamic.",
    "hard",
    ["isr", "cache-strategy", "revalidation"]
  ),
];
