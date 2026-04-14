import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Web & Backend dictionary terms — 70 terms across HTML/CSS, JS Browser,
 * React, Next.js, Node.js, Express/API, and Database topics.
 */
export const WEB_BACKEND_TERMS: DictionaryTerm[] = [
  // ── HTML/CSS (10) ──────────────────────────────────────────────────

  {
    slug: "html",
    term: "HTML",
    aliases: ["HyperText Markup Language"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The language that gives a web page its structure — like the skeleton of a building before paint and furniture go in.",
      intermediate:
        "A declarative markup language that defines the structure and semantics of web content using nested elements and attributes. Browsers parse HTML into the DOM for rendering.",
      advanced:
        "The W3C/WHATWG HTML Living Standard specifies a tree-structured document model parsed by a state-machine tokenizer into a DOM tree. Conformant user agents apply error-recovery rules defined in the spec, making HTML remarkably fault-tolerant compared to XML-based serializations.",
    },
    seeAlso: ["css", "dom", "semantic-html"],
  },
  {
    slug: "css",
    term: "CSS",
    aliases: ["Cascading Style Sheets"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The language that controls how a web page looks — colors, fonts, spacing, and layout — like choosing paint and furniture for a room.",
      intermediate:
        "A style-sheet language that applies visual rules to HTML elements through selectors, properties, and values. The cascade, specificity, and inheritance determine which rules win when conflicts arise.",
      advanced:
        "CSS is a declarative, order-dependent language whose cascade algorithm resolves competing declarations via origin, layer, specificity, scope, and source order. Modern CSS supports custom properties, container queries, and the :has() relational pseudo-class, enabling component-scoped responsive design without JavaScript.",
    },
    seeAlso: ["html", "selector", "flexbox", "grid"],
  },
  {
    slug: "selector",
    term: "Selector",
    aliases: ["CSS selector"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A pattern that tells CSS which HTML elements to style — like writing a name tag so the browser knows who gets dressed up.",
      intermediate:
        "A pattern expression that matches DOM elements by type, class, ID, attribute, or structural position. Selectors are ranked by specificity to resolve conflicts.",
      advanced:
        "Selectors Level 4 defines a grammar of simple, compound, complex, and relative selectors each with a computed specificity triple (id, class, type). Pseudo-elements create styleable abstractions outside the DOM tree, while the :is()/:where()/:has() functional pseudo-classes enable forgiving and relational selection with distinct specificity semantics.",
    },
    seeAlso: ["css", "accessibility-aria"],
  },
  {
    slug: "flexbox",
    term: "Flexbox",
    aliases: ["CSS Flexible Box Layout"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS layout tool that lines items up in a row or column and spaces them evenly — like arranging books on a shelf that adjusts itself.",
      intermediate:
        "A one-dimensional layout model that distributes space among items along a main axis and controls alignment on the cross axis. Flex containers manage sizing via flex-grow, flex-shrink, and flex-basis.",
      advanced:
        "The CSS Flexible Box Layout Module Level 1 defines an intrinsic-size-aware distribution algorithm that resolves flex factors in a multi-pass loop, handling min/max constraints, definite/indefinite container sizes, and intrinsic aspect ratios. The spec distinguishes between the main and cross axes with independent alignment properties (justify-content vs. align-items).",
    },
    seeAlso: ["grid", "css", "responsive"],
  },
  {
    slug: "grid",
    term: "Grid",
    aliases: ["CSS Grid Layout"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS layout system that divides a page into rows and columns — like graph paper you can place content onto.",
      intermediate:
        "A two-dimensional layout model that defines explicit or implicit rows and columns, allowing items to be placed by line number, named area, or auto-placement. Grid enables complex layouts without nesting.",
      advanced:
        "CSS Grid Layout Module Level 2 introduces subgrid, allowing nested grids to participate in the parent's track sizing. The track-sizing algorithm resolves intrinsic, fixed, and flexible (fr) tracks across multiple passes, accounting for spanning items, min/max constraints, and content-based sizing contributions.",
    },
    seeAlso: ["flexbox", "css", "responsive"],
  },
  {
    slug: "responsive",
    term: "Responsive Design",
    aliases: ["responsive web design", "RWD"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Building web pages that look good on any screen size — from a phone to a widescreen monitor — like water that fills whatever container you pour it into.",
      intermediate:
        "A design approach that uses fluid grids, flexible images, and media queries to adapt layouts to the viewport. Mobile-first means writing base styles for small screens and layering enhancements for larger ones.",
      advanced:
        "Responsive design encompasses viewport-relative units (vw, vh, dvh), media queries (width, prefers-color-scheme, prefers-reduced-motion), container queries (@container), and content-visibility for rendering optimization. Modern implementations combine intrinsic sizing (min(), max(), clamp()) with CSS Grid auto-fit/auto-fill to minimize breakpoint-dependent code.",
    },
    seeAlso: ["media-query", "viewport", "flexbox", "grid"],
  },
  {
    slug: "media-query",
    term: "Media Query",
    aliases: ["@media"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS rule that applies styles only when certain conditions are true — like saying 'wear a coat if it's cold outside.'",
      intermediate:
        "A conditional block in CSS that evaluates viewport features (width, height, orientation) or user preferences (color-scheme, reduced-motion) and applies enclosed rules only when the condition matches.",
      advanced:
        "Media Queries Level 5 extends the grammar with range syntax (width >= 768px), custom media queries, and interaction-media features (pointer, hover). The @media rule evaluates against a media query list; each query is a media type plus zero or more feature expressions joined by 'and', 'or', or 'not' with short-circuit evaluation.",
    },
    seeAlso: ["responsive", "viewport", "css"],
  },
  {
    slug: "viewport",
    term: "Viewport",
    aliases: ["browser viewport"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The visible area of a web page on your screen — like the window frame that determines how much of a painting you can see at once.",
      intermediate:
        "The rectangular area in which the browser renders content. The <meta name='viewport'> tag controls initial scale and width on mobile devices, and viewport units (vw, vh) let you size elements relative to it.",
      advanced:
        "CSS defines three viewport variants — small (svw/svh), large (lvw/lvh), and dynamic (dvw/dvh) — to address mobile browser chrome that appears and disappears. The visual viewport (what the user actually sees) can differ from the layout viewport when pinch-zoomed, with the Visual Viewport API exposing offsetLeft, offsetTop, and scale properties.",
    },
    seeAlso: ["responsive", "media-query"],
  },
  {
    slug: "semantic-html",
    term: "Semantic HTML",
    aliases: ["semantic markup"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Using HTML tags that describe their meaning — like labeling boxes 'kitchen' and 'bedroom' instead of just 'box 1' and 'box 2.'",
      intermediate:
        "Choosing HTML elements (<article>, <nav>, <header>, <main>) that convey structural meaning to browsers, search engines, and assistive technologies rather than relying on generic <div> and <span> elements.",
      advanced:
        "Semantic elements map to ARIA landmark roles implicitly (e.g., <nav> → role='navigation'), reducing the need for explicit ARIA attributes. The HTML Accessibility API Mappings spec defines how each element is exposed to the accessibility tree, making correct element choice the single highest-impact accessibility decision.",
    },
    seeAlso: ["html", "accessibility-aria", "dom"],
  },
  {
    slug: "accessibility-aria",
    term: "ARIA",
    aliases: ["Accessible Rich Internet Applications", "WAI-ARIA"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Extra labels you add to web elements so screen readers and assistive tools can understand what things do — like adding braille signs to doors.",
      intermediate:
        "A W3C specification that provides roles, states, and properties (aria-label, aria-expanded, role='dialog') to make dynamic web content accessible when native HTML semantics are insufficient.",
      advanced:
        "WAI-ARIA 1.2 defines a contract between web content and the platform accessibility API (UIA, ATK, AX). The taxonomy of roles (widget, document-structure, landmark, live-region) constrains which aria-* attributes are valid per role. The first rule of ARIA is to prefer native HTML semantics — ARIA should supplement, not replace, correct element usage.",
    },
    seeAlso: ["semantic-html", "html"],
  },

  // ── JavaScript Browser (10) ────────────────────────────────────────

  {
    slug: "dom",
    term: "DOM",
    aliases: ["Document Object Model"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tree-shaped map of your web page that JavaScript can read and change — like a remote control for every element on screen.",
      intermediate:
        "A language-neutral API that represents an HTML or XML document as a tree of nodes. JavaScript uses DOM methods (querySelector, createElement, addEventListener) to read, create, and modify elements in real time.",
      advanced:
        "The DOM Living Standard defines interfaces (Node, Element, Document, Event) implemented by the browser's rendering engine. Mutations trigger style recalculation, layout, and paint phases. MutationObserver provides asynchronous notification of subtree changes without the performance cost of deprecated mutation events.",
    },
    seeAlso: ["html", "event", "virtual-dom"],
  },
  {
    slug: "event",
    term: "Event",
    aliases: ["DOM event", "browser event"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A signal that something happened in the browser — a click, a key press, or a page load — like a doorbell that tells your code someone's there.",
      intermediate:
        "An object dispatched through the DOM when user interaction or system activity occurs. Events propagate in three phases — capture, target, and bubble — and handlers registered via addEventListener respond to them.",
      advanced:
        "The DOM Events spec defines an EventTarget dispatch algorithm that walks the composed path (accounting for shadow DOM boundaries) in capture then bubble order. Events implement the Event interface or subclasses (MouseEvent, KeyboardEvent, InputEvent). Passive listeners (passive: true) hint to the compositor that preventDefault() will not be called, enabling scroll optimization.",
    },
    seeAlso: ["dom", "event-delegation"],
  },
  {
    slug: "event-delegation",
    term: "Event Delegation",
    aliases: ["delegated event handling"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Instead of giving every button its own listener, you put one listener on the parent and let events bubble up — like a receptionist who routes calls for the whole office.",
      intermediate:
        "A pattern where a single event listener on a parent element handles events for multiple children by checking event.target. This reduces memory usage and automatically handles dynamically added elements.",
      advanced:
        "Event delegation exploits the DOM bubble phase, attaching a handler at a common ancestor and using event.target (or closest()) to identify the originating element. This yields O(1) listener registration regardless of child count and avoids listener lifecycle management when child nodes are added or removed. Composed events crossing shadow DOM boundaries require special handling.",
    },
    seeAlso: ["event", "dom"],
  },
  {
    slug: "fetch-api",
    term: "Fetch API",
    aliases: ["fetch", "window.fetch"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A built-in browser tool for requesting data from a server — like sending a letter and waiting for a reply.",
      intermediate:
        "A promise-based API that replaces XMLHttpRequest for making HTTP requests. fetch() returns a Response object with methods for parsing JSON, text, or binary data, and supports headers, methods, and request/response streaming.",
      advanced:
        "The Fetch Living Standard defines a unified request/response model shared by service workers, modules, and the main thread. Requests specify a mode (cors, no-cors, same-origin), credentials policy, cache mode, and redirect handling. ReadableStream bodies enable incremental consumption, and AbortController provides cancellation via the AbortSignal interface.",
    },
    seeAlso: ["rest-api", "cors", "service-worker"],
  },
  {
    slug: "local-storage",
    term: "localStorage",
    aliases: ["Web Storage", "window.localStorage"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A small storage space in the browser that remembers data even after you close the tab — like a sticky note that stays on your fridge.",
      intermediate:
        "A synchronous key-value storage API that persists string data per origin with no expiration. It is limited to roughly 5-10 MB and blocks the main thread on access, making it unsuitable for large or frequent reads/writes.",
      advanced:
        "The Web Storage spec defines localStorage as a synchronous, serialized, origin-scoped storage mechanism backed by disk. Because reads and writes are blocking, contention across tabs triggers implicit locking. For structured data or larger payloads, IndexedDB (asynchronous, transactional, and capable of storing binary/object data) is preferred.",
    },
    seeAlso: ["index-db"],
  },
  {
    slug: "intersection-observer",
    term: "IntersectionObserver",
    aliases: ["Intersection Observer API"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A browser tool that tells you when an element scrolls into or out of view — like a motion sensor that detects when someone walks through a doorway.",
      intermediate:
        "An asynchronous API that observes when a target element's bounding box intersects with an ancestor or the viewport. It is commonly used for lazy loading images, infinite scroll, and scroll-triggered animations without costly scroll-event listeners.",
      advanced:
        "IntersectionObserver batches intersection calculations off the main thread and delivers entries asynchronously via a callback. Each IntersectionObserverEntry provides intersectionRatio, boundingClientRect, and rootBounds. Thresholds (an array of ratio breakpoints) control callback granularity. The v2 spec adds trackVisibility and a delay option for actual-visibility detection, useful for ad viewability measurement.",
    },
    seeAlso: ["dom", "event"],
  },
  {
    slug: "web-worker",
    term: "Web Worker",
    aliases: ["dedicated worker"],
    category: "web",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A background helper that does heavy work without freezing the page — like a kitchen assistant who chops vegetables while the chef cooks.",
      intermediate:
        "A browser API that runs JavaScript in a separate thread, communicating with the main thread via postMessage. Workers cannot access the DOM but can perform CPU-intensive tasks without blocking UI rendering.",
      advanced:
        "Dedicated Workers execute in an isolated global scope (DedicatedWorkerGlobalScope) with its own event loop. Data is passed via the structured clone algorithm or, for zero-copy, Transferable objects (ArrayBuffer, MessagePort, OffscreenCanvas). SharedArrayBuffer enables lock-free concurrent memory access when combined with Atomics, but requires cross-origin isolation headers (COOP/COEP).",
    },
    seeAlso: ["service-worker", "event-loop-node"],
  },
  {
    slug: "service-worker",
    term: "Service Worker",
    aliases: ["SW"],
    category: "web",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A script that sits between your web app and the network, letting your site work offline by caching files — like a librarian who keeps copies of popular books so you don't have to order them every time.",
      intermediate:
        "A type of web worker that intercepts network requests via the fetch event and can serve cached responses, enabling offline support, background sync, and push notifications. Service workers have a distinct lifecycle: install, activate, and idle.",
      advanced:
        "Service workers operate as event-driven proxies registered per scope. The install event pre-caches assets; the activate event cleans stale caches. The fetch event intercepts all in-scope requests, enabling cache-first, network-first, or stale-while-revalidate strategies. Updates follow a byte-for-byte diff check; the new worker enters 'waiting' until all controlled clients close or skipWaiting() is called.",
    },
    seeAlso: ["web-worker", "fetch-api"],
  },
  {
    slug: "web-component",
    term: "Web Component",
    aliases: ["custom element"],
    category: "web",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to create your own reusable HTML tags — like inventing a new LEGO brick that you can snap in anywhere.",
      intermediate:
        "A set of browser standards (Custom Elements, Shadow DOM, HTML Templates) that let you define encapsulated, reusable UI components with their own markup, styles, and behavior, without relying on a framework.",
      advanced:
        "The Custom Elements spec defines an autonomous custom element lifecycle (connectedCallback, disconnectedCallback, attributeChangedCallback, adoptedCallback) registered via customElements.define(). Combined with Shadow DOM for style encapsulation and <template>/<slot> for composition, web components provide framework-agnostic encapsulation. The ElementInternals API enables custom elements to participate in form submission and accessibility APIs natively.",
    },
    seeAlso: ["shadow-dom", "component"],
  },
  {
    slug: "shadow-dom",
    term: "Shadow DOM",
    aliases: ["shadow tree"],
    category: "web",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A hidden mini-document inside an element that keeps its styles and structure private — like a snow globe that has its own little world inside.",
      intermediate:
        "A browser feature that attaches a separate DOM tree to an element, encapsulating its internal markup and styles from the outer page. Slots allow external content to be projected into the shadow tree.",
      advanced:
        "Shadow DOM v1 creates an isolated tree attached via attachShadow({ mode: 'open' | 'closed' }). CSS selectors do not cross the shadow boundary by default; ::part() and CSS custom properties provide controlled styling hooks. Event retargeting adjusts event.target at the shadow boundary, and composed: true events propagate through the composed tree. Declarative Shadow DOM (<template shadowrootmode>) enables server-rendered shadow trees without JavaScript.",
    },
    seeAlso: ["web-component", "dom"],
  },

  // ── React (10) ─────────────────────────────────────────────────────

  {
    slug: "jsx",
    term: "JSX",
    aliases: ["JavaScript XML"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A syntax that lets you write HTML-like code inside JavaScript — like writing a letter where English and code live side by side.",
      intermediate:
        "A syntactic extension to JavaScript that compiles to React.createElement (or the JSX runtime's jsx function) calls. It allows declarative UI descriptions with embedded expressions, mapped to virtual DOM elements.",
      advanced:
        "JSX is transformed by a compiler (Babel, SWC, or TypeScript) into function calls defined by the JSX runtime. The automatic runtime (react/jsx-runtime) eliminates the need for React in scope. TypeScript's JSX support type-checks element attributes against intrinsic elements (JSX.IntrinsicElements) or component prop types, providing compile-time safety for the template layer.",
    },
    seeAlso: ["component", "virtual-dom"],
  },
  {
    slug: "component",
    term: "Component",
    aliases: ["React component"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable building block for a user interface — like a LEGO piece that you can snap together with others to build a full page.",
      intermediate:
        "A function (or class) that accepts props and returns JSX describing a portion of the UI. Components encapsulate markup, styles, and behavior into composable, reusable units that React renders and updates efficiently.",
      advanced:
        "React components are pure functions of props → ReactNode. The runtime manages a fiber tree where each fiber represents a component instance with its own state, effects, and priority lane. Components that return the same output for the same props can be memoized via React.memo, skipping subtree reconciliation.",
    },
    seeAlso: ["jsx", "props", "server-component"],
  },
  {
    slug: "props",
    term: "Props",
    aliases: ["properties", "component props"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "Data passed from a parent component to a child — like handing a note to someone telling them what to display.",
      intermediate:
        "An immutable object of key-value pairs passed from parent to child components. Props drive rendering: when props change, React re-renders the component. TypeScript interfaces enforce the shape of props at compile time.",
      advanced:
        "Props are the input to a component's render function and participate in React's reconciliation diffing. Referential equality of prop objects influences memoization (React.memo, useMemo). The children prop implements the composition pattern via ReactNode, and render props / function-as-children enable inversion of control for shared stateful logic.",
    },
    seeAlso: ["component", "state-hook"],
  },
  {
    slug: "state-hook",
    term: "useState",
    aliases: ["state hook", "React state"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React tool that lets a component remember a value between renders — like a whiteboard that keeps your notes even when the room gets repainted.",
      intermediate:
        "A hook that returns a [value, setter] tuple, triggering a re-render when the setter is called with a new value. State updates are batched and applied asynchronously during the next render cycle.",
      advanced:
        "useState allocates a hook slot on the component's fiber, linked via a singly-linked list in call order. The dispatch function enqueues an update object onto the hook's queue; during rendering, the reducer (basicStateReducer) processes queued updates to produce the next state. Functional updaters (setState(prev => next)) are essential when updates depend on current state, as they are applied sequentially from the base state.",
    },
    seeAlso: ["use-effect", "component", "props"],
  },
  {
    slug: "use-effect",
    term: "useEffect",
    aliases: ["effect hook"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React tool that runs code after a component appears or changes — like setting an alarm that goes off after you finish decorating a room.",
      intermediate:
        "A hook that runs side effects (data fetching, subscriptions, DOM mutations) after the browser paints. A dependency array controls when the effect re-runs, and returning a cleanup function prevents memory leaks.",
      advanced:
        "useEffect schedules a passive effect that fires asynchronously after layout and paint, unlike useLayoutEffect which fires synchronously before paint. The dependency array is compared by Object.is; stale closures occur when dependencies are omitted. In Strict Mode (development), React intentionally double-invokes effects to surface cleanup bugs. Effects are the escape hatch from the pure render model for synchronizing with external systems.",
    },
    seeAlso: ["state-hook", "custom-hook"],
  },
  {
    slug: "virtual-dom",
    term: "Virtual DOM",
    aliases: ["VDOM"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A lightweight copy of the real page that React uses to figure out what changed — like making edits on a draft before writing the final copy.",
      intermediate:
        "An in-memory tree of JavaScript objects representing the UI. React compares the new virtual tree with the previous one (diffing) and applies only the minimal set of changes to the real DOM (reconciliation).",
      advanced:
        "The virtual DOM is a representation layer that decouples the declarative component model from imperative DOM operations. React's fiber reconciler performs incremental, interruptible diffing using a work-in-progress tree, assigning priority lanes to updates. The O(n) heuristic diff assumes elements of different types produce different trees and uses keys to match children, trading theoretical optimality for practical performance.",
    },
    seeAlso: ["reconciliation", "dom", "jsx"],
  },
  {
    slug: "reconciliation",
    term: "Reconciliation",
    aliases: ["React diffing"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "React's process of comparing old and new UI descriptions to figure out the smallest set of changes to make on screen — like a spot-the-difference game.",
      intermediate:
        "The algorithm React uses to diff the previous and next virtual DOM trees. It compares element types, props, and keys to determine which DOM nodes to create, update, or remove, minimizing expensive DOM operations.",
      advanced:
        "React's fiber reconciler splits reconciliation into interruptible units of work. The beginWork phase compares fibers by type and key, bailing out when props are referentially equal and no pending updates exist. The completeWork phase constructs or updates host instances. Concurrent mode enables time-slicing and priority-based scheduling via the lane model, allowing urgent updates (input) to preempt deferred ones (transitions).",
    },
    seeAlso: ["virtual-dom", "component"],
  },
  {
    slug: "react-context",
    term: "React Context",
    aliases: ["Context API", "createContext", "useContext"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to share data with deeply nested components without passing it through every level — like a building-wide intercom instead of whispering through every room.",
      intermediate:
        "An API (createContext + Provider + useContext) that broadcasts a value to all descendants without explicit prop passing. When the context value changes, every consumer re-renders, so it works best for infrequently changing data like theme or locale.",
      advanced:
        "Context propagation short-circuits fiber bailout: even if a parent memoizes, consumers will re-render when the provider value changes (compared by Object.is). This makes Context unsuitable for high-frequency state. Common mitigations include splitting contexts by update frequency, memoizing provider values, and using context selectors (available natively in React 19's use() hook).",
    },
    seeAlso: ["props", "custom-hook"],
  },
  {
    slug: "custom-hook",
    term: "Custom Hook",
    aliases: ["React custom hook"],
    category: "react",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable function that bundles React logic you use in multiple places — like a recipe card you pull out whenever you need to cook the same dish.",
      intermediate:
        "A function prefixed with 'use' that composes built-in hooks (useState, useEffect, etc.) to extract and share stateful logic across components. Custom hooks do not share state between callers — each call gets its own instance.",
      advanced:
        "Custom hooks are a convention, not a runtime primitive — the 'use' prefix triggers the Rules of Hooks lint plugin to enforce call-order invariants. Internally, each invocation allocates its own fiber hook slots. Custom hooks enable the extraction of complex effect/state coordination (e.g., useQuery, useForm) while preserving composability and testability via dependency injection of external services.",
    },
    seeAlso: ["state-hook", "use-effect", "react-context"],
  },
  {
    slug: "server-component",
    term: "Server Component",
    aliases: ["React Server Component", "RSC"],
    category: "react",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React component that runs on the server and sends only the finished HTML to the browser — like a chef who plates the dish in the kitchen instead of cooking at your table.",
      intermediate:
        "A component that executes exclusively on the server, can directly access databases and file systems, and sends a serialized UI payload (not raw HTML) to the client. Server Components reduce client bundle size because their code never ships to the browser.",
      advanced:
        "RSC introduces a dual-graph model: server components produce a serialized React tree (the RSC payload/Flight format) that the client reconciler can merge with client component subtrees. Server components can be async, have no hooks or state, and their closure data is serialized via the RSC wire protocol. Module references ($$typeof: Symbol.for('react.module.reference')) enable lazy loading of client component bundles at the boundary.",
    },
    seeAlso: ["component", "nextjs", "streaming-ssr"],
  },

  // ── Next.js (10) ───────────────────────────────────────────────────

  {
    slug: "nextjs",
    term: "Next.js",
    aliases: ["Next"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A framework built on React that handles routing, server rendering, and deployment so you can focus on building your app — like a pre-built house frame where you just add rooms.",
      intermediate:
        "A full-stack React framework by Vercel that provides file-system routing, server-side rendering, static generation, API routes, and built-in optimizations. The App Router (Next.js 13+) uses React Server Components by default.",
      advanced:
        "Next.js extends React with a server-centric architecture: the App Router maps the file system to route segments, each owning a layout, page, loading, and error boundary. It implements React Server Components, Server Actions (RPC via progressive enhancement), and streaming SSR with Suspense boundaries. The build system (Turbopack/webpack) performs route-level code splitting and generates a static shell for dynamic routes via Partial Prerendering.",
    },
    seeAlso: ["app-router", "server-component", "server-action"],
  },
  {
    slug: "app-router",
    term: "App Router",
    aliases: ["Next.js App Router"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Next.js's system for organizing pages using folders — each folder becomes a URL path, like how floors in a building have room numbers.",
      intermediate:
        "The routing system in Next.js 13+ that uses the app/ directory with special files (page.tsx, layout.tsx, loading.tsx, error.tsx) to define routes, layouts, and loading/error states. It replaces the older pages/ directory with nested layouts and React Server Components.",
      advanced:
        "The App Router implements a segment-based routing model where each directory is a route segment with co-located special files. Layouts are preserved across navigations (no remount), and templates (template.tsx) opt into remounting. Parallel routes (@slot) and intercepting routes ((..)slug) enable modal patterns and complex UI compositions. Route groups ((groupname)) organize without affecting the URL.",
    },
    seeAlso: ["nextjs", "layout-component", "middleware-nextjs"],
  },
  {
    slug: "server-action",
    term: "Server Action",
    aliases: ["Next.js Server Action"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that runs on the server when a user submits a form or clicks a button — like dropping a letter in a mailbox that goes straight to the post office.",
      intermediate:
        "An async function marked with 'use server' that executes on the server when called from the client. Server Actions enable form submissions and data mutations without creating separate API endpoints, and they work without JavaScript via progressive enhancement.",
      advanced:
        "Server Actions are compiled into POST endpoint closures referenced by action IDs. The React Flight protocol serializes arguments and return values. Actions integrate with React's transition system, enabling useOptimistic and useActionState for optimistic UI. They can be composed into form actions (formAction prop) that work without client JS, satisfying progressive enhancement. Revalidation (revalidatePath/revalidateTag) triggers cache invalidation after mutations.",
    },
    seeAlso: ["nextjs", "route-handler"],
  },
  {
    slug: "route-handler",
    term: "Route Handler",
    aliases: ["Next.js route handler", "route.ts"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A file that defines how your server responds to web requests at a specific URL — like a receptionist assigned to answer calls on a specific phone line.",
      intermediate:
        "A file (route.ts) in the app/ directory that exports HTTP method functions (GET, POST, PUT, DELETE) to handle API requests. Route handlers receive a Request object and return a Response, following Web API standards.",
      advanced:
        "Route handlers are edge-compatible by default and export named functions per HTTP method. They receive NextRequest (extending Request with cookies, nextUrl, and geo) and can return NextResponse. Dynamic segments, route segment config (runtime, revalidate, dynamic), and request deduplication apply. Route handlers in the same route segment as page.tsx will shadow the page — they cannot coexist at the same path.",
    },
    seeAlso: ["nextjs", "server-action", "rest-api"],
  },
  {
    slug: "middleware-nextjs",
    term: "Middleware (Next.js)",
    aliases: ["Next.js middleware"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Code that runs before a page loads, checking things like whether a user is logged in — like a bouncer at the door who checks IDs before letting people into the club.",
      intermediate:
        "A function exported from middleware.ts at the project root that runs before every matched request. It can rewrite URLs, redirect, set headers, or modify cookies. Middleware runs at the edge and executes before any page or API route.",
      advanced:
        "Next.js middleware executes in the Edge Runtime (V8 isolates, no Node.js APIs) before the routing layer resolves a request. It receives NextRequest and must return NextResponse (or NextResponse.next() to continue). The matcher config constrains execution to specific paths. Middleware cannot access the file system, dynamic imports, or Node.js built-ins unless the Node.js runtime is explicitly configured.",
    },
    seeAlso: ["nextjs", "app-router"],
  },
  {
    slug: "static-generation",
    term: "Static Generation",
    aliases: ["SSG", "static site generation"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Building all the pages of your site ahead of time so they can be served instantly — like printing a newspaper before the morning rush.",
      intermediate:
        "A rendering strategy where pages are generated at build time and served as static HTML from a CDN. In the App Router, routes are statically generated by default unless they use dynamic functions (cookies(), headers(), searchParams).",
      advanced:
        "Static generation in the App Router is determined by the route segment config and whether the render function accesses dynamic request data. generateStaticParams defines the set of paths to prerender. Static pages are served with s-maxage cache headers, and on-demand revalidation (revalidatePath/revalidateTag) allows surgical cache purging without a full rebuild.",
    },
    seeAlso: ["incremental-static-regeneration", "nextjs"],
  },
  {
    slug: "incremental-static-regeneration",
    term: "Incremental Static Regeneration",
    aliases: ["ISR"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to update pre-built pages in the background without rebuilding the entire site — like replacing one page in a printed book without reprinting the whole thing.",
      intermediate:
        "A Next.js feature that allows statically generated pages to be regenerated on a time-based interval or on demand. The stale page is served immediately while a fresh version is generated in the background (stale-while-revalidate pattern).",
      advanced:
        "ISR is configured via the revalidate route segment option (time-based) or programmatic revalidatePath/revalidateTag calls (on-demand). The CDN serves the stale response with a background regeneration triggered after the revalidation window expires. In the App Router, fetch-level revalidation (next: { revalidate: N }) provides per-data-source cache lifetimes, composing with route-level settings via the most restrictive policy.",
    },
    seeAlso: ["static-generation", "nextjs"],
  },
  {
    slug: "image-optimization",
    term: "Image Optimization",
    aliases: ["next/image"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Next.js automatically shrinks and converts images so pages load faster — like a photo lab that prints exactly the size you need instead of a giant poster every time.",
      intermediate:
        "The next/image component automatically serves images in modern formats (WebP, AVIF), resizes them to the requested dimensions, and lazy-loads them by default. It prevents layout shift by requiring width and height or using the fill prop.",
      advanced:
        "next/image delegates to an image optimization pipeline (sharp on the server or a configured external loader) that transforms images on demand, caching results with content-addressable hashes. The component emits <img> with srcset and sizes attributes for responsive resolution switching. The blur placeholder uses a tiny inline base64 data URI generated at build time. The loader architecture supports external CDNs (Cloudinary, Imgix) via a custom loader function.",
    },
    seeAlso: ["nextjs"],
  },
  {
    slug: "layout-component",
    term: "Layout Component",
    aliases: ["Next.js layout", "layout.tsx"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A wrapper that provides shared UI (like a header and sidebar) around pages so you don't have to repeat it everywhere — like a picture frame that stays the same while the photo inside changes.",
      intermediate:
        "A layout.tsx file that wraps child routes with shared UI. Layouts receive a children prop and persist across navigations — they do not remount when the user navigates between sibling routes, preserving state and avoiding unnecessary re-renders.",
      advanced:
        "Layouts in the App Router participate in the nested segment tree. Each layout receives children (the next segment's layout or page) and optional params. Because layouts do not remount on navigation, they are ideal for persistent UI shells but cannot access searchParams (which would force remounting). Root layout (app/layout.tsx) is required and must contain <html> and <body> tags. Parallel slots (@slot) are passed as additional named props to the layout.",
    },
    seeAlso: ["app-router", "nextjs"],
  },
  {
    slug: "streaming-ssr",
    term: "Streaming SSR",
    aliases: ["streaming server-side rendering"],
    category: "nextjs",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Sending parts of a page to the browser as soon as they're ready instead of waiting for everything — like serving each dish as it's cooked instead of waiting for the whole meal.",
      intermediate:
        "A rendering technique where the server sends HTML in chunks using Suspense boundaries. The browser can display available content immediately while waiting for slower parts (data fetches, heavy computations) to resolve and stream in.",
      advanced:
        "Streaming SSR leverages React's renderToPipeableStream (Node) or renderToReadableStream (Edge) to emit HTML progressively. Suspense boundaries delineate streaming segments: the shell renders immediately with fallback UI, and resolved segments are injected via inline <script> tags that swap the fallback. This reduces Time to First Byte and First Contentful Paint. Next.js implements this via loading.tsx files, which compile to Suspense boundaries around page components.",
    },
    seeAlso: ["server-component", "nextjs"],
  },

  // ── Node.js (10) ───────────────────────────────────────────────────

  {
    slug: "nodejs",
    term: "Node.js",
    aliases: ["Node"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that lets you run JavaScript outside the browser — like giving JavaScript a passport to work on servers, not just in web pages.",
      intermediate:
        "A JavaScript runtime built on Chrome's V8 engine that provides APIs for file I/O, networking, and OS interaction. Node.js uses a single-threaded event loop with non-blocking I/O, making it efficient for concurrent network applications.",
      advanced:
        "Node.js wraps V8 in a platform layer (libuv) providing an event loop with phase-ordered polling (timers → pending → idle → poll → check → close). I/O operations delegate to a thread pool (default 4 threads via UV_THREADPOOL_SIZE) or OS-level async mechanisms (epoll, kqueue, IOCP). The module system supports both CommonJS (require/module.exports) and ESM (import/export) with conditional exports in package.json.",
    },
    seeAlso: ["event-loop-node", "npm", "express"],
  },
  {
    slug: "event-loop-node",
    term: "Event Loop (Node.js)",
    aliases: ["Node event loop", "libuv event loop"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The engine that keeps Node.js running, checking for new tasks and executing callbacks — like a waiter who loops around tables taking and delivering orders nonstop.",
      intermediate:
        "A single-threaded mechanism that handles asynchronous operations by polling for I/O events and executing callbacks in a defined phase order: timers, pending callbacks, poll, check (setImmediate), and close callbacks.",
      advanced:
        "libuv's event loop executes in six phases per iteration: timers (setTimeout/setInterval callbacks whose threshold has elapsed), pending I/O callbacks (deferred from the previous loop), idle/prepare (internal), poll (retrieve new I/O events, execute I/O callbacks, block if empty), check (setImmediate), and close callbacks. process.nextTick and resolved Promises (microtasks) drain between every phase transition, which can starve the event loop if used recursively.",
    },
    seeAlso: ["nodejs", "stream-node"],
  },
  {
    slug: "npm",
    term: "npm",
    aliases: ["Node Package Manager"],
    category: "backend",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that lets you download and install code libraries other people have written — like an app store for JavaScript building blocks.",
      intermediate:
        "The default package manager for Node.js, consisting of a CLI tool and the npmjs.com registry. npm resolves dependency trees, installs packages into node_modules, and manages versions via package.json and the lockfile (package-lock.json).",
      advanced:
        "npm's dependency resolution uses a maximally flat node_modules tree (arborist algorithm), hoisting shared versions to minimize duplication. The lockfile records the exact resolved dependency graph with integrity hashes (SHA-512) for reproducibility. Workspaces enable monorepo management with symlinked packages. npm audit traverses the resolved tree against the GitHub Advisory Database for known vulnerabilities.",
    },
    seeAlso: ["package-json", "nodejs"],
  },
  {
    slug: "package-json",
    term: "package.json",
    aliases: ["package manifest"],
    category: "backend",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A file that describes your project — its name, version, and what libraries it needs — like an ingredient list for a recipe.",
      intermediate:
        "The manifest file for Node.js projects that declares metadata (name, version), dependencies, devDependencies, scripts, and entry points. It is the source of truth for what npm install fetches and what npm run executes.",
      advanced:
        "package.json supports conditional exports (exports field with subpath patterns and condition names like 'import', 'require', 'browser', 'default'), type: 'module' for ESM-by-default, engines constraints, overrides for transitive dependency resolution, and sideEffects: false for tree-shaking hints. The scripts field provides lifecycle hooks (preinstall, prepare, postinstall) executed by the package manager.",
    },
    seeAlso: ["npm", "commonjs", "esm"],
  },
  {
    slug: "commonjs",
    term: "CommonJS",
    aliases: ["CJS", "require"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The original way Node.js lets files share code with each other using require() — like passing a book between classmates.",
      intermediate:
        "A module system where files export values via module.exports and import them with require(). CommonJS modules load synchronously and are evaluated once, with the result cached. It is the default module system in Node.js when type: 'module' is not set.",
      advanced:
        "CJS modules wrap source in a function (module, exports, require, __filename, __dirname) and execute synchronously on first require(). The module cache (require.cache) stores evaluated modules by resolved filename. Circular dependencies resolve to the partially evaluated exports object at the time of the cycle. CJS cannot statically analyze imports, preventing tree-shaking — a key motivation for ESM adoption.",
    },
    seeAlso: ["esm", "package-json"],
  },
  {
    slug: "esm",
    term: "ESM",
    aliases: ["ES Modules", "ECMAScript Modules", "import/export"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The modern way JavaScript files share code using import and export — like a newer, smarter version of the postal system between files.",
      intermediate:
        "The official JavaScript module system (import/export) standardized in ES2015. ESM supports static analysis, enabling tree-shaking and top-level await. In Node.js, ESM is activated by .mjs extension or type: 'module' in package.json.",
      advanced:
        "ESM defines a three-phase loading pipeline: construction (parse and build module graph), instantiation (allocate memory for live bindings), and evaluation (execute top-down). Live bindings mean importers see the exporter's current value, not a copy. Top-level await blocks the evaluation of dependent modules in the graph. Import assertions (with { type: 'json' }) and import attributes provide module type metadata for non-JS resources.",
    },
    seeAlso: ["commonjs", "package-json"],
  },
  {
    slug: "stream-node",
    term: "Stream (Node.js)",
    aliases: ["Node stream", "readable stream", "writable stream"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to read or write data piece by piece instead of all at once — like drinking from a water fountain instead of waiting for a bucket to fill.",
      intermediate:
        "An abstract interface for working with flowing data. Node.js provides four stream types: Readable, Writable, Duplex, and Transform. Streams process data in chunks, enabling memory-efficient handling of large files and network data.",
      advanced:
        "Node.js streams implement backpressure via the highWaterMark and the writable.write() return value. When the consumer is slower than the producer, the Readable pauses (flowing → paused mode). The stream.pipeline() utility handles error propagation and cleanup across a chain of streams. Node 16+ supports the Web Streams API (ReadableStream, WritableStream, TransformStream) alongside the Node-native stream module.",
    },
    seeAlso: ["buffer-node", "nodejs"],
  },
  {
    slug: "buffer-node",
    term: "Buffer",
    aliases: ["Node Buffer"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A container for raw binary data in Node.js — like a bucket that holds raw bytes instead of text.",
      intermediate:
        "A fixed-size chunk of memory outside the V8 heap used to handle binary data (file contents, network packets, images). Buffers can be created from strings, arrays, or ArrayBuffers and converted to various encodings (utf-8, base64, hex).",
      advanced:
        "Buffer is a subclass of Uint8Array backed by a C++ allocation outside V8's managed heap (via the V8 ArrayBuffer allocator). Buffer.allocUnsafe() skips zero-filling for performance but may expose stale memory. Buffer.from() applies encoding-aware conversions. When interfacing with Web APIs, Buffer interoperates with ArrayBuffer and SharedArrayBuffer via the buffer, byteOffset, and byteLength properties.",
    },
    seeAlso: ["stream-node", "nodejs"],
  },
  {
    slug: "child-process",
    term: "Child Process",
    aliases: ["child_process", "spawn", "exec"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for Node.js to launch other programs — like a manager delegating a task to a coworker in a different office.",
      intermediate:
        "The child_process module spawns new OS processes from Node.js. spawn() streams stdio, exec() buffers output, fork() creates a new Node.js process with an IPC channel. Each method returns a ChildProcess object with stdio streams and lifecycle events.",
      advanced:
        "spawn() creates a subprocess via libuv's uv_spawn, which calls fork()/exec() on POSIX or CreateProcess on Windows. The IPC channel (created by fork() or spawn with stdio: 'ipc') uses OS-level domain sockets or named pipes for serialized message passing. execFile() bypasses the shell for security when executing binaries. The maxBuffer option on exec/execFile limits buffered stdout/stderr to prevent memory exhaustion.",
    },
    seeAlso: ["cluster", "nodejs"],
  },
  {
    slug: "cluster",
    term: "Cluster",
    aliases: ["Node cluster", "cluster module"],
    category: "backend",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to run multiple copies of your Node.js server to handle more traffic — like opening extra checkout lanes when a store gets busy.",
      intermediate:
        "The cluster module forks the main Node.js process into multiple worker processes that share the same server port. This utilizes multi-core CPUs, as each worker runs on its own core and handles incoming requests independently.",
      advanced:
        "Cluster uses child_process.fork() to create workers sharing a server handle via IPC. The primary distributes connections using a round-robin scheduling policy (default on non-Windows) or lets the OS handle it. Workers are isolated processes with separate V8 heaps — shared state requires IPC, Redis, or SharedArrayBuffer. For production, process managers (PM2) or container orchestrators (Kubernetes) are generally preferred over raw cluster management.",
    },
    seeAlso: ["child-process", "nodejs"],
  },

  // ── Express/API (10) ───────────────────────────────────────────────

  {
    slug: "express",
    term: "Express",
    aliases: ["Express.js"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A popular framework for building web servers in Node.js — like a toolkit that gives you the basic plumbing so you can focus on building rooms.",
      intermediate:
        "A minimal, unopinionated web framework for Node.js that provides routing, middleware composition, and HTTP utility methods. Express handles the request/response cycle and delegates business logic to middleware functions.",
      advanced:
        "Express implements a layered middleware stack where each layer is a (req, res, next) function executed in registration order. The Router is a self-contained middleware with its own stack, enabling modular route composition. Express 4's generator-free design relies on the middleware pattern for all concerns (parsing, auth, error handling). Error-handling middleware uses a (err, req, res, next) signature and is matched when next(err) is called.",
    },
    seeAlso: ["middleware-express", "route-parameter", "nodejs"],
  },
  {
    slug: "middleware-express",
    term: "Middleware (Express)",
    aliases: ["Express middleware"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that runs between receiving a request and sending a response — like a series of checkpoints a package goes through before delivery.",
      intermediate:
        "A function with access to the request object, response object, and the next() function in the Express pipeline. Middleware can modify req/res, end the cycle (res.send()), or pass control to the next function. Common uses include logging, authentication, and body parsing.",
      advanced:
        "Express middleware follows the Connect-style (req, res, next) contract. The stack is executed linearly; calling next() with no argument invokes the next matching layer, while next(err) skips to the next error-handling middleware (4-arity). Middleware can be app-level (app.use), router-level (router.use), or error-handling. Because middleware mutates shared req/res objects, ordering is critical — body parsers must precede route handlers that read req.body.",
    },
    seeAlso: ["express", "cors", "rate-limit-api"],
  },
  {
    slug: "route-parameter",
    term: "Route Parameter",
    aliases: ["URL parameter", "path parameter", "req.params"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A variable part of a URL that lets one route handle many different items — like a mail slot labeled 'Apartment ___' that accepts any number.",
      intermediate:
        "A named placeholder in a route path (e.g., /users/:id) whose value is extracted from the URL and available on req.params. Route parameters make URLs dynamic and RESTful without creating separate routes for each resource.",
      advanced:
        "Express compiles route patterns to regular expressions via path-to-regexp. Named parameters (:param) capture a single path segment; modifiers (?, *, +) control optionality and repetition. The router matches routes in registration order, and req.params is populated per the first match. Param middleware (app.param()) can pre-process parameter values for validation or database lookups before the route handler executes.",
    },
    seeAlso: ["express", "query-string", "rest-api"],
  },
  {
    slug: "query-string",
    term: "Query String",
    aliases: ["URL query", "search params", "req.query"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The part of a URL after the question mark that sends extra information to the server — like writing a note on the outside of an envelope.",
      intermediate:
        "Key-value pairs appended to a URL after '?' (e.g., ?page=2&sort=name). In Express, they are parsed into req.query. Query strings are used for filtering, pagination, and non-sensitive parameters since they are visible in the URL.",
      advanced:
        "Express parses query strings via the qs library (by default), which supports nested objects (a[b]=c) and arrays (a[]=1&a[]=2). The queryParser setting can be swapped to the simpler querystring module. Query strings are limited by URL length (typically 2,048-8,192 bytes depending on the server). Because they appear in server logs and browser history, they must never contain secrets or PII.",
    },
    seeAlso: ["route-parameter", "rest-api"],
  },
  {
    slug: "cors",
    term: "CORS",
    aliases: ["Cross-Origin Resource Sharing"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A security rule that controls which websites can request data from your server — like a guest list that decides who gets past the door.",
      intermediate:
        "An HTTP mechanism where the server sends Access-Control-Allow-* headers to tell browsers which origins, methods, and headers are permitted for cross-origin requests. Preflight OPTIONS requests verify permissions before the actual request.",
      advanced:
        "CORS is enforced by the browser, not the server — the server merely declares policy via response headers. Simple requests (GET/HEAD/POST with safelisted headers) skip preflight. Preflighted requests send an OPTIONS request with Origin, Access-Control-Request-Method, and Access-Control-Request-Headers; the server responds with allowed origins, methods, headers, and max-age for preflight caching. Credentials (cookies, Authorization) require Access-Control-Allow-Credentials: true and a non-wildcard Allow-Origin.",
    },
    seeAlso: ["fetch-api", "rest-api", "middleware-express"],
  },
  {
    slug: "rate-limit-api",
    term: "Rate Limiting",
    aliases: ["API rate limit", "throttling"],
    category: "backend",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A rule that limits how many requests a user can make in a given time — like a bouncer who only lets a certain number of people into the club per hour.",
      intermediate:
        "A server-side technique that restricts the number of requests a client can make within a time window to prevent abuse, protect resources, and ensure fair usage. Common algorithms include fixed window, sliding window, and token bucket.",
      advanced:
        "Rate limiting algorithms trade accuracy, memory, and fairness: fixed window is simple but allows burst at window boundaries; sliding window log is precise but memory-intensive; token bucket allows controlled bursts with a steady refill rate. Distributed rate limiting requires a shared store (Redis INCR with TTL, or Lua scripts for atomicity). Response headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset per IETF draft) communicate quota state to clients.",
    },
    seeAlso: ["middleware-express", "express"],
  },
  {
    slug: "jwt-token",
    term: "JWT",
    aliases: ["JSON Web Token"],
    category: "backend",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A digital ID card that a server gives you after logging in, so you can prove who you are on future visits without logging in again.",
      intermediate:
        "A compact, URL-safe token consisting of three Base64-encoded parts (header, payload, signature) used for stateless authentication and authorization. The server signs the token with a secret or private key and verifies it on each request without database lookups.",
      advanced:
        "JWTs (RFC 7519) encode claims as a JSON payload signed via JWS (RFC 7515) using algorithms like HS256 (HMAC-SHA256) or RS256 (RSA-SHA256). The stateless nature means revocation requires a deny list or short expiration with refresh tokens. JWE (RFC 7516) provides encryption for sensitive claims. Common vulnerabilities include algorithm confusion (none/HS256 substitution), excessive token lifetime, and storing sensitive data in the unencrypted payload.",
    },
    seeAlso: ["bcrypt", "rest-api"],
  },
  {
    slug: "bcrypt",
    term: "bcrypt",
    aliases: ["password hashing"],
    category: "backend",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that scrambles passwords before storing them so no one — not even the database admin — can read them.",
      intermediate:
        "A password hashing function that incorporates a salt and a configurable cost factor (work rounds) to produce a one-way hash. The cost factor makes brute-force attacks exponentially slower as hardware improves.",
      advanced:
        "bcrypt is based on the Blowfish cipher's expensive key setup (Eksblowfish). The cost parameter (2^N rounds, typically N=10-12) determines iteration count. Each hash output embeds the algorithm version, cost, 128-bit salt, and 184-bit hash in a 60-character string. Because bcrypt is CPU-bound and intentionally slow, it should be offloaded from the event loop (worker threads or async bindings). Argon2id (winner of the Password Hashing Competition) is the modern alternative, offering memory-hardness against GPU attacks.",
    },
    seeAlso: ["jwt-token"],
  },
  {
    slug: "rest-api",
    term: "REST API",
    aliases: ["RESTful API", "Representational State Transfer"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of rules for how programs talk to each other over the web using standard web addresses and actions like GET and POST — like a menu that tells customers how to order from a restaurant.",
      intermediate:
        "An architectural style for designing networked APIs around resources identified by URLs, manipulated through standard HTTP methods (GET, POST, PUT, DELETE), and represented in formats like JSON. REST emphasizes statelessness, uniform interface, and cacheability.",
      advanced:
        "REST (Fielding, 2000) defines six constraints: client-server, stateless, cacheable, uniform interface (resource identification, manipulation through representations, self-descriptive messages, HATEOAS), layered system, and optional code-on-demand. In practice, most 'REST' APIs implement levels 1-2 of the Richardson Maturity Model (resources + HTTP verbs) without HATEOAS. Content negotiation (Accept headers), idempotency guarantees (PUT/DELETE), and proper status code usage (201 Created, 204 No Content, 409 Conflict) distinguish well-designed APIs.",
    },
    seeAlso: ["openapi", "route-parameter", "express"],
  },
  {
    slug: "openapi",
    term: "OpenAPI",
    aliases: ["OpenAPI Specification", "Swagger", "OAS"],
    category: "backend",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A standard way to describe an API so that tools can automatically generate documentation and client code — like a blueprint that both the architect and the builder can read.",
      intermediate:
        "A specification (formerly Swagger) for describing RESTful APIs in a machine-readable YAML or JSON format. An OpenAPI document defines endpoints, request/response schemas, authentication methods, and error codes, enabling auto-generated docs, client SDKs, and mock servers.",
      advanced:
        "OpenAPI 3.1 aligns its Schema Object with JSON Schema 2020-12, supporting $ref, discriminator, oneOf/anyOf, and content media type encoding. The specification defines a document structure (info, servers, paths, components, security) that toolchains (Swagger UI, Redoc, openapi-generator) consume for documentation, code generation, and contract testing. Semantic versioning of the API document tracks breaking changes, and overlay documents (OAS 3.1) allow non-destructive patching of generated specs.",
    },
    seeAlso: ["rest-api"],
  },

  // ── Database (10) ──────────────────────────────────────────────────

  {
    slug: "postgresql",
    term: "PostgreSQL",
    aliases: ["Postgres", "PG"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A powerful, free database that stores your data in organized tables — like a giant spreadsheet that can handle millions of rows and complex questions.",
      intermediate:
        "An open-source relational database management system known for standards compliance, extensibility, and advanced features like JSONB, CTEs, window functions, and full-text search. It uses MVCC for concurrent access and supports ACID transactions.",
      advanced:
        "PostgreSQL implements Multi-Version Concurrency Control (MVCC) using transaction IDs stamped on tuple versions (xmin/xmax). The query planner uses cost-based optimization with statistics collected by ANALYZE. The Write-Ahead Log (WAL) ensures durability and enables streaming replication. Extension APIs (CREATE EXTENSION) allow adding custom types, operators, index methods (GiST, GIN, BRIN), and procedural languages (PL/pgSQL, PL/Python) without forking the core.",
    },
    seeAlso: ["sql-query", "index-db", "transaction-db"],
  },
  {
    slug: "sql-query",
    term: "SQL Query",
    aliases: ["SQL", "Structured Query Language"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A language for asking questions about data stored in a database — like asking a librarian to find all books by a certain author.",
      intermediate:
        "A declarative language for querying and manipulating relational data. Core statements include SELECT (read), INSERT (create), UPDATE (modify), and DELETE (remove). SQL expresses what data you want, and the database engine decides how to retrieve it efficiently.",
      advanced:
        "SQL is defined by ISO/IEC 9075 with vendor extensions. The logical query processing order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, though the optimizer may physically reorder operations. Modern SQL includes window functions (OVER/PARTITION BY), common table expressions (WITH/WITH RECURSIVE), lateral joins, and the MERGE statement for upsert semantics. Prepared statements with parameterized queries prevent SQL injection by separating code from data.",
    },
    seeAlso: ["postgresql", "join-sql"],
  },
  {
    slug: "join-sql",
    term: "JOIN",
    aliases: ["SQL join", "table join"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to combine rows from two tables based on a related column — like merging two lists where names appear in both.",
      intermediate:
        "An SQL clause that combines rows from two or more tables using a related column. Types include INNER JOIN (matching rows only), LEFT/RIGHT JOIN (all rows from one side plus matches), and FULL OUTER JOIN (all rows from both sides). CROSS JOIN produces a cartesian product.",
      advanced:
        "The query planner chooses a physical join algorithm based on table size, indexes, and statistics: nested loop (optimal for small/indexed inner tables), hash join (equi-joins on large unsorted tables), or merge join (pre-sorted or indexed inputs). Join ordering is an NP-hard combinatorial problem; PostgreSQL uses dynamic programming for small join counts and the Genetic Query Optimizer (GEQO) for large ones. Lateral joins (LATERAL) allow correlated subqueries in the FROM clause.",
    },
    seeAlso: ["sql-query", "foreign-key"],
  },
  {
    slug: "index-db",
    term: "Database Index",
    aliases: ["index", "B-tree index"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A shortcut that helps the database find data faster — like the index at the back of a textbook that tells you which page to flip to.",
      intermediate:
        "A data structure (typically a B-tree) maintained alongside a table that speeds up queries on indexed columns. Indexes improve read performance at the cost of additional storage and slower writes, since every insert/update must also update the index.",
      advanced:
        "B-tree indexes store keys in sorted order for O(log N) lookups, range scans, and ORDER BY acceleration. PostgreSQL also supports GiST (geometric, full-text), GIN (multi-valued: JSONB, arrays, tsvector), BRIN (block-range for physically ordered data), and hash indexes. Partial indexes (WHERE clause) and covering indexes (INCLUDE columns) reduce index size and enable index-only scans. The planner uses pg_statistic to estimate selectivity and decide between index scan, bitmap scan, or sequential scan.",
    },
    seeAlso: ["sql-query", "postgresql"],
  },
  {
    slug: "migration-db",
    term: "Database Migration",
    aliases: ["schema migration", "migration"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A versioned script that changes your database structure — like a blueprint revision that adds a new room to a building.",
      intermediate:
        "A timestamped, version-controlled script that applies (up) or reverts (down) schema changes to a database. Migrations ensure every environment (development, staging, production) evolves its schema consistently and reproducibly.",
      advanced:
        "Migration systems maintain a migrations table tracking applied versions. Forward-only (up-only) migrations are simpler to reason about in production; down migrations enable local development iteration. Schema changes on large tables require online DDL techniques: CREATE INDEX CONCURRENTLY (PostgreSQL), shadow tables, or expand-contract patterns to avoid locking. Data migrations (backfills) should be separate from schema migrations to allow independent rollback.",
    },
    seeAlso: ["postgresql", "transaction-db"],
  },
  {
    slug: "transaction-db",
    term: "Transaction",
    aliases: ["database transaction", "ACID transaction"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A group of database operations that either all succeed or all fail together — like a bank transfer where money must leave one account and arrive in another, or neither happens.",
      intermediate:
        "A unit of work that groups multiple SQL statements into an atomic operation. Transactions guarantee ACID properties: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), and Durability (committed data persists).",
      advanced:
        "PostgreSQL implements MVCC-based snapshot isolation by default (Read Committed). Serializable isolation uses predicate locking (SIRead locks) to detect and abort serialization anomalies. The Write-Ahead Log (WAL) ensures atomicity and durability: changes are written to WAL before data pages, and crash recovery replays committed WAL records. Savepoints (SAVEPOINT/ROLLBACK TO) enable partial rollback within a transaction. Advisory locks provide application-level coordination outside row/table locking.",
    },
    seeAlso: ["postgresql", "sql-query"],
  },
  {
    slug: "normalization",
    term: "Normalization",
    aliases: ["database normalization", "normal form"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Organizing database tables to reduce repetition — like using a shared contact list instead of writing someone's phone number in every document.",
      intermediate:
        "A process of structuring relational tables to minimize data redundancy and anomalies. Normal forms (1NF through 5NF) define progressively stricter rules. Most practical designs target 3NF or BCNF, sometimes denormalizing intentionally for read performance.",
      advanced:
        "1NF eliminates repeating groups; 2NF removes partial dependencies on composite keys; 3NF removes transitive dependencies; BCNF requires every determinant to be a candidate key. Higher normal forms (4NF, 5NF) address multi-valued and join dependencies. Denormalization is a deliberate trade-off: materialized views, summary tables, and JSONB columns sacrifice update simplicity for read throughput. The formal decomposition algorithm uses functional dependency analysis to produce lossless, dependency-preserving schemas.",
    },
    seeAlso: ["foreign-key", "primary-key"],
  },
  {
    slug: "foreign-key",
    term: "Foreign Key",
    aliases: ["FK", "foreign key constraint"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A column that links one table to another — like a reference number on an order that points back to the customer who placed it.",
      intermediate:
        "A constraint that ensures a value in one table's column matches an existing value in another table's primary key. Foreign keys enforce referential integrity and define relationships (one-to-many, many-to-many via junction tables).",
      advanced:
        "Foreign key constraints trigger referential integrity checks on INSERT, UPDATE, and DELETE. Cascade actions (ON DELETE CASCADE, ON UPDATE SET NULL) propagate changes automatically. PostgreSQL acquires a ROW SHARE lock on the referenced table during inserts, which can cause contention on high-write workloads. Indexes on foreign key columns are not created automatically in PostgreSQL — missing indexes cause sequential scans on cascading deletes and JOIN operations.",
    },
    seeAlso: ["primary-key", "join-sql", "normalization"],
  },
  {
    slug: "primary-key",
    term: "Primary Key",
    aliases: ["PK", "primary key constraint"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A unique ID for each row in a table — like a Social Security number that ensures no two people get mixed up.",
      intermediate:
        "A column (or combination of columns) that uniquely identifies each row in a table. Primary keys enforce uniqueness and NOT NULL constraints and are typically backed by a unique B-tree index. Common choices are auto-incrementing integers or UUIDs.",
      advanced:
        "Primary keys define the table's clustered identity in storage engines that support clustering (InnoDB); in PostgreSQL, the heap is unordered and the PK is a secondary unique B-tree index. UUID v4 keys distribute inserts randomly across index pages, causing write amplification and cache misses. UUID v7 (time-ordered) and ULID restore locality. Composite primary keys are used in junction tables and event sourcing schemas. The IDENTITY column (SQL standard) replaces PostgreSQL's SERIAL with spec-compliant auto-generation.",
    },
    seeAlso: ["foreign-key", "index-db"],
  },
  {
    slug: "connection-pool",
    term: "Connection Pool",
    aliases: ["database pool", "connection pooling"],
    category: "database",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of pre-opened database connections that get reused instead of opening a new one every time — like keeping a fleet of taxis running instead of calling a new one for every ride.",
      intermediate:
        "A cache of reusable database connections managed by the application or a proxy (like PgBouncer). Pooling avoids the overhead of establishing a new TCP connection and authenticating for every query, significantly improving throughput under concurrent load.",
      advanced:
        "Connection pools manage a bounded set of connections with configurable min/max, idle timeout, and acquire timeout. PgBouncer supports three modes: session (one client per connection for the session duration), transaction (release after each transaction — highest throughput), and statement (release after each statement — limited to simple queries). Pool exhaustion under load causes queuing or rejection; monitoring pool wait time is critical. Serverless environments benefit from external poolers (Supabase Pooler, Neon) to avoid cold-start connection storms.",
    },
    seeAlso: ["postgresql", "transaction-db"],
  },
];
