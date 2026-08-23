"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DisplayCurrency, useCurrency } from "@/components/CurrencyProvider";

function LogoMark() {
  return (
    <span className="csl-logo-mark" aria-hidden="true" style={{ width: "3.35rem", height: "1.8rem", flex: "0 0 auto" }}>
      <svg viewBox="0 0 94 38" width="54" height="28" fill="none" className="block">
        <defs>
          <linearGradient id="csl-final-signal" x1="3" y1="19" x2="91" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2F80F7" />
            <stop offset="0.5" stopColor="#7957E8" />
            <stop offset="1" stopColor="#E33B96" />
          </linearGradient>
        </defs>
        <path d="M4 21H30C34 21 36 20 38 16L45 4L53 34L61 19C62.5 16.5 64.5 15 68 15H78" stroke="url(#csl-final-signal)" strokeWidth="4.3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="84" cy="15" r="4.3" fill="#D84AA0" />
      </svg>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="csl-wordmark" aria-hidden="true" style={{ display: "inline-flex", alignItems: "baseline", gap: "0", fontSize: "1.08rem", letterSpacing: "-0.045em", lineHeight: 1, whiteSpace: "nowrap" }}>
      <span style={{ color: "#0B1224", fontWeight: 760 }}>Coin</span>
      <span style={{ fontWeight: 560, background: "linear-gradient(105deg, #2F80F7 0%, #7957E8 50%, #E33B96 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>SparkLine</span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const navigation = [
    { href: "/", label: "Market" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="csl-site-header">
      <div className="csl-header-inner">
        <Link href="/" className="csl-brand" aria-label="CoinSparkLine home" style={{ gap: "0.4rem" }}>
          <LogoMark />
          <span className="hidden min-[420px]:inline"><Wordmark /></span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="csl-primary-nav" aria-label="Primary navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`csl-nav-link${isActive ? " csl-nav-link--active" : ""}`} aria-current={isActive ? "page" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center rounded-full border border-slate-200/80 bg-white/85 p-1 shadow-[0_6px_18px_rgba(20,35,75,0.04)] sm:flex" aria-label="Display currency">
            {(["USD", "GBP", "EUR"] as DisplayCurrency[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${currency === code ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                aria-pressed={currency === code}
              >
                {code === "USD" ? "$" : code === "GBP" ? "£" : "€"} {code}
              </button>
            ))}
          </div>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as DisplayCurrency)}
            className="rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 sm:hidden"
            aria-label="Display currency"
          >
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>
      </div>
    </header>
  );
}
