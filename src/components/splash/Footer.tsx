import Link from "next/link";
import { AikenWeather } from "./AikenWeather";

/** Seasonal gradient colors for the footer top border */
function getSeasonalGradient(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    // Spring: emerald
    return "linear-gradient(90deg, transparent 10%, #10B981 40%, #6ee7b7 60%, transparent 90%)";
  }
  if (month >= 5 && month <= 7) {
    // Summer: amber/warm
    return "linear-gradient(90deg, transparent 10%, #f59e0b 40%, #fbbf24 60%, transparent 90%)";
  }
  if (month >= 8 && month <= 10) {
    // Fall: orange
    return "linear-gradient(90deg, transparent 10%, #f97316 40%, #fb923c 60%, transparent 90%)";
  }
  // Winter: cyan/cool
  return "linear-gradient(90deg, transparent 10%, #06b6d4 40%, #67e8f9 60%, transparent 90%)";
}

export function Footer(): React.ReactElement {
  return (
    <footer className="relative border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-10 dark:border-white/8 dark:bg-[#08080d]">
      {/* Gradient top border overlay — shifts by season */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: getSeasonalGradient(),
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-[#525252] sm:flex-row dark:text-[#a0a0a8]">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="text-[#171717] dark:text-[#f0f0f0]">Durwood Studios LLC</div>
          <div className="text-xs text-[#A3A3A3] dark:text-[#6b6b75]">
            Open source &middot; AGPLv3 &middot; Built for everyone
          </div>
          <AikenWeather />
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-end">
          <Link
            href="/about"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            About
          </Link>
          <Link
            href="/how-it-works"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            How it works
          </Link>
          <Link
            href="/standards"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            Standards
          </Link>
          <Link
            href="/open-source"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            Open source
          </Link>
          <Link
            href="/install"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            Install
          </Link>
          <Link
            href="/privacy"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            Terms
          </Link>
          <a
            href="https://github.com/Durwood-Studios/Dura"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150 hover:text-[#10B981] dark:hover:text-emerald-400"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
