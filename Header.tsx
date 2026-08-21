export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="16" fill="#2563eb" />
            <path
              d="M14 40 L24 30 L32 36 L50 16"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="50" cy="16" r="5" fill="white" />
          </svg>
          <span className="text-base font-semibold text-gray-900">CoinSparkline</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href="/" className="hover:text-gray-900">
            Browse
          </a>
          <a href="/watchlist" className="hover:text-gray-900">
            Watchlist
          </a>
          <a href="/about" className="hover:text-gray-900">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
