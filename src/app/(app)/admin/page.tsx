import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readAdminEmails } from "@/lib/admin";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    notFound();
  }

  // Check email against .admin file (server-side only — never sent to client)
  const adminEmails = readAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(user.email.toLowerCase())) {
    notFound();
  }

  return <AdminDashboard />;
}
