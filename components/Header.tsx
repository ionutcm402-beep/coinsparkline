import Link from "next/link";

// The icon mark, embedded inline (not an <img>) so its gradients render
// reliably everywhere and it scales crisply at any size with no extra request.
// Gradient stops reference the central --brand-* CSS variables (defined once
// in globals.css) rather than hardcoded hex, so the whole site's color
// system stays driven from one source of truth.
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="csl-ring" x1="12" y1="4" x2="44" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--brand-blue)" />
          <stop offset="1" stopColor="var(--brand-violet)" />
        </linearGradient>
        <linearGradient id="csl-spark" x1="10" y1="44" x2="46" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--brand-blue)" />
          <stop offset="1" stopColor="var(--brand-magenta)" />
        </linearGradient>
      </defs>
      <path d="M45 15.5 A22 22 0 1 0 45 48.5" fill="none" stroke="url(#csl-ring)" strokeWidth="8" strokeLinecap="round" />
      <path d="M14 41 L22 33 L28 39 L40 20" fill="none" stroke="url(#csl-spark)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 10 L46.4 14 L50.4 15.4 L46.4 16.8 L45 20.8 L43.6 16.8 L39.6 15.4 L43.6 14 Z" fill="var(--brand-magenta)" />
    </svg>
  );
}

// The wordmark as real, styled text (not an image) -- stays crisp at any
// size/zoom, and matches the reference logo's per-segment coloring:
// "Coin" solid navy, "Spark" blue-to-violet gradient, "Line" violet-to-pink.
// Uses the theme utility classes (bg-brand-*) generated from globals.css's
// @theme block, not raw hex, for consistency across the whole site.
function Wordmark() {
  return (
    <span className="text-lg font-bold tracking-tight">
      <span className="text-brand-navy">Coin</span>
      <span className="bg-gradient-to-r from-brand-blue to-brand-violet bg-clip-text text-transparent">Spark</span>
      <span className="bg-gradient-to-r from-brand-violet to-brand-magenta bg-clip-text text-transparent">Line</span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#e2e8f5] bg-white/85 shadow-[0_2px_16px_rgba(37,99,235,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-y-2 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          {/* Full wordmark on desktop; icon-only mark stands alone on mobile per the brand spec */}
          <span className="hidden sm:inline">
            <Wordmark />
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600 sm:gap-6">
          <Link href="/" className="transition-colors hover:text-brand-blue">
            Market
          </Link>
          <Link href="/watchlist" className="transition-colors hover:text-brand-blue">
            Watchlist
          </Link>
          <Link href="/about" className="transition-colors hover:text-brand-blue">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
