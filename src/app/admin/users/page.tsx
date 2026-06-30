import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: profiles,
    count,
    error,
  } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="mt-1 text-sm text-white/40">
          {count != null ? `${count} profile${count !== 1 ? "s" : ""}` : "Loading…"} — read via RLS,
          no service role required
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/6 p-4 text-sm text-red-400">
          <strong>Query error:</strong> {error.message}
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/4 py-16 text-center">
          <p className="text-sm text-white/30">No profiles visible.</p>
          <p className="mt-1 text-xs text-white/20">
            Apply 017-admin-rls.sql to grant admin read access across all users.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/4 text-left">
                <th className="px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                  User ID
                </th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                  Display Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {profiles.map((p) => (
                <tr key={p.id as string} className="transition hover:bg-white/3">
                  <td className="px-4 py-3 font-mono text-xs text-white/30">
                    {(p.id as string).slice(0, 12)}…
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {(p.display_name as string | null) ?? (
                      <span className="text-white/30 italic">unnamed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-white/30">
                    {new Date(p.created_at as string).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {count != null && count > 100 && (
            <div className="border-t border-white/8 bg-white/4 px-4 py-3 text-center text-xs text-white/30">
              Showing 100 of {count} — pagination coming soon
            </div>
          )}
        </div>
      )}
    </div>
  );
}
