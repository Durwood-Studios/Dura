import Link from "next/link";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#525252] sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div>Durwood Studios LLC · Built by Dustin Snellings</div>
          <div className="text-xs text-[#A3A3A3]">Open source · AGPLv3 · Built for everyone</div>
        </div>
        <nav className="flex gap-6">
          <Link
            href="https://github.com/Durwood-Studios/Dura"
            className="transition-colors hover:text-[#10B981]"
          >
            GitHub
          </Link>
          <Link href="/about" className="transition-colors hover:text-[#10B981]">
            About
          </Link>
          <Link href="/open-source" className="transition-colors hover:text-[#10B981]">
            Open Source
          </Link>
        </nav>
      </div>
    </footer>
  );
}
