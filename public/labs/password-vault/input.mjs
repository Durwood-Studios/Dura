/** Hidden TTY input with bounded paste, interruption, and raw-mode restoration. */
export function readSecret(question, input = process.stdin, output = process.stderr) {
  if (!input.isTTY || typeof input.setRawMode !== "function")
    return Promise.reject(
      new Error(
        "A terminal is required for hidden input. No passphrases are accepted in command arguments or environment variables."
      )
    );
  return new Promise((resolve, reject) => {
    const wasRaw = input.isRaw ?? false;
    let value = "";
    let finished = false;
    let outputFailed = false;
    const cleanup = () => {
      let failure;
      // A broken output stream must not prevent restoring the terminal or removing listeners.
      const attempt = (action) => {
        try {
          action();
        } catch (error) {
          failure ??= error;
        }
      };
      attempt(() => input.off("data", onData));
      attempt(() => input.off("end", onEnd));
      attempt(() => input.off("error", onError));
      attempt(() => output.off?.("error", onOutputError));
      attempt(() => input.setRawMode(wasRaw));
      attempt(() => input.pause());
      if (!outputFailed) attempt(() => output.write("\n"));
      return failure;
    };
    const finish = (error) => {
      if (finished) return;
      finished = true;
      const cleanupError = cleanup();
      if (error || cleanupError) reject(error ?? cleanupError);
      else resolve(value);
    };
    const onEnd = () => finish(new Error("Input ended before a passphrase was entered."));
    const onError = () => finish(new Error("Could not read terminal input."));
    const onOutputError = () => {
      outputFailed = true;
      finish(new Error("Could not write terminal prompt."));
    };
    const onData = (chunk) => {
      for (const char of String(chunk)) {
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }
        if (char === "\u0003" || char === "\u0004") {
          finish(new Error("Input cancelled."));
          return;
        }
        if (char === "\u007f" || char === "\b") value = Array.from(value).slice(0, -1).join("");
        else if (/[\x00-\x1f\x7f-\x9f]/u.test(char)) {
          finish(new Error("Control characters are not accepted in hidden input."));
          return;
        } else value += char;
        if (value.length > 1000) {
          finish(new Error("Input exceeds 1000 characters."));
          return;
        }
      }
    };
    try {
      input.setEncoding("utf8");
      input.setRawMode(true);
      input.on("data", onData);
      input.on("end", onEnd);
      input.on("error", onError);
      output.on?.("error", onOutputError);
      input.resume();
      output.write(question);
    } catch (error) {
      outputFailed = true;
      finish(error);
    }
  });
}
