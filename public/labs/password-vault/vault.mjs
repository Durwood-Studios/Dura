import { createCipheriv, createDecipheriv, randomBytes, randomInt, pbkdf2Sync } from "node:crypto";
import {
  openSync,
  closeSync,
  readFileSync,
  writeFileSync,
  fsyncSync,
  renameSync,
  unlinkSync,
  lstatSync,
} from "node:fs";
import { dirname, join } from "node:path";

const MAX_BYTES = 2_000_000;
const ITERATIONS = 600_000;
const AAD = Buffer.from("dura-teaching-vault:1:pbkdf2-sha256:600000");
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** Validate decrypted data before any caller can use it. */
export function validateVault(value) {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !Array.isArray(value.entries) ||
    value.entries.length > 1000
  )
    throw new Error("Invalid vault structure.");
  const ids = new Set();
  for (const entry of value.entries) {
    if (!isObject(entry)) throw new Error("Invalid vault entry.");
    for (const [key, limit] of [
      ["id", 36],
      ["name", 200],
      ["username", 200],
      ["password", 1000],
    ]) {
      if (
        typeof entry[key] !== "string" ||
        !entry[key].length ||
        entry[key].length > limit ||
        /[\x00-\x1f\x7f-\x9f]/u.test(entry[key])
      )
        throw new Error(`Invalid entry ${key}.`);
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(entry.id) ||
      ids.has(entry.id)
    )
      throw new Error("Invalid or duplicate entry ID.");
    ids.add(entry.id);
    if (Object.keys(entry).some((key) => !["id", "name", "username", "password"].includes(key)))
      throw new Error("Unknown entry field.");
  }
  if (Object.keys(value).some((key) => !["version", "entries"].includes(key)))
    throw new Error("Unknown vault field.");
  return value;
}

function checkPassword(password) {
  if (typeof password !== "string" || password.length < 12 || password.length > 1000)
    throw new Error("Use a master passphrase between 12 and 1000 characters.");
}

/** Encrypt bounded validated data, with independently fresh salt and nonce. */
export function encryptVault(value, password) {
  checkPassword(password);
  const plaintext = Buffer.from(JSON.stringify(validateVault(value)));
  if (plaintext.length > (MAX_BYTES - 1024) / 2) throw new Error("Vault is too large.");
  const salt = randomBytes(32);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  try {
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(AAD);
    const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return JSON.stringify({
      version: 1,
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
      tag: cipher.getAuthTag().toString("hex"),
      data: data.toString("hex"),
    });
  } finally {
    key.fill(0);
    plaintext.fill(0);
  }
}

/** Reject malformed input before expensive key derivation; authenticate before parsing. */
export function decryptVault(raw, password) {
  checkPassword(password);
  if (typeof raw !== "string" || Buffer.byteLength(raw) > MAX_BYTES)
    throw new Error("Vault is too large.");
  let encrypted;
  try {
    encrypted = JSON.parse(raw);
  } catch {
    throw new Error("Malformed vault file; original file is unchanged.");
  }
  if (
    !isObject(encrypted) ||
    encrypted.version !== 1 ||
    Object.keys(encrypted).sort().join() !== "data,iv,salt,tag,version"
  )
    throw new Error("Unsupported vault format.");
  for (const [key, length] of [
    ["salt", 64],
    ["iv", 24],
    ["tag", 32],
  ]) {
    if (
      typeof encrypted[key] !== "string" ||
      encrypted[key].length !== length ||
      !/^[0-9a-f]+$/u.test(encrypted[key])
    )
      throw new Error("Invalid encryption envelope.");
  }
  if (typeof encrypted.data !== "string" || !/^(?:[0-9a-f]{2})+$/u.test(encrypted.data))
    throw new Error("Invalid ciphertext.");
  const key = pbkdf2Sync(password, Buffer.from(encrypted.salt, "hex"), ITERATIONS, 32, "sha256");
  let plaintext;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "hex"));
    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));
    plaintext = Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, "hex")),
      decipher.final(),
    ]);
    return validateVault(JSON.parse(plaintext.toString("utf8")));
  } catch {
    throw new Error(
      "Incorrect passphrase, invalid data, or damaged vault; original file is unchanged."
    );
  } finally {
    key.fill(0);
    plaintext?.fill(0);
  }
}

/** Read only ordinary bounded files; a missing file is distinct from corruption. */
export function readRaw(path) {
  try {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BYTES)
      throw new Error("Expected a bounded ordinary vault file.");
    return readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

/** Cooperative lock plus compare-and-swap prevents stale app writers replacing newer data. */
export function saveVault(path, vault, password, expectedRaw, options = {}) {
  const raw = encryptVault(vault, password);
  const lockPath = `${path}.lock`;
  let lock;
  try {
    lock = openSync(lockPath, "wx", 0o600);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(
        "Vault is locked by another process. Do not remove its lock until that process has stopped."
      );
    throw error;
  }
  const tempPath = join(dirname(path), `.vault-${randomBytes(16).toString("hex")}.tmp`);
  let temp;
  try {
    if (readRaw(path) !== expectedRaw)
      throw new Error("Vault changed since loading. Reload before saving.");
    temp = openSync(tempPath, "wx", 0o600);
    writeFileSync(temp, raw, "utf8");
    fsyncSync(temp);
    closeSync(temp);
    temp = undefined;
    // The seam injects a pre-replacement I/O failure in tests, never in CLI input.
    options.beforeReplace?.();
    renameSync(tempPath, path);
    return raw;
  } finally {
    if (temp !== undefined) closeSync(temp);
    try {
      unlinkSync(tempPath);
    } catch (error) {
      if (error.code !== "ENOENT") console.error("Temporary vault cleanup failed:", error.message);
    }
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

/** Uniform independent characters, with explicit finite resource limits. */
export function generatePassword(length = 24) {
  if (!Number.isInteger(length) || length < 16 || length > 128)
    throw new Error("Password length must be an integer from 16 to 128.");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%_-";
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join("");
}
