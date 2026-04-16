import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import { MobileBottomTabs, MobileDrawer } from "@/components/nav/MobileNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { FocusModeProvider } from "@/components/study/FocusModeProvider";
import { FocusExitButton } from "@/components/study/FocusExitButton";
import { ToastLayer } from "@/components/gamification/ToastLayer";
import { TipButton } from "@/components/support/TipButton";
import { CommandPalette } from "@/components/nav/CommandPalette";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { RestReminder } from "@/components/study/RestReminder";

export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      <LenisProvider>
        <FocusModeProvider />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <Breadcrumbs />
          <main id="main-content" className="flex-1 pb-20 lg:pb-0">
            <RestReminder />
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <MobileBottomTabs />
        <MobileDrawer />
        <FocusExitButton />
        <ToastLayer />
        <TipButton />
        <CommandPalette />
      </LenisProvider>
    </div>
  );
}
