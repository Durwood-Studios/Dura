import Link from "next/link";

export function Nav(): React.ReactElement {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E5E5]/60 bg-[#FAFAFA]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#171717]">
          DURA
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#525252] sm:flex">
          <Link href="/learn" className="transition-colors hover:text-[#171717]">
            Learn
          </Link>
          <Link href="/dictionary" className="transition-colors hover:text-[#171717]">
            Dictionary
          </Link>
          <Link href="/about" className="transition-colors hover:text-[#171717]">
            About
          </Link>
        </nav>
        <Link
          href="/learn"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#10B981] px-4 text-sm font-medium text-white transition-all hover:bg-[#059669]"
        >
          Start
        </Link>
      </div>
    </header>
  );
}
