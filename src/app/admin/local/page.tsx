import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() =>
  import("@/components/admin/AdminDashboard").then((m) => m.AdminDashboard)
);

export default function AdminLocalPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Local Tools</h1>
        <p className="mt-1 text-sm text-white/40">
          IndexedDB inspection, data export/clear, and Supabase circuit breaker status — scoped to
          this browser session only.
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
