import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./_components/AdminShell";

/**
 * Admin route group layout.
 *
 * ⚠️ HIGH-RISK SURFACE CHANGE: src/app/admin/layout.tsx — Human review required before merge.
 *
 * Auth gate: checks auth.users.app_metadata.is_admin via the user's JWT.
 * app_metadata is admin-only (cannot be self-modified by users), so this
 * check is safe with the anon key. Set it in Supabase Studio:
 *   UPDATE auth.users
 *   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
 *   WHERE email = 'your@email.com';
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/admin");

  const isAdmin = (user.app_metadata?.is_admin as boolean | undefined) === true;
  if (!isAdmin) redirect("/auth/unauthorized");

  return <AdminShell>{children}</AdminShell>;
}
