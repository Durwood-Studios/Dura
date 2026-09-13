import { execFileSync } from "node:child_process";

/** Resolve untrusted refs as arguments, never as shell command text. */
function commit(ref) {
  return execFileSync("git", ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`], {
    encoding: "utf8",
  }).trim();
}

/** Select the complete event range; CI must fail if its event is incomplete. */
export function provenanceRange({ eventName, event, since, resolve = commit }) {
  if (since) return `${resolve(since)}..${resolve("HEAD")}`;
  if (eventName === "push") {
    if (
      !/^[a-f0-9]{40,64}$/.test(event?.before ?? "") ||
      !/^[a-f0-9]{40,64}$/.test(event?.after ?? "")
    )
      throw new Error("Push provenance requires the actual before/after commit IDs");
    const end = resolve(event.after);
    return /^0+$/.test(event.before) ? end : `${resolve(event.before)}..${end}`;
  }
  if (eventName === "pull_request") {
    const base = event?.pull_request?.base?.sha;
    if (!/^[a-f0-9]{40,64}$/.test(base ?? "")) throw new Error("Missing PR base commit");
    return `${resolve(base)}..${resolve("HEAD")}`;
  }
  if (eventName) throw new Error(`Unsupported provenance event: ${eventName}`);
  return `${resolve("origin/main")}..${resolve("HEAD")}`;
}
