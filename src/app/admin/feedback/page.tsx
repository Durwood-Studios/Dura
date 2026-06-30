import { createClient } from "@/lib/supabase/server";

const CATEGORY_STYLES: Record<string, string> = {
  bug: "bg-red-500/15 text-red-400",
  feature: "bg-blue-500/15 text-blue-400",
  content: "bg-purple-500/15 text-purple-400",
  general: "bg-white/8 text-white/50",
};

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const {
    data: feedback,
    count,
    error,
  } = await supabase
    .from("feedback")
    .select("id, user_id, message, category, page_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedback</h1>
          <p className="mt-1 text-sm text-white/40">
            {count != null ? `${count} submission${count !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/6 p-4 text-sm text-red-400">
          <strong>Query error:</strong> {error.message}
          {error.message.includes("permission") && (
            <span> — apply migration 017-admin-rls.sql and set is_admin on your user row.</span>
          )}
        </div>
      )}

      {!feedback || feedback.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/4 py-16 text-center">
          <p className="text-sm text-white/30">No feedback rows visible.</p>
          <p className="mt-1 text-xs text-white/20">
            Apply 017-admin-rls.sql to grant admin read access.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/4 text-left">
                <th className="px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                  Message
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase lg:table-cell">
                  Page
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase sm:table-cell">
                  User
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {feedback.map((fb) => (
                <tr key={fb.id} className="transition hover:bg-white/3">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${CATEGORY_STYLES[fb.category as string] ?? CATEGORY_STYLES.general}`}
                    >
                      {fb.category as string}
                    </span>
                  </td>
                  <td className="max-w-md px-4 py-3 text-white/70">
                    <p className="line-clamp-2">{fb.message as string}</p>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="block max-w-[180px] truncate font-mono text-xs text-white/30">
                      {(fb.page_url as string | null) ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="block max-w-[100px] truncate font-mono text-xs text-white/30">
                      {(fb.user_id as string | null)?.slice(0, 8) ?? "anon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs whitespace-nowrap text-white/30">
                    {new Date(fb.created_at as string).toLocaleDateString("en-US", {
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
