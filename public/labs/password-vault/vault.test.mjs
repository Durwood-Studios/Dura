import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { encryptVault, decryptVault, saveVault, readRaw, generatePassword } from "./vault.mjs";
import { readSecret } from "./input.mjs";
import { copyTemporarily } from "./clipboard.mjs";
const password = "fictional-example-master-passphrase";
const empty = { version: 1, entries: [] };
const example = {
  version: 1,
  entries: [
    {
      id: "d7cb91ac-4d7a-4d1d-9633-4a51fb87d817",
      name: "Example",
      username: "student",
      password: "fictional-only-password",
    },
  ],
};

test("authenticated round trip, fresh randomness, wrong key and tampering", () => {
  const raw = encryptVault(example, password);
  assert.deepEqual(decryptVault(raw, password), example);
  assert.notEqual(encryptVault(example, password), raw);
  assert(!raw.includes("fictional-only-password"));
  assert.throws(() => decryptVault(raw, "another-fictional-passphrase"), /Incorrect/);
  const altered = JSON.parse(raw);
  altered.data = (altered.data[0] === "a" ? "b" : "a") + altered.data.slice(1);
  assert.throws(() => decryptVault(JSON.stringify(altered), password), /damaged/);
  assert.throws(() => decryptVault("{", password), /Malformed/);
  assert.throws(
    () => decryptVault(JSON.stringify({ ...JSON.parse(raw), salt: "00" }), password),
    /envelope/
  );
  assert.throws(
    () => encryptVault({ version: 1, entries: [example.entries[0], example.entries[0]] }, password),
    /duplicate/
  );
});

test("failed replacement and stale writers preserve previously committed encrypted bytes", () => {
  const dir = mkdtempSync(join(tmpdir(), "dura-fictional-vault-"));
  const path = join(dir, "vault.enc");
  try {
    const initial = saveVault(path, empty, password, null);
    assert.throws(
      () =>
        saveVault(path, example, password, initial, {
          beforeReplace() {
            throw new Error("Simulated disk error");
          },
        }),
      /disk/
    );
    assert.equal(readFileSync(path, "utf8"), initial);
    const updated = saveVault(path, example, password, initial);
    assert.throws(() => saveVault(path, empty, password, initial), /changed/);
    assert.equal(readRaw(path), updated);
    writeFileSync(`${path}.lock`, "simulated other process");
    assert.throws(() => saveVault(path, empty, password, updated), /locked/);
    assert.deepEqual(decryptVault(readRaw(path), password), example);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("generator rejects unbounded or malformed requests", () => {
  for (const value of [NaN, Infinity, -1, 0, 3, 15, 129, 1e12, 20.5, "24"])
    assert.throws(() => generatePassword(value), /integer/);
  assert.equal(generatePassword().length, 24);
  assert.equal(generatePassword(128).length, 128);
});

function terminal() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (value) => {
    input.isRaw = value;
  };
  input.setEncoding = () => {};
  input.resume = () => {};
  input.pause = () => {};
  const output = {
    text: "",
    write(value) {
      this.text += value;
    },
  };
  return { input, output };
}

test("hidden terminal input handles whole paste chunks and restores terminal on all exits", async () => {
  const { input, output } = terminal();
  const result = readSecret("Hidden: ", input, output);
  input.emit("data", "fictional pasted passphrase\r");
  assert.equal(await result, "fictional pasted passphrase");
  assert.equal(output.text, "Hidden: \n");
  assert.equal(input.isRaw, false);
  assert.equal(input.listenerCount("data"), 0);
  for (const event of ["cancel", "end", "error", "huge"]) {
    const pending = readSecret("Hidden: ", input, output);
    if (event === "cancel") input.emit("data", "\u0003");
    if (event === "end") input.emit("end");
    if (event === "error") input.emit("error", new Error("fixture"));
    if (event === "huge") input.emit("data", "x".repeat(1001));
    await assert.rejects(pending);
    assert.equal(input.isRaw, false);
    assert.equal(input.listenerCount("data"), 0);
  }
  await assert.rejects(readSecret("Hidden: ", { isTTY: false }, output), /terminal/);
});

test("clipboard cleanup preserves newer copied text and reports adapter failures", async () => {
  let current = "";
  const clipboard = {
    read: () => current,
    write: (value) => {
      current = value;
    },
  };
  assert.equal(
    await copyTemporarily("fictional password", clipboard, async () => {
      current = "new copied text";
    }),
    "changed"
  );
  assert.equal(current, "new copied text");
  assert.equal(await copyTemporarily("fictional password", clipboard, async () => {}), "cleared");
  assert.equal(current, "");
  await assert.rejects(
    copyTemporarily(
      "fictional",
      {
        write() {
          throw new Error("unavailable");
        },
      },
      async () => {}
    ),
    /unavailable/
  );
});

test("actual CLI help/generation execute and piped passphrase input fails closed", () => {
  const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), "dura-fictional-cli-"));
  try {
    const help = spawnSync(process.execPath, [cli, "help"], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /fictional/);
    const generated = spawnSync(process.execPath, [cli, "generate", "24"], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.equal(generated.status, 0);
    assert.equal(generated.stdout.trim().length, 24);
    const invalid = spawnSync(process.execPath, [cli, "generate", "NaN"], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.equal(invalid.status, 1);
    const init = spawnSync(process.execPath, [cli, "init"], {
      cwd: dir,
      input: "fictional passphrase\n",
      encoding: "utf8",
    });
    assert.equal(init.status, 1);
    assert.match(init.stderr, /terminal/);
    assert.equal(readRaw(join(dir, ".teaching-vault", "vault.enc")), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("prompt output and setup failures reject while restoring raw mode and listeners", async () => {
  for (const mode of ["prompt", "resume", "newline", "output-event"]) {
    const { input, output } = terminal();
    if (mode === "prompt")
      output.write = () => {
        throw new Error("prompt output failed");
      };
    if (mode === "resume")
      input.resume = () => {
        throw new Error("resume failed");
      };
    if (mode === "newline")
      output.write = (text) => {
        if (text === "\n") throw new Error("newline failed");
      };
    let target = output;
    if (mode === "output-event") {
      target = new EventEmitter();
      target.write = () => {};
    }
    const pending = readSecret("Hidden: ", input, target);
    if (mode === "newline") input.emit("data", "fictional passphrase\r");
    if (mode === "output-event") target.emit("error", new Error("output disconnected"));
    await assert.rejects(pending);
    assert.equal(input.isRaw, false, mode);
    assert.equal(input.listenerCount("data"), 0, mode);
    assert.equal(input.listenerCount("end"), 0, mode);
    assert.equal(input.listenerCount("error"), 0, mode);
    if (mode === "output-event") assert.equal(target.listenerCount("error"), 0);
  }
});

test("C0/C1 controls and DEL are rejected in stored entries and hidden input", async () => {
  for (const control of ["\u001b", "\u007f", "\u0085", "\u009b"]) {
    assert.throws(
      () =>
        encryptVault(
          {
            version: 1,
            entries: [{ ...example.entries[0], name: `Example${control}2J` }],
          },
          password
        ),
      /Invalid entry/
    );
  }
  for (const control of ["\u001b", "\u0085", "\u009b"]) {
    const { input, output } = terminal();
    const pending = readSecret("Hidden: ", input, output);
    input.emit("data", `fictional${control}input`);
    await assert.rejects(pending, /Control characters/);
    assert.equal(input.isRaw, false);
    assert.equal(input.listenerCount("data"), 0);
  }
});
