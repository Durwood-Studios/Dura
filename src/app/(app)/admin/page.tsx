import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const AdminDashboard = dynamic(() =>
  import("@/components/admin/AdminDashboard").then((m) => m.AdminDashboard)
);

export const metadata: Metadata = {
  title: "Admin — DURA",
};

/** Hidden in production by default. Set NEXT_PUBLIC_ADMIN_ENABLED=true in .env.local to enable. */
const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ADMIN_ENABLED === "true";

export default async function AdminPage(): Promise<React.ReactElement> {
  if (!ADMIN_ENABLED) {
    notFound();
  }

  // Env flag alone is not a security gate — require an authenticated session too.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  return <AdminDashboard />;
}
