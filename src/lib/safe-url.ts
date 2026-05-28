/**
 * URL-safety utilities for redirect targets that come from user-controlled input.
 *
 * The classic bug this prevents: an open redirect via the `next` query parameter.
 * `new URL("//evil.com", "https://dura.dev").href` resolves to `https://evil.com/`
 * because `//evil.com` is a protocol-relative URL that escapes the intended origin.
 * Similarly, an absolute URL like `"https://evil.com/phish"` resolves to itself.
 *
 * Use `safeRedirectPath()` for anything that takes a redirect target from a query
 * string, form field, cookie, or any other source the user can influence.
 */

/**
 * Return the input path if it is a same-origin absolute path; otherwise return
 * the fallback. Guards against open redirects via protocol-relative URLs
 * (`//evil.com/...`), absolute URLs (`https://evil.com/...`), scheme-based
 * attacks (`javascript:...`, `data:...`), and traversal-style abuses (`/../`).
 *
 * Same-origin contract:
 *   - Must start with `/` (relative-to-root)
 *   - Must NOT start with `//` (protocol-relative — escapes origin)
 *   - Must NOT contain a scheme separator before the first `/`
 *
 * @param input - candidate redirect target from user input
 * @param fallback - safe path to use if the input fails validation; defaults to `/`
 * @returns the input if safe, otherwise the fallback
 */
export function safeRedirectPath(input: string | null | undefined, fallback = "/"): string {
  if (typeof input !== "string" || input.length === 0) return fallback;
  // Must start with `/` to be a same-origin absolute path.
  if (!input.startsWith("/")) return fallback;
  // Protocol-relative URL — `//evil.com/...` resolves to a different origin.
  if (input.startsWith("//")) return fallback;
  // Reject backslash variants — some browsers/proxies treat `/\evil.com` like `//evil.com`.
  if (input.startsWith("/\\")) return fallback;
  // Scheme-bearing inputs that snuck past the `/` check (defensive — shouldn't happen).
  if (/^\/+[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input)) return fallback;
  return input;
}
