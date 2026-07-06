import { createClient } from "@/lib/supabase/server";
import { MessageSquare, BarChart2, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  note?: string;
}

function StatCard({ label, value, icon, href, note }: StatCardProps) {
  const inner = (
    <div className="rounded-xl border border-white/8 bg-white/4 p-5 transition hover:border-white/12 hover:bg-white/6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-white/40 uppercase">{label}</span>
        <span className="text-white/30">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {note && <p className="mt-1.5 text-xs text-white/30">{note}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [feedbackResult, analyticsResult, profilesResult] = await Promise.all([
    supabase.from("feedback").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const feedbackCount = feedbackResult.count ?? 0;
  const analyticsCount = analyticsResult.count ?? 0;
  const userCount = profilesResult.count ?? 0;

  // Recent feedback for the quick-view list
  const { data: recentFeedback } = await supabase
    .from("feedback")
    .select("id, message, category, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-white/40">
          Live platform data — refreshes on each page load.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Feedback"
          value={feedbackCount}
          icon={<MessageSquare className="h-4 w-4" />}
          href="/admin/feedback"
          note="All-time submissions"
        />
        <StatCard
          label="Analytics events"
          value={analyticsCount.toLocaleString()}
          icon={<BarChart2 className="h-4 w-4" />}
          href="/admin/analytics"
          note="Consent-gated, aggregated"
        />
        <StatCard
          label="Users"
          value={userCount}
          icon={<Users className="h-4 w-4" />}
          href="/admin/users"
          note="Created profiles"
        />
        <StatCard
          label="Phase count"
          value={15}
          icon={<TrendingUp className="h-4 w-4" />}
          note="Phases 0–14 live"
        />
      </div>

      {/* Recent feedback */}
      <div className="rounded-xl border border-white/8 bg-white/4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70">Recent Feedback</h2>
          <Link
            href="/admin/feedback"
            className="text-xs text-white/40 transition hover:text-white/70"
          >
            View all →
          </Link>
        </div>

        {!recentFeedback || recentFeedback.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/30">
            No feedback yet — or admin RLS policy not yet applied.{" "}
            <Link
              href="https://supabase.com/dashboard"
              className="underline underline-offset-2 hover:text-white/60"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply migration 017
            </Link>{" "}
            to unlock reads.
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {recentFeedback.map((fb) => (
              <li key={fb.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                    fb.category === "bug"
                      ? "bg-red-500/15 text-red-400"
                      : fb.category === "feature"
                        ? "bg-blue-500/15 text-blue-400"
                        : fb.category === "content"
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-white/8 text-white/50"
                  }`}
                >
                  {fb.category}
                </span>
                <p className="line-clamp-2 flex-1 text-sm text-white/70">{fb.message}</p>
                <time className="shrink-0 text-xs text-white/30">
                  {new Date(fb.created_at as string).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Migration notice */}
      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/6 p-4">
        <p className="text-xs text-amber-400/80">
          <strong className="font-semibold">Setup required:</strong> For cross-user data (feedback,
          analytics, all profiles) to appear above, apply{" "}
          <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[11px]">
            017-admin-rls.sql
          </code>{" "}
          from{" "}
          <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[11px]">
            xDocs/active/supabase-golive-2026-06/staged/supabase/
          </code>{" "}
          in Supabase Studio, then set{" "}
          <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[11px]">
            raw_app_meta_data = …|| &#123;&quot;is_admin&quot;: true&#125;
          </code>{" "}
          on your user row.
        </p>
      </div>
    </div>
  );
}
