"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LogoMark({ width = 58 }: { width?: number }) {
  return (
    <span className="csl-logo-mark" aria-hidden="true">
      <svg width={width} viewBox="0 0 112 48" className="block shrink-0" fill="none">
        <defs>
          <linearGradient id="csl-signal" x1="4" y1="24" x2="108" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--brand-blue)" />
            <stop offset="0.52" stopColor="var(--brand-violet)" />
            <stop offset="1" stopColor="var(--brand-magenta)" />
          </linearGradient>
          <radialGradient id="csl-dot" cx="0" cy="0" r="1" gradientTransform="translate(106 24) rotate(90) scale(8)">
            <stop stopColor="#ffffff" />
            <stop offset="0.25" stopColor="var(--brand-magenta)" />
            <stop offset="1" stopColor="var(--brand-magenta)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M4 24H43L53 5L64 43L74 24H106" stroke="url(#csl-signal)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="106" cy="24" r="7" fill="url(#csl-dot)" opacity="0.55" />
        <circle cx="106" cy="24" r="2.6" fill="var(--brand-magenta)" />
      </svg>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="csl-wordmark" aria-hidden="true">
      <strong>Coin</strong><span>SparkLine</span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const navigation = [
    { href: "/", label: "Market" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="csl-site-header">
      <div className="csl-header-inner">
        <Link href="/" className="csl-brand" aria-label="CoinSparkLine home">
          <LogoMark />
          <span className="hidden min-[420px]:inline"><Wordmark /></span>
        </Link>
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
      </div>
    </header>
  );
}
