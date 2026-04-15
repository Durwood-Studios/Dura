import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() =>
  import("@/components/admin/AdminDashboard").then((m) => m.AdminDashboard)
);

export const metadata: Metadata = {
  title: "Admin — DURA",
};

export default function AdminPage(): React.ReactElement {
  return <AdminDashboard />;
}
