export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-600"
            aria-hidden="true"
          >
            <path d="M3 17l5-5 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
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
