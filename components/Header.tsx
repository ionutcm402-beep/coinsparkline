"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The icon mark, embedded inline (not an <img>) so its gradients render
// reliably everywhere and it scales crisply at any size with no extra request.
// Gradient stops reference the central --brand-* CSS variables (defined once
// in globals.css) rather than hardcoded hex, so the whole site's color
// system stays driven from one source of truth.
function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <span className="csl-logo-mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" className="block shrink-0">
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
    </span>
  );
}

// The wordmark as real, styled text (not an image) -- stays crisp at any
// size/zoom, and matches the reference logo's per-segment coloring:
// "Coin" solid navy, "Spark" blue-to-violet gradient, "Line" violet-to-pink.
// Uses the theme utility classes (bg-brand-*) generated from globals.css's
// @theme block, not raw hex, for consistency across the whole site.
function Wordmark() {
  return (
    <span className="csl-wordmark">
      <span className="text-brand-navy">Coin</span>
      <span className="bg-gradient-to-r from-brand-blue to-brand-violet bg-clip-text text-transparent">Spark</span>
      <span className="bg-gradient-to-r from-brand-violet to-brand-magenta bg-clip-text text-transparent">Line</span>
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
          <span className="hidden min-[420px]:inline">
            <Wordmark />
          </span>
        </Link>
        <nav className="csl-primary-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`csl-nav-link${isActive ? " csl-nav-link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
