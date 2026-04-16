import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

const AdminDashboard = dynamic(() =>
  import("@/components/admin/AdminDashboard").then((m) => m.AdminDashboard)
);

export const metadata: Metadata = {
  title: "Admin — DURA",
};

/** Hidden in production by default. Set NEXT_PUBLIC_ADMIN_ENABLED=true in .env.local to enable. */
const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ADMIN_ENABLED === "true";

export default function AdminPage(): React.ReactElement {
  if (!ADMIN_ENABLED) {
    notFound();
  }
  return <AdminDashboard />;
}
