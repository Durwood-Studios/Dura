"use client";

import { useEffect, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  useSandpack,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import {
  Save,
  Copy,
  Download,
  RotateCcw,
  ChevronDown,
  Maximize2,
  Minimize2,
  Trash2,
  Terminal,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { getRecentSaves, putSave, deleteSave } from "@/lib/db/sandbox";
import { awardXPWithToast } from "@/lib/xp-manager";
import { XP_AWARDS } from "@/lib/xp";
import { generateId } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { SandboxLanguage, SandboxSave } from "@/types/sandbox";

const LANGUAGES: { value: SandboxLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML / CSS" },
  { value: "react", label: "React" },
];

// ── Starter templates ──────────────────────────────────────────────────────
interface Template {
  label: string;
  description: string;
  code: string;
}

const TEMPLATES: Record<SandboxLanguage, Template[]> = {
  javascript: [
    {
      label: "Hello World",
      description: "Simple greeting",
      code: `// JavaScript playground\nconst greet = (name) => \`Hello, \${name}!\`;\nconsole.log(greet("DURA"));\n`,
    },
    {
      label: "Fetch API",
      description: "HTTP GET with JSON",
      code: `// Fetch data from a public API
async function getData() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

getData();
`,
    },
    {
      label: "Async / Await",
      description: "Promise-based async flow",
      code: `// Async / await with error handling
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("start");
  await delay(500);
  console.log("done after 500ms");

  // Parallel execution
  const [a, b] = await Promise.all([
    delay(200).then(() => "A"),
    delay(300).then(() => "B"),
  ]);
  console.log("parallel:", a, b);
}

run();
`,
    },
    {
      label: "Array Methods",
      description: "map, filter, reduce, find",
      code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transform each element
const doubled = numbers.map((n) => n * 2);
console.log("doubled:", doubled);

// filter — keep matching elements
const evens = numbers.filter((n) => n % 2 === 0);
console.log("evens:", evens);

// reduce — accumulate into a single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("sum:", sum);

// find — first match
const firstBig = numbers.find((n) => n > 7);
console.log("first > 7:", firstBig);

// Chaining
const result = numbers
  .filter((n) => n % 2 === 0)
  .map((n) => n ** 2)
  .reduce((acc, n) => acc + n, 0);
console.log("sum of even squares:", result);
`,
    },
    {
      label: "Classes & OOP",
      description: "ES6 classes, inheritance",
      code: `class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  speak() {
    return \`\${this.name} says \${this.sound}!\`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "woof");
  }

  fetch(item) {
    return \`\${this.name} fetches the \${item}!\`;
  }
}

const dog = new Dog("Rex");
console.log(dog.speak());
console.log(dog.fetch("ball"));
console.log(dog instanceof Animal); // true
`,
    },
    {
      label: "Closures",
      description: "Counter, memoization",
      code: `// Counter via closure
function makeCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
    reset: () => { count = start; },
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.value());     // 11

// Memoization closure
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowFib = (n) => (n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2));
const fastFib = memoize(slowFib);
console.log(fastFib(30)); // fast
`,
    },
  ],
  typescript: [
    {
      label: "Hello World",
      description: "Typed greeting",
      code: `// TypeScript playground\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("DURA"));\n`,
    },
    {
      label: "Interfaces & Types",
      description: "Structural typing",
      code: `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "learner" | "guest";
}

type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;

function formatUser(user: User): string {
  return \`[\${user.role.toUpperCase()}] \${user.name} <\${user.email}>\`;
}

const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  role: "admin",
};

console.log(formatUser(alice));

// Discriminated union
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

const r = divide(10, 3);
if (r.ok) console.log("result:", r.value.toFixed(2));
else console.error(r.error);
`,
    },
    {
      label: "Generics",
      description: "Type-safe collections",
      code: `// Generic stack
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.push(3);
console.log("peek:", numStack.peek()); // 3
console.log("pop:", numStack.pop());   // 3
console.log("size:", numStack.size);   // 2

// Generic function
function identity<T>(value: T): T {
  return value;
}
console.log(identity<string>("hello"));
console.log(identity<number>(42));
`,
    },
    {
      label: "Async / Promises",
      description: "Typed async functions",
      code: `interface Post {
  id: number;
  title: string;
  body: string;
}

async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/posts/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<Post>;
}

async function main(): Promise<void> {
  try {
    const post = await fetchPost(1);
    console.log("Title:", post.title);
    console.log("Body:", post.body.slice(0, 80) + "...");
  } catch (err) {
    console.error("Failed:", err instanceof Error ? err.message : err);
  }
}

main();
`,
    },
  ],
  html: [
    {
      label: "Hello World",
      description: "Basic HTML page",
      code: `<!doctype html>
<html>
  <head>
    <style>
      body { font-family: system-ui; padding: 2rem; }
      h1 { color: #10b981; }
    </style>
  </head>
  <body>
    <h1>Hello from DURA</h1>
    <p>Edit me on the left.</p>
  </body>
</html>
`,
    },
    {
      label: "Event Listeners",
      description: "Click, input, keyboard events",
      code: `<!doctype html>
<html>
<head>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 500px; }
    button { padding: .5rem 1rem; background: #10b981; color: white;
             border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
    input { padding: .5rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; width: 100%; margin: .5rem 0; }
    #log { background: #f5f5f5; padding: 1rem; border-radius: 6px; min-height: 60px; margin-top: 1rem; }
  </style>
</head>
<body>
  <h2>Event Listeners Demo</h2>
  <input id="textInput" type="text" placeholder="Type something…">
  <button id="btn">Click me</button>
  <div id="log">Events will appear here…</div>

  <script>
    const log = document.getElementById("log");
    const btn = document.getElementById("btn");
    const input = document.getElementById("textInput");

    function addLog(msg) {
      const p = document.createElement("p");
      p.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
      log.prepend(p);
    }

    btn.addEventListener("click", () => addLog("Button clicked!"));
    input.addEventListener("input", (e) => addLog(\`Input: "\${e.target.value}"\`));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addLog("Enter pressed");
    });
  </script>
</body>
</html>
`,
    },
    {
      label: "CSS Flexbox",
      description: "Flex layout examples",
      code: `<!doctype html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui; padding: 2rem; background: #f9fafb; }
    h2 { margin: 1rem 0 .5rem; font-size: .85rem; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; }

    .row { display: flex; gap: .5rem; padding: 1rem; background: white;
           border-radius: 8px; margin-bottom: 1rem; }
    .row.center { justify-content: center; }
    .row.between { justify-content: space-between; }
    .row.align-end { align-items: flex-end; height: 80px; }

    .box { display: flex; align-items: center; justify-content: center;
           width: 48px; height: 48px; border-radius: 6px;
           font-weight: 600; color: white; font-size: .85rem; }
    .a { background: #10b981; }
    .b { background: #06b6d4; height: 64px; }
    .c { background: #8b5cf6; }
    .grow { flex: 1; background: #f59e0b; }
  </style>
</head>
<body>
  <h2>Row (default)</h2>
  <div class="row">
    <div class="box a">A</div>
    <div class="box b">B</div>
    <div class="box c">C</div>
  </div>

  <h2>Center + Space Between</h2>
  <div class="row between">
    <div class="box a">A</div>
    <div class="box c">C</div>
  </div>

  <h2>flex: 1 (grow)</h2>
  <div class="row">
    <div class="box a">A</div>
    <div class="box grow">grows</div>
    <div class="box c">C</div>
  </div>

  <h2>Align end</h2>
  <div class="row align-end">
    <div class="box a">A</div>
    <div class="box b">B</div>
    <div class="box c">C</div>
  </div>
</body>
</html>
`,
    },
    {
      label: "CSS Grid",
      description: "Grid layout examples",
      code: `<!doctype html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui; padding: 2rem; background: #f9fafb; }
    h2 { margin: 1.5rem 0 .5rem; font-size: .8rem; color: #6b7280;
         text-transform: uppercase; letter-spacing: .1em; }

    .grid { display: grid; gap: .5rem; padding: 1rem;
            background: white; border-radius: 8px; margin-bottom: 1rem; }
    .g3 { grid-template-columns: repeat(3, 1fr); }
    .g-auto { grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); }
    .g-areas {
      grid-template-areas:
        "header header header"
        "nav    main   aside"
        "footer footer footer";
    }

    .cell { background: #10b981; color: white; border-radius: 4px;
            padding: .75rem; font-weight: 600; font-size: .85rem; text-align: center; }
    .span2 { grid-column: span 2; background: #8b5cf6; }
    .header { grid-area: header; background: #06b6d4; padding: .5rem; border-radius: 4px; text-align: center; color: white; font-weight: 600; }
    .nav    { grid-area: nav;    background: #10b981; padding: .5rem; border-radius: 4px; text-align: center; color: white; font-weight: 600; }
    .main   { grid-area: main;   background: #f59e0b; padding: .5rem; border-radius: 4px; text-align: center; color: white; font-weight: 600; }
    .aside  { grid-area: aside;  background: #8b5cf6; padding: .5rem; border-radius: 4px; text-align: center; color: white; font-weight: 600; }
    .footer { grid-area: footer; background: #ef4444; padding: .5rem; border-radius: 4px; text-align: center; color: white; font-weight: 600; }
  </style>
</head>
<body>
  <h2>3-column grid</h2>
  <div class="grid g3">
    <div class="cell">1</div><div class="cell">2</div><div class="cell">3</div>
    <div class="cell span2">spans 2</div><div class="cell">6</div>
  </div>

  <h2>auto-fit / minmax</h2>
  <div class="grid g-auto">
    <div class="cell">A</div><div class="cell">B</div>
    <div class="cell">C</div><div class="cell">D</div><div class="cell">E</div>
  </div>

  <h2>Named areas</h2>
  <div class="grid g-areas" style="gap:.5rem">
    <div class="header">header</div>
    <div class="nav">nav</div>
    <div class="main">main</div>
    <div class="aside">aside</div>
    <div class="footer">footer</div>
  </div>
</body>
</html>
`,
    },
  ],
  react: [
    {
      label: "Hello World",
      description: "Basic React component",
      code: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1 style={{ color: "#10b981" }}>DURA React Sandbox</h1>
      <button onClick={() => setCount((c) => c + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}
`,
    },
    {
      label: "useState & Forms",
      description: "Controlled inputs",
      code: `import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(null);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(form);
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 400 }}>
      <h2>Contact Form</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handle}
          style={{ padding: ".5rem", border: "1px solid #ccc", borderRadius: 6 }} />
        <input name="email" placeholder="Email" value={form.email} onChange={handle}
          style={{ padding: ".5rem", border: "1px solid #ccc", borderRadius: 6 }} />
        <button type="submit"
          style={{ padding: ".5rem 1rem", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Submit
        </button>
      </form>
      {submitted && (
        <pre style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem", borderRadius: 6 }}>
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}
`,
    },
    {
      label: "useEffect & Fetch",
      description: "Data fetching on mount",
      code: `import { useState, useEffect } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (error)   return <p style={{ padding: "2rem", color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h2>Posts</h2>
      {posts.map((p) => (
        <div key={p.id} style={{ marginBottom: "1rem", padding: "1rem",
          border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <strong>{p.title}</strong>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: ".25rem" }}>{p.body}</p>
        </div>
      ))}
    </div>
  );
}
`,
    },
    {
      label: "Custom Hooks",
      description: "useLocalStorage, useDebounce",
      code: `import { useState, useEffect } from "react";

// Custom hook: syncs state to localStorage
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Custom hook: debounces a value
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [name, setName] = useLocalStorage("dura-name", "");
  const debounced = useDebounce(name, 400);

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h2>Custom Hooks Demo</h2>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Type your name (saved to localStorage)"
        style={{ padding: ".5rem", border: "1px solid #ccc", borderRadius: 6, width: "100%", marginBottom: "1rem" }} />
      <p>Debounced (400ms): <strong>{debounced}</strong></p>
      <p style={{ fontSize: ".85rem", color: "#6b7280" }}>
        Refresh the page — your name persists via localStorage.
      </p>
    </div>
  );
}
`,
    },
    {
      label: "Context & Reducer",
      description: "Global state without Redux",
      code: `import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD":    return [...state, action.item];
    case "REMOVE": return state.filter((_, i) => i !== action.index);
    case "CLEAR":  return [];
    default: return state;
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

const ITEMS = ["🍎 Apple", "🍌 Banana", "🍇 Grapes", "🍓 Strawberry"];

function Shop() {
  const { dispatch } = useContext(CartContext);
  return (
    <div>
      <h3>Shop</h3>
      {ITEMS.map((item) => (
        <button key={item} onClick={() => dispatch({ type: "ADD", item })}
          style={{ display: "block", margin: ".25rem 0", padding: ".25rem .75rem",
            background: "#10b981", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Add {item}
        </button>
      ))}
    </div>
  );
}

function Cart() {
  const { cart, dispatch } = useContext(CartContext);
  return (
    <div>
      <h3>Cart ({cart.length})</h3>
      {cart.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <span>{item}</span>
          <button onClick={() => dispatch({ type: "REMOVE", index: i })}
            style={{ fontSize: ".7rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
      ))}
      {cart.length > 0 && (
        <button onClick={() => dispatch({ type: "CLEAR" })}
          style={{ marginTop: ".5rem", padding: ".25rem .5rem", color: "#6b7280",
            background: "none", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}>
          Clear all
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <div style={{ fontFamily: "system-ui", padding: "2rem", display: "flex", gap: "3rem" }}>
        <Shop />
        <Cart />
      </div>
    </CartProvider>
  );
}
`,
    },
  ],
};

// ── Sandpack config ────────────────────────────────────────────────────────
const TEMPLATE: Record<SandboxLanguage, "vanilla" | "vanilla-ts" | "static" | "react"> = {
  javascript: "vanilla",
  typescript: "vanilla-ts",
  html: "static",
  react: "react",
};

const ENTRY_FILE: Record<SandboxLanguage, string> = {
  javascript: "/index.js",
  typescript: "/index.ts",
  html: "/index.html",
  react: "/App.js",
};

const EXTENSIONS: Record<SandboxLanguage, string> = {
  javascript: "js",
  typescript: "ts",
  html: "html",
  react: "jsx",
};

const AUTOSAVE_MS = 30_000;

function buildFiles(language: SandboxLanguage, code: string): SandpackFiles {
  return { [ENTRY_FILE[language]]: { code, active: true } };
}

function downloadFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SANDPACK_THEME = {
  colors: {
    surface1: "#0a0a0a",
    surface2: "#141414",
    surface3: "#1c1c1c",
    clickable: "#a3a3a3",
    base: "#e5e5e5",
    disabled: "#525252",
    hover: "#10b981",
    accent: "#10b981",
  },
  syntax: {
    plain: "#e5e5e5",
    comment: { color: "#525252", fontStyle: "italic" as const },
    keyword: "#10b981",
    tag: "#06b6d4",
    punctuation: "#737373",
    definition: "#e5e5e5",
    property: "#a3a3a3",
    static: "#c084fc",
    string: "#fbbf24",
  },
  font: {
    body: "var(--font-sans, system-ui)",
    mono: "var(--font-mono, monospace)",
    size: "13px",
    lineHeight: "1.6",
  },
} as const;

// ── SavesPanel ─────────────────────────────────────────────────────────────
interface SavesPanelProps {
  saves: SandboxSave[];
  onLoad: (save: SandboxSave) => void;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  onRename: (id: string, title: string) => Promise<void>;
}

function SavesPanel({
  saves,
  onLoad,
  onDelete,
  onClose,
  onRename,
}: SavesPanelProps): React.ReactElement {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const startEdit = (save: SandboxSave) => {
    setEditingId(save.id);
    setDraftTitle(save.title);
  };

  const commitEdit = async () => {
    if (editingId && draftTitle.trim()) {
      await onRename(editingId, draftTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="absolute right-0 z-30 mt-1 w-80 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="text-xs font-semibold text-[var(--color-text-primary)]">
          Saved Snippets
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:bg-[var(--color-bg-subtle)]"
        >
          <X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </button>
      </div>
      {saves.length === 0 ? (
        <p className="px-4 py-4 text-xs text-[var(--color-text-muted)]">No saved snippets yet.</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {saves.map((s) => (
            <li
              key={s.id}
              className="group flex items-start gap-2 px-3 py-2.5 hover:bg-[var(--color-bg-subtle)]"
            >
              <button
                type="button"
                onClick={() => {
                  onLoad(s);
                  onClose();
                }}
                className="min-w-0 flex-1 text-left"
              >
                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => void commitEdit()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded border border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-primary)] outline-none"
                  />
                ) : (
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {s.title}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {s.language} · {new Date(s.updatedAt).toLocaleDateString()}{" "}
                  {new Date(s.updatedAt).toLocaleTimeString()}
                </p>
              </button>
              <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  aria-label="Rename"
                  className="rounded p-1 hover:bg-[var(--color-bg-primary)]"
                >
                  <Pencil className="h-3 w-3 text-[var(--color-text-muted)]" />
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(s.id)}
                  aria-label="Delete"
                  className="rounded p-1 hover:bg-[var(--color-bg-primary)]"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── TemplatePanel ──────────────────────────────────────────────────────────
interface TemplatePanelProps {
  language: SandboxLanguage;
  onSelect: (code: string) => void;
  onClose: () => void;
}

function TemplatePanel({ language, onSelect, onClose }: TemplatePanelProps): React.ReactElement {
  return (
    <div className="absolute left-0 z-30 mt-1 w-72 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="text-xs font-semibold text-[var(--color-text-primary)]">Templates</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:bg-[var(--color-bg-subtle)]"
        >
          <X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </button>
      </div>
      <ul className="max-h-72 overflow-y-auto py-1">
        {TEMPLATES[language].map((t) => (
          <li key={t.label}>
            <button
              type="button"
              onClick={() => {
                onSelect(t.code);
                onClose();
              }}
              className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-[var(--color-bg-subtle)]"
            >
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                {t.label}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{t.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────────────
interface ToolbarProps {
  language: SandboxLanguage;
  onLanguageChange: (next: SandboxLanguage) => void;
  saves: SandboxSave[];
  refreshSaves: () => Promise<void>;
  currentSaveId: React.MutableRefObject<string | null>;
  onLoadSave: (save: SandboxSave) => void;
  onDeleteSave: (id: string) => Promise<void>;
  onTemplateSelect: (code: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
}

function Toolbar({
  language,
  onLanguageChange,
  saves,
  refreshSaves,
  currentSaveId,
  onLoadSave,
  onDeleteSave,
  onTemplateSelect,
  isFullscreen,
  onToggleFullscreen,
  showConsole,
  onToggleConsole,
}: ToolbarProps): React.ReactElement {
  const { sandpack } = useSandpack();
  const [showSaves, setShowSaves] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSavedCode = useRef<string>("");

  const currentCode = (): string => {
    const file = sandpack.files[ENTRY_FILE[language]];
    if (!file) return "";
    return typeof file === "string" ? file : file.code;
  };

  const doSave = async (manual: boolean): Promise<void> => {
    const code = currentCode();
    if (!manual && code === lastSavedCode.current) return;
    const id = currentSaveId.current ?? generateId("snip");
    const now = Date.now();
    const existing = saves.find((s) => s.id === id);
    const save: SandboxSave = {
      id,
      title: existing?.title ?? `${language} · ${new Date(now).toLocaleString()}`,
      language,
      code,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await putSave(save);
    currentSaveId.current = id;
    lastSavedCode.current = code;
    setSavedAt(now);
    if (manual) await refreshSaves();
  };

  const handleRename = async (id: string, title: string): Promise<void> => {
    const save = saves.find((s) => s.id === id);
    if (!save) return;
    await putSave({ ...save, title });
    await refreshSaves();
  };

  // Auto-save
  useEffect(() => {
    const id = setInterval(() => void doSave(false), AUTOSAVE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode());
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    downloadFile(`dura-snippet.${EXTENSIONS[language]}`, currentCode());
  };

  const reset = () => {
    sandpack.updateFile(ENTRY_FILE[language], TEMPLATES[language][0].code);
  };

  const onRun = () => {
    void track("sandbox_executed", { language, success: true });
    const day = new Date().toISOString().slice(0, 10);
    void awardXPWithToast("sandbox", XP_AWARDS.sandbox, `freeform_${language}_${day}`);
    sandpack.runSandpack();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2.5">
      {/* Language select */}
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as SandboxLanguage)}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1.5 text-xs font-medium text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      {/* Templates */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowTemplates((v) => !v);
            setShowSaves(false);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]"
        >
          Templates
          <ChevronDown className="h-3 w-3" />
        </button>
        {showTemplates && (
          <TemplatePanel
            language={language}
            onSelect={onTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>

      {/* Run */}
      <button
        type="button"
        onClick={onRun}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700"
      >
        ▶ Run
      </button>

      {/* Save */}
      <button
        type="button"
        onClick={() => void doSave(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Save className="h-3 w-3" /> Save
      </button>

      {/* Copy */}
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Copy className="h-3 w-3" /> Copy
      </button>

      {/* Download */}
      <button
        type="button"
        onClick={download}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Download className="h-3 w-3" /> Download
      </button>

      {/* Reset */}
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <RotateCcw className="h-3 w-3" /> Reset
      </button>

      {/* Saved snippets */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowSaves((v) => !v);
            setShowTemplates(false);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-subtle)]",
            saves.length > 0
              ? "border-[var(--color-accent)]/40 text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
          )}
        >
          Snippets{" "}
          {saves.length > 0 && <span className="ml-0.5 font-mono text-[10px]">{saves.length}</span>}
          <ChevronDown className="h-3 w-3" />
        </button>
        {showSaves && (
          <SavesPanel
            saves={saves}
            onLoad={onLoadSave}
            onDelete={onDeleteSave}
            onClose={() => setShowSaves(false)}
            onRename={handleRename}
          />
        )}
      </div>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Console toggle */}
      <button
        type="button"
        onClick={onToggleConsole}
        aria-label="Toggle console"
        title="Toggle console"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition",
          showConsole
            ? "border-[var(--color-accent)]/40 bg-emerald-500/10 text-[var(--color-accent)]"
            : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
        )}
      >
        <Terminal className="h-3.5 w-3.5" />
      </button>

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
      >
        {isFullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>

      {savedAt && (
        <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">
          <Check className="mr-0.5 inline h-3 w-3 text-emerald-500" />
          Saved {new Date(savedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FreeformSandboxInner(): React.ReactElement {
  const [language, setLanguage] = useState<SandboxLanguage>("javascript");
  const [code, setCode] = useState<string>(TEMPLATES.javascript[0].code);
  const [saves, setSaves] = useState<SandboxSave[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const currentSaveId = useRef<string | null>(null);

  const showPreview = language === "html" || language === "react";
  // Editor height: taller by default, even taller in fullscreen
  const editorHeight = isFullscreen ? "calc(100vh - 110px)" : 560;
  const previewHeight = isFullscreen ? "calc(100vh - 110px)" : 420;
  const consoleHeight = isFullscreen ? 200 : 160;

  const refreshSaves = async () => {
    const fresh = await getRecentSaves(20);
    setSaves(fresh);
  };

  useEffect(() => {
    void refreshSaves();
  }, []);

  // Fullscreen: Esc to exit
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const switchLanguage = (next: SandboxLanguage) => {
    setLanguage(next);
    setCode(TEMPLATES[next][0].code);
    currentSaveId.current = null;
  };

  const loadSave = (save: SandboxSave) => {
    setLanguage(save.language);
    setCode(save.code);
    currentSaveId.current = save.id;
  };

  const handleDeleteSave = async (id: string): Promise<void> => {
    await deleteSave(id);
    if (currentSaveId.current === id) currentSaveId.current = null;
    await refreshSaves();
  };

  const handleTemplateSelect = (templateCode: string) => {
    setCode(templateCode);
    currentSaveId.current = null;
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      <SandpackProvider
        key={`${language}-${currentSaveId.current ?? "fresh"}-${code.slice(0, 20)}`}
        template={TEMPLATE[language]}
        theme={SANDPACK_THEME}
        files={{ [ENTRY_FILE[language]]: { code, active: true } }}
        options={{ recompileMode: "delayed", recompileDelay: 500 }}
      >
        <Toolbar
          language={language}
          onLanguageChange={switchLanguage}
          saves={saves}
          refreshSaves={refreshSaves}
          currentSaveId={currentSaveId}
          onLoadSave={loadSave}
          onDeleteSave={handleDeleteSave}
          onTemplateSelect={handleTemplateSelect}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((v) => !v)}
          showConsole={showConsole}
          onToggleConsole={() => setShowConsole((v) => !v)}
        />

        {/* Editor + Preview/Console row */}
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showTabs={false}
            wrapContent
            style={{ height: editorHeight, minWidth: 0, flex: 1 }}
          />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            {showPreview && (
              <SandpackPreview
                style={{
                  flex: 1,
                  height: showConsole ? previewHeight : editorHeight,
                  minHeight: 200,
                }}
              />
            )}
            {showConsole && (
              <SandpackConsole
                standalone={!showPreview}
                style={{
                  height: showPreview ? consoleHeight : editorHeight,
                  borderTop: showPreview ? "1px solid var(--color-border)" : undefined,
                }}
              />
            )}
            {!showPreview && !showConsole && (
              <div className="flex flex-1 items-center justify-center text-xs text-[var(--color-text-muted)]">
                Console hidden — click <Terminal className="mx-1 inline h-3 w-3" /> to show
              </div>
            )}
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
