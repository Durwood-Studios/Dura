import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkProductionRelease,
  releaseDecision,
  verifyWorkflowIdentity,
  validateProductionServices,
} from "../../scripts/check-production-release.mjs";
import { provenanceRange } from "../../scripts/provenance-range.mjs";

const sha = "a".repeat(40);
const env = { VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: sha };
const run = (overrides = {}) => ({
  details_url: "https://github.com/Durwood-Studios/Dura/actions/runs/10/job/20",
  id: 1,
  name: "Release readiness",
  head_sha: sha,
  app: { slug: "github-actions" },
  status: "completed",
  conclusion: "success",
  ...overrides,
});

test("production holds deployment when configured services lack the shared limiter", () => {
  assert.doesNotThrow(() => validateProductionServices({}));
  const configured = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-fixture",
  };
  assert.throws(() => validateProductionServices(configured), /DURA_RATE_LIMIT_SECRET/);
  assert.throws(
    () => validateProductionServices({ STRIPE_SECRET_KEY: "test-fixture" }),
    /DURA_RATE_LIMIT_SECRET/
  );
  assert.doesNotThrow(() =>
    validateProductionServices({
      ...configured,
      DURA_RATE_LIMIT_SECRET: "a".repeat(64),
      DURA_SUPABASE_CONTRACT_VERSION: "2026-09-025",
    })
  );
});

test("production accounts wait for the matching operator-confirmed database contract", () => {
  const configured = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-fixture",
    DURA_RATE_LIMIT_SECRET: "a".repeat(64),
  };
  for (const version of [undefined, "022", "2026-09-022", "true"])
    assert.throws(
      () => validateProductionServices({ ...configured, DURA_SUPABASE_CONTRACT_VERSION: version }),
      /operator attestation/
    );
  assert.doesNotThrow(() =>
    validateProductionServices({ ...configured, DURA_SUPABASE_CONTRACT_VERSION: "2026-09-025" })
  );
});

test("release binds the latest trusted check to the deployed commit", () => {
  assert.equal(releaseDecision({ check_runs: [run()] }, sha), "success");
  assert.equal(
    releaseDecision({ check_runs: [run({ head_sha: "b".repeat(40) })] }, sha),
    "pending"
  );
  assert.equal(releaseDecision({ check_runs: [run({ app: { slug: "other" } })] }, sha), "pending");
  assert.equal(
    releaseDecision({ check_runs: [run(), run({ id: 2, conclusion: "failure" })] }, sha),
    "failure"
  );
  assert.equal(
    releaseDecision({ check_runs: [run(), run({ id: 3, status: "in_progress" })] }, sha),
    "pending"
  );
  for (const conclusion of ["skipped", "neutral", "cancelled", "timed_out"])
    assert.equal(releaseDecision({ check_runs: [run({ conclusion })] }, sha), "failure");
});

test("failed, malformed and unavailable check responses stop production", async () => {
  for (const response of [
    new Response(null, { status: 403 }),
    Response.json({}),
    Response.json({ check_runs: [run({ conclusion: "failure" })] }),
  ]) {
    await assert.rejects(
      checkProductionRelease({ env, fetcher: async () => response, log: () => {} })
    );
  }
  await assert.rejects(
    checkProductionRelease({
      env: { VERCEL: "1" },
      fetcher: () => {
        throw Error("must not fetch");
      },
    })
  );
  await assert.rejects(checkProductionRelease({ env: { ...env, VERCEL_GIT_COMMIT_SHA: "" } }));
});

test("pending release waits for success and times out without deploying", async () => {
  let clock = 0,
    calls = 0;
  await checkProductionRelease({
    env,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    log: () => {},
    fetcher: async (url) =>
      url.includes("actions/")
        ? workflowResponse(url)
        : Response.json({ check_runs: ++calls === 1 ? [] : [run()] }),
  });
  assert.equal(calls, 2);
  await assert.rejects(
    checkProductionRelease({
      env,
      now: () => clock,
      timeoutMs: 1,
      sleep: async (ms) => {
        clock += ms;
      },
      log: () => {},
      fetcher: async () => Response.json({ check_runs: [] }),
    }),
    /did not finish/
  );
});

test("preview/local builds cannot deadlock the CI that supplies readiness", async () => {
  for (const options of [
    {},
    { VERCEL: "1", VERCEL_ENV: "preview" },
    { VERCEL: "1", VERCEL_ENV: "development" },
  ])
    await checkProductionRelease({
      env: options,
      fetcher: () => {
        throw Error("must not fetch");
      },
    });
});

test("provenance covers full pushes and uses immutable PR baseline", () => {
  const before = "b".repeat(40),
    after = "c".repeat(40),
    resolve = (ref) => ref;
  assert.equal(
    provenanceRange({ eventName: "push", event: { before, after }, resolve }),
    `${before}..${after}`
  );
  assert.equal(
    provenanceRange({ eventName: "push", event: { before: "0".repeat(40), after }, resolve }),
    after
  );
  assert.equal(
    provenanceRange({
      eventName: "pull_request",
      event: { pull_request: { base: { sha: before } } },
      resolve,
    }),
    `${before}..HEAD`
  );
  assert.throws(() => provenanceRange({ eventName: "push", event: {}, resolve }));
  assert.equal(provenanceRange({ since: "stable", resolve }), "stable..HEAD");
});

function workflowResponse(url, overrides = {}) {
  return Response.json(
    url.includes("jobs/")
      ? {
          run_id: 10,
          head_sha: sha,
          name: "Release readiness",
          check_run_url: "https://api.github.com/repos/Durwood-Studios/Dura/check-runs/1",
          status: "completed",
          conclusion: "success",
          ...overrides,
        }
      : {
          id: 10,
          path: ".github/workflows/ci.yml",
          head_sha: sha,
          head_branch: "main",
          event: "push",
          repository: { full_name: "Durwood-Studios/Dura" },
          ...overrides,
        }
  );
}
test("same-name check from another workflow, branch or event cannot authorize production", async () => {
  await verifyWorkflowIdentity(run(), sha, async (url) => workflowResponse(url));
  for (const wrong of [
    { path: ".github/workflows/untrusted.yml" },
    { event: "pull_request" },
    { head_branch: "codex/test" },
    { head_sha: "b".repeat(40) },
  ]) {
    await assert.rejects(
      verifyWorkflowIdentity(run(), sha, async (url) =>
        workflowResponse(url, url.includes("runs/") ? wrong : {})
      ),
      /trusted/
    );
  }
  await assert.rejects(
    verifyWorkflowIdentity(run({ details_url: "https://evil.test/" }), sha, async () => {
      throw Error("must not fetch");
    }),
    /verifiable/
  );
});

test("production reports missing limiter and database prerequisites together before checking CI", async () => {
  let hasFetched = false;
  await assert.rejects(
    checkProductionRelease({
      env: {
        ...env,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-fixture",
      },
      fetcher: async () => {
        hasFetched = true;
        return Response.json({ check_runs: [run()] });
      },
    }),
    (error) => {
      assert.match(error.message, /DURA_RATE_LIMIT_SECRET/);
      assert.match(error.message, /DURA_SUPABASE_CONTRACT_VERSION=2026-09-025/);
      assert.match(error.message, /only after verifying/);
      assert.match(error.message, /supabase\/staged\/DEPLOYMENT-READINESS\.md/);
      assert.doesNotMatch(error.message, /public-fixture/);
      return true;
    }
  );
  assert.equal(hasFetched, false);
});

test("partial settings report only missing limiter names alongside other configuration errors", () => {
  assert.throws(
    () =>
      validateProductionServices({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        DURA_RATE_LIMIT_SECRET: "a".repeat(64),
      }),
    (error) => {
      assert.match(error.message, /both public Supabase settings/);
      assert.doesNotMatch(error.message, /server-only DURA_RATE_LIMIT_SECRET/);
      assert.match(error.message, /DURA_SUPABASE_CONTRACT_VERSION/);
      return true;
    }
  );
});
