import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import { MobileBottomTabs, MobileDrawer } from "@/components/nav/MobileNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { FocusModeProvider } from "@/components/study/FocusModeProvider";
import { FocusExitButton } from "@/components/study/FocusExitButton";
import { ToastLayer } from "@/components/gamification/ToastLayer";

export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-neutral-900">
      <FocusModeProvider />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <Breadcrumbs />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileBottomTabs />
      <MobileDrawer />
      <FocusExitButton />
      <ToastLayer />
    </div>
  );
}
