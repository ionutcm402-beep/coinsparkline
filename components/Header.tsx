import Link from "next/link";

// The icon mark, embedded inline (not an <img>) so its gradients render
// reliably everywhere and it scales crisply at any size with no extra request.
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="csl-ring" x1="12" y1="4" x2="44" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="0.55" stopColor="#5b5be0" />
          <stop offset="1" stopColor="#8b2fc9" />
        </linearGradient>
        <linearGradient id="csl-spark" x1="10" y1="44" x2="46" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="0.6" stopColor="#c026d3" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M45 15.5 A22 22 0 1 0 45 48.5" fill="none" stroke="url(#csl-ring)" strokeWidth="8" strokeLinecap="round" />
      <path d="M14 41 L22 33 L28 39 L40 20" fill="none" stroke="url(#csl-spark)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 10 L46.4 14 L50.4 15.4 L46.4 16.8 L45 20.8 L43.6 16.8 L39.6 15.4 L43.6 14 Z" fill="#ec4899" />
    </svg>
  );
}

// The wordmark as real, styled text (not an image) -- stays crisp at any
// size/zoom, and matches the reference logo's per-segment coloring:
// "Coin" solid navy, "Spark" blue-to-violet gradient, "Line" violet-to-pink.
function Wordmark() {
  return (
    <span className="text-lg font-bold tracking-tight">
      <span className="text-[#0f172a]">Coin</span>
      <span className="bg-gradient-to-r from-[#2563eb] to-[#8b5cf6] bg-clip-text text-transparent">Spark</span>
      <span className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">Line</span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 shadow-[0_1px_12px_rgba(37,99,235,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-y-2 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          {/* Full wordmark on desktop; icon-only mark stands alone on mobile per the brand spec */}
          <span className="hidden sm:inline">
            <Wordmark />
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600 sm:gap-6">
          <Link href="/" className="transition-colors hover:text-[#2563eb]">
            Market
          </Link>
          <Link href="/watchlist" className="transition-colors hover:text-[#2563eb]">
            Watchlist
          </Link>
          <Link href="/about" className="transition-colors hover:text-[#2563eb]">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
