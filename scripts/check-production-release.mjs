import { pathToFileURL } from "node:url";

export const REQUIRED_RELEASE_CHECK = "Release readiness";
export const REQUIRED_DATABASE_CONTRACT = "2026-09-023";

/** Keep the existing deployment live if configured account/payment services would fail closed. */
export function validateProductionServices(env) {
  const hasAccounts = Boolean(env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (hasAccounts && (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
    throw new Error("Production account configuration requires both public Supabase settings");
  if (
    (hasAccounts || env.STRIPE_SECRET_KEY) &&
    (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN)
  )
    throw new Error(
      "Production account/payment services require UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN before this release can deploy"
    );
  if (hasAccounts && env.DURA_SUPABASE_CONTRACT_VERSION !== REQUIRED_DATABASE_CONTRACT)
    throw new Error(
      `Production accounts require the reviewed database rollout through 023. Set DURA_SUPABASE_CONTRACT_VERSION=${REQUIRED_DATABASE_CONTRACT} only after verifying the target reconciliation and migrations; this setting is an operator attestation, not a schema inspection.`
    );
}

/** Only GitHub Actions' latest result for this exact commit can permit release. */
export function releaseDecision(payload, sha) {
  if (!Array.isArray(payload?.check_runs)) throw new Error("Invalid GitHub check response");
  const runs = payload.check_runs
    .filter(
      (run) =>
        run.name === REQUIRED_RELEASE_CHECK &&
        run.head_sha === sha &&
        run.app?.slug === "github-actions"
    )
    .sort((a, b) => b.id - a.id);
  const latest = runs[0];
  if (!latest || latest.status !== "completed") return "pending";
  return latest.conclusion === "success" ? "success" : "failure";
}

/** Bind a successful check to this repository's main-branch push workflow. */
export async function verifyWorkflowIdentity(check, sha, fetcher) {
  const match =
    /^https:\/\/github\.com\/Durwood-Studios\/Dura\/actions\/runs\/(\d+)\/job\/(\d+)$/.exec(
      check.details_url ?? ""
    );
  if (!match) throw new Error("Release check has no verifiable workflow job");
  const get = async (path) => {
    const result = await fetcher(`https://api.github.com/repos/Durwood-Studios/Dura/${path}`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Cannot verify release workflow identity");
    return result.json();
  };
  const job = await get(`actions/jobs/${match[2]}`);
  const workflow = await get(`actions/runs/${match[1]}`);
  if (
    String(job.run_id) !== match[1] ||
    job.head_sha !== sha ||
    job.name !== REQUIRED_RELEASE_CHECK ||
    job.check_run_url !==
      `https://api.github.com/repos/Durwood-Studios/Dura/check-runs/${check.id}` ||
    job.status !== "completed" ||
    job.conclusion !== "success" ||
    String(workflow.id) !== match[1] ||
    workflow.path !== ".github/workflows/ci.yml" ||
    workflow.head_sha !== sha ||
    workflow.head_branch !== "main" ||
    workflow.event !== "push" ||
    workflow.repository?.full_name !== "Durwood-Studios/Dura"
  )
    throw new Error("Release check did not come from the trusted main-branch CI workflow");
}

/** Production builds fail closed; local and preview builds remain independent of CI. */
export async function checkProductionRelease({
  env = process.env,
  fetcher = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = Date.now,
  timeoutMs = 25 * 60_000,
  log = console.log,
} = {}) {
  if (env.VERCEL !== "1" && !env.VERCEL_ENV) return;
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") return;
  if (env.VERCEL_ENV !== "production")
    throw new Error("Cannot establish Vercel deployment environment");
  validateProductionServices(env);
  const sha = env.VERCEL_GIT_COMMIT_SHA;
  if (!/^[a-f0-9]{40}$/.test(sha ?? ""))
    throw new Error("Production requires a Git-linked commit SHA");
  const endpoint = `https://api.github.com/repos/Durwood-Studios/Dura/commits/${sha}/check-runs?per_page=100`;
  const deadline = now() + timeoutMs;
  while (now() <= deadline) {
    const response = await fetcher(endpoint, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        `Cannot verify release checks (GitHub HTTP ${response.status}); production build stopped`
      );
    const payload = await response.json();
    const state = releaseDecision(payload, sha);
    if (state === "success") {
      const check = payload.check_runs
        .filter(
          (run) =>
            run.name === REQUIRED_RELEASE_CHECK &&
            run.head_sha === sha &&
            run.app?.slug === "github-actions"
        )
        .sort((a, b) => b.id - a.id)[0];
      await verifyWorkflowIdentity(check, sha, fetcher);
      log(`Release readiness passed for ${sha}; production build allowed.`);
      return;
    }
    if (state === "failure")
      throw new Error(`Release readiness failed for ${sha}; production build stopped`);
    log(`Waiting for Release readiness on ${sha.slice(0, 12)}…`);
    await sleep(45_000);
  }
  throw new Error(
    "Release checks did not finish within 25 minutes; retry deployment after CI passes"
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkProductionRelease().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
