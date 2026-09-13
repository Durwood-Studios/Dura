/** Send credentials only to Dura's non-cacheable, rate-limited auth handler. */
export async function submitAuth(
  action: "sign-in" | "sign-up" | "forgot-password",
  body: object
): Promise<void> {
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const result = (await response.json()) as { error?: unknown };
  if (!response.ok)
    throw new Error(
      typeof result.error === "string" ? result.error : "The request could not be completed."
    );
}
