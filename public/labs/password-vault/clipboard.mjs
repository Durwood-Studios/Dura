import { execFileSync } from "node:child_process";

/** Explicit OS adapters use fixed executable names and arguments, never a shell. */
export function systemClipboard(platform = process.platform) {
  const run = (command, args, input) =>
    execFileSync(command, args, {
      input,
      encoding: "utf8",
      timeout: 2000,
      maxBuffer: 1_000_000,
      windowsHide: true,
    });
  if (platform === "darwin")
    return {
      read: () => run("pbpaste", []),
      write: (text) => {
        run("pbcopy", [], text);
      },
    };
  if (platform === "win32")
    return {
      read: () =>
        run("powershell.exe", [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "[Console]::Write((Get-Clipboard -Raw))",
        ]),
      write: (text) => {
        run(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Set-Clipboard -Value ([Console]::In.ReadToEnd())",
          ],
          text
        );
      },
    };
  if (platform === "linux")
    return {
      read: () => run("wl-paste", ["--no-newline"]),
      write: (text) => {
        run("wl-copy", [], text);
      },
    };
  throw new Error("Clipboard adapter is unavailable on this OS.");
}

/** Best effort only: OS clipboard read/write cannot provide atomic compare-and-clear. */
export async function copyTemporarily(
  text,
  clipboard,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
) {
  clipboard.write(text);
  await wait(30_000);
  if (clipboard.read() !== text) return "changed";
  clipboard.write("");
  return "cleared";
}
