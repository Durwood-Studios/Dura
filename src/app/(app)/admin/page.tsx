import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — DURA",
};

export default function AdminPage(): React.ReactElement {
  return <AdminDashboard />;
}
