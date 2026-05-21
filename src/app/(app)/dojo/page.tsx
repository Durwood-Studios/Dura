import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { DojoSurface } from "@/components/surfaces";

const DojoClient = dynamic(() => import("@/components/dojo/DojoClient").then((m) => m.DojoClient));

export const metadata: Metadata = {
  title: "Dojo — DURA",
  description: "Open-ended questions graded by AI. Train your thinking, not your pattern-matching.",
};

export default function DojoPage(): React.ReactElement {
  return (
    <DojoSurface className="min-h-screen">
      <main className="mx-auto max-w-3xl px-6">
        <DojoClient />
      </main>
    </DojoSurface>
  );
}
