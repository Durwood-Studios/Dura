import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [eventsResult, countByNameResult] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("id, user_id, name, timestamp, properties")
      .order("timestamp", { ascending: false })
      .limit(100),
    supabase.from("analytics_events").select("name").limit(10000),
  ]);

  const { data: events, error } = eventsResult;

  // Client-side grouping by event name
  const eventCounts: Record<string, number> = {};
  if (countByNameResult.data) {
    for (const row of countByNameResult.data) {
      const n = row.name as string;
      eventCounts[n] = (eventCounts[n] ?? 0) + 1;
    }
  }
  const topEvents = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-white/40">
          Consent-gated events — only users who opted in appear here.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/6 p-4 text-sm text-red-400">
          <strong>Query error:</strong> {error.message}
          {error.message.includes("permission") && (
            <span> — apply migration 017-admin-rls.sql and set is_admin on your user row.</span>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top events */}
        <div className="rounded-xl border border-white/8 bg-white/4 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/70">Top Events</h2>
          {topEvents.length === 0 ? (
            <p className="text-xs text-white/30">No events visible yet.</p>
          ) : (
            <ul className="space-y-2">
              {topEvents.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-xs text-white/60">{name}</span>
                  <span className="shrink-0 text-xs font-semibold text-white/40">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent events table */}
        <div className="overflow-hidden rounded-xl border border-white/8 lg:col-span-2">
          <div className="border-b border-white/8 bg-white/4 px-4 py-3">
            <h2 className="text-sm font-semibold text-white/70">Recent Events</h2>
          </div>

          {!events || events.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-white/30">No events visible.</p>
              <p className="mt-1 text-xs text-white/20">
                Apply 017-admin-rls.sql to grant admin read access.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  <th className="px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                    Event
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium tracking-wide text-white/40 uppercase sm:table-cell">
                    User
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {events.map((ev) => (
                  <tr key={ev.id as string} className="transition hover:bg-white/3">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-white/70">{ev.name as string}</span>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <span className="font-mono text-xs text-white/30">
                        {(ev.user_id as string | null)?.slice(0, 8) ?? "anon"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-white/30">
                      {new Date(ev.timestamp as number).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
