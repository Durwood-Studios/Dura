import { expect, it, vi } from "vitest";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser } }),
}));

it("reset drains active sync and blocks new pull/push work until reload", async () => {
  const { pushChanges, pullChanges, suspendSyncForReset } = await import("@/lib/supabase/sync");
  let finish: (value: { data: { user: null } }) => void = (): void => {};
  getUser.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const push = pushChanges();
  let hasDrained = false;
  const reset = suspendSyncForReset().then((): void => {
    hasDrained = true;
  });
  await Promise.resolve();
  expect(hasDrained).toBe(false);
  expect(await pullChanges()).toEqual({ pulled: 0, conflicts: 0 });
  expect(await pushChanges()).toBe(0);
  expect(getUser).toHaveBeenCalledOnce();
  finish({ data: { user: null } });
  await Promise.all([push, reset]);
  expect(hasDrained).toBe(true);
});
