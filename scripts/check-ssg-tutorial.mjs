import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const root = process.cwd(),
  workspace = mkdtempSync(join(tmpdir(), "dura-ssg-tutorial-"));
try {
  const source = readFileSync(join(root, "src/content/tutorials/39-static-site-gen.mdx"), "utf8");
  const blocks = [
    ...source.matchAll(/^(`{3,})typescript\n\/\/ (src\/[^\n]+)\n([\s\S]*?)^\1\s*$/gm),
  ];
  if (blocks.length !== 10) throw Error("Expected all ten named SSG modules");
  for (const [, , name, code] of blocks) {
    const file = join(workspace, name);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, code);
  }
  writeFileSync(join(workspace, "package.json"), JSON.stringify({ type: "module" }));
  writeFileSync(
    join(workspace, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        types: ["node"],
        rootDir: "src",
        outDir: "build",
        typeRoots: [join(root, "node_modules/@types")],
      },
      include: ["src/**/*.ts"],
    })
  );
  execFileSync(
    process.execPath,
    [join(root, "node_modules/typescript/bin/tsc"), "-p", join(workspace, "tsconfig.json")],
    { stdio: "pipe" }
  );
  mkdirSync(join(workspace, "content"));
  mkdirSync(join(workspace, "layouts"));
  writeFileSync(
    join(workspace, "layouts/base.html"),
    '<html><body><nav>{% for item in navigation %}<a href="{{ item.url }}">{{ item.title }}</a>{% endfor %}</nav>{{ content }}</body></html>'
  );
  for (const [name, title] of [
    ["first", "First"],
    ["second", "Second"],
  ])
    writeFileSync(join(workspace, `content/${name}.md`), `---\ntitle: ${title}\n---\n# ${title}\n`);
  execFileSync(process.execPath, ["build/cli.js", "build"], { cwd: workspace, stdio: "pipe" });
  for (const name of ["first", "second"]) {
    const html = readFileSync(join(workspace, `dist/${name}/index.html`), "utf8");
    if (!html.includes("First") || !html.includes("Second") || !/<h1\b/.test(html))
      throw Error("Incomplete output or shared navigation");
  }
  const { paginate } = await import(pathToFileURL(join(workspace, "build/pagination.js")).href);
  let rejected = false;
  try {
    paginate([], 0);
  } catch {
    rejected = true;
  }
  if (!rejected) throw Error("Zero-size pagination must reject instead of looping");
  console.log(
    "PASS: all ten tutorial39 modules compile; actual CLI builds two pages with shared navigation; zero-size pagination rejects. HTTP/watch integration not executed."
  );
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
