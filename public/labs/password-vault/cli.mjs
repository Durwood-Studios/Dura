import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import { readSecret } from "./input.mjs";
import { decryptVault, readRaw, saveVault, generatePassword } from "./vault.mjs";
import { copyTemporarily, systemClipboard } from "./clipboard.mjs";

const [command, ...args] = process.argv.slice(2);
const folder = resolve(".teaching-vault");
const path = join(folder, "vault.enc");

async function main() {
  if (!command || command === "help") {
    console.log(
      "Teaching vault: use fictional credentials only.\nCommands: init | add NAME USERNAME | list [SEARCH] | copy ID | delete ID | backup DESTINATION | generate [16..128]\nThe encrypted file belongs to .teaching-vault in the current directory. No recovery exists without its passphrase."
    );
    return;
  }
  if (command === "generate") {
    console.log(generatePassword(args[0] === undefined ? 24 : Number(args[0])));
    return;
  }
  if (!["init", "add", "list", "copy", "delete", "backup"].includes(command))
    throw new Error("Unknown command. Run npm start -- help.");
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const raw = readRaw(path);
  if (command === "init" && raw !== null)
    throw new Error("A vault already exists; initialization will not overwrite it.");
  if (command !== "init" && raw === null)
    throw new Error("No vault exists in this directory. Run init first.");
  const password = await readSecret("Master passphrase (hidden): ");
  if (command === "init") {
    if (password !== (await readSecret("Confirm passphrase (hidden): ")))
      throw new Error("Passphrases did not match.");
    saveVault(path, { version: 1, entries: [] }, password, null);
    console.log("Teaching vault created.");
    return;
  }
  const vault = decryptVault(raw, password);
  if (command === "add") {
    const [name, username] = args;
    if (!name || !username || args.length !== 2) throw new Error("Usage: add NAME USERNAME");
    const secret = await readSecret("Fictional entry password (hidden): ");
    const next = {
      ...vault,
      entries: [...vault.entries, { id: randomUUID(), name, username, password: secret }],
    };
    saveVault(path, next, password, raw);
    console.log("Entry saved.");
    return;
  }
  if (command === "list") {
    const query = (args[0] ?? "").toLowerCase();
    for (const entry of vault.entries.filter((entry) =>
      `${entry.name} ${entry.username}`.toLowerCase().includes(query)
    ))
      console.log(`${entry.id}  ${entry.name}  ${entry.username}`);
    return;
  }
  if (command === "backup") {
    if (args.length !== 1) throw new Error("Usage: backup DESTINATION (a new file)");
    writeFileSync(resolve(args[0]), raw, { flag: "wx", mode: 0o600 });
    console.log("Encrypted snapshot copied. Test recovery on a separate copy.");
    return;
  }
  const entry = vault.entries.find((item) => item.id === args[0]);
  if (!entry || args.length !== 1) throw new Error("Choose one exact entry ID from list.");
  if (command === "delete") {
    saveVault(
      path,
      {
        ...vault,
        entries: vault.entries.filter((item) => item.id !== entry.id),
      },
      password,
      raw
    );
    console.log("Entry deleted from the current vault; backups may retain it.");
    return;
  }
  console.log(
    "Copying for 30 seconds. Keep this process open. Clipboard history can retain copied values."
  );
  const result = await copyTemporarily(entry.password, systemClipboard());
  console.log(
    result === "cleared"
      ? "Clipboard clear was requested."
      : "Clipboard changed; newer contents were preserved."
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Operation failed.");
  process.exitCode = 1;
});
