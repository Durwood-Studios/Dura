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
import { Save, Copy, Download, RotateCcw, ChevronDown } from "lucide-react";
import { getRecentSaves, putSave } from "@/lib/db/sandbox";
import { awardXP } from "@/lib/db/xp";
import { XP_AWARDS } from "@/lib/xp";
import { generateId } from "@/lib/utils";
import { track } from "@/lib/analytics";
import type { SandboxLanguage, SandboxSave } from "@/types/sandbox";

const LANGUAGES: { value: SandboxLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML / CSS" },
  { value: "react", label: "React" },
];

const STARTER_CODE: Record<SandboxLanguage, string> = {
  javascript: `// JavaScript playground
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("DURA"));
`,
  typescript: `// TypeScript playground
const greet = (name: string): string => \`Hello, \${name}!\`;
console.log(greet("DURA"));
`,
  html: `<!doctype html>
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
  react: `import { useState } from "react";

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
};

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
    surface1: "#ffffff",
    surface2: "#f5f5f4",
    surface3: "#f0f0f0",
    clickable: "#525252",
    base: "#171717",
    disabled: "#a3a3a3",
    hover: "#10b981",
    accent: "#10b981",
  },
  syntax: {
    plain: "#171717",
    comment: { color: "#a3a3a3", fontStyle: "italic" },
    keyword: "#10b981",
    tag: "#06b6d4",
    punctuation: "#525252",
    definition: "#171717",
    property: "#525252",
    static: "#8b5cf6",
    string: "#f59e0b",
  },
  font: {
    body: "var(--font-sans)",
    mono: "var(--font-mono)",
    size: "13px",
    lineHeight: "1.6",
  },
} as const;

interface ToolbarProps {
  language: SandboxLanguage;
  onLanguageChange: (next: SandboxLanguage) => void;
  saves: SandboxSave[];
  refreshSaves: () => Promise<void>;
  currentSaveId: React.MutableRefObject<string | null>;
  onLoadSave: (save: SandboxSave) => void;
}

function Toolbar({
  language,
  onLanguageChange,
  saves,
  refreshSaves,
  currentSaveId,
  onLoadSave,
}: ToolbarProps): React.ReactElement {
  const { sandpack } = useSandpack();
  const [showSaves, setShowSaves] = useState(false);
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
      title: `${language} · ${new Date(now).toLocaleString()}`,
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

  // Auto-save loop
  useEffect(() => {
    const id = setInterval(() => void doSave(false), AUTOSAVE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode());
    } catch {
      // ignore
    }
  };

  const download = () => {
    downloadFile(`dura-snippet.${EXTENSIONS[language]}`, currentCode());
  };

  const reset = () => {
    sandpack.updateFile(ENTRY_FILE[language], STARTER_CODE[language]);
  };

  const onRun = () => {
    void track("sandbox_executed", { language, success: true });
    // Daily-per-language XP cap — earn sandbox XP at most once per day per language.
    const day = new Date().toISOString().slice(0, 10);
    void awardXP("sandbox", XP_AWARDS.sandbox, `freeform_${language}_${day}`);
    sandpack.runSandpack();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as SandboxLanguage)}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm font-medium text-[var(--color-text-primary)]"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRun}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
      >
        Run
      </button>
      <button
        type="button"
        onClick={() => void doSave(true)}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Save className="h-3 w-3" />
        Save
      </button>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Copy className="h-3 w-3" />
        Copy
      </button>
      <button
        type="button"
        onClick={download}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <Download className="h-3 w-3" />
        Download
      </button>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowSaves((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
        >
          Recent
          <ChevronDown className="h-3 w-3" />
        </button>
        {showSaves && (
          <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-1 shadow-lg">
            {saves.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">No saved snippets</p>
            ) : (
              saves.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onLoadSave(s);
                    setShowSaves(false);
                  }}
                  className="flex w-full flex-col px-3 py-2 text-left text-xs hover:bg-[var(--color-bg-subtle)]"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{s.language}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(s.updatedAt).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {savedAt && (
        <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">
          Saved {new Date(savedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default function FreeformSandboxInner(): React.ReactElement {
  const [language, setLanguage] = useState<SandboxLanguage>("javascript");
  const [code, setCode] = useState<string>(STARTER_CODE.javascript);
  const [saves, setSaves] = useState<SandboxSave[]>([]);
  const currentSaveId = useRef<string | null>(null);

  const refreshSaves = async () => {
    const fresh = await getRecentSaves();
    setSaves(fresh);
  };

  useEffect(() => {
    void refreshSaves();
  }, []);

  const switchLanguage = (next: SandboxLanguage) => {
    setLanguage(next);
    setCode(STARTER_CODE[next]);
    currentSaveId.current = null;
  };

  const loadSave = (save: SandboxSave) => {
    setLanguage(save.language);
    setCode(save.code);
    currentSaveId.current = save.id;
  };

  const showPreview = language === "html" || language === "react";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <SandpackProvider
        key={`${language}-${currentSaveId.current ?? "fresh"}`}
        template={TEMPLATE[language]}
        theme={SANDPACK_THEME}
        files={buildFiles(language, code)}
        options={{ recompileMode: "delayed", recompileDelay: 500 }}
      >
        <Toolbar
          language={language}
          onLanguageChange={switchLanguage}
          saves={saves}
          refreshSaves={refreshSaves}
          currentSaveId={currentSaveId}
          onLoadSave={loadSave}
        />
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showTabs={false}
            wrapContent
            style={{ height: 480 }}
          />
          {showPreview ? (
            <SandpackPreview style={{ height: 480 }} />
          ) : (
            <SandpackConsole standalone style={{ height: 480 }} />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
