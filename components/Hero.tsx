// A very faint candlestick motif, echoing the logo's own background --
// purely decorative, pointer-events-none, and low enough opacity to never
// compete with readability.
function ChartDecoration() {
  const bars = [18, 26, 16, 32, 22, 38, 28, 42, 34, 48];
  return (
    <svg
      className="pointer-events-none absolute top-0 right-0 hidden h-full w-[320px] opacity-[0.07] sm:block"
      viewBox="0 0 320 140"
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 30 + 10}
          y={70 - h}
          width="10"
          height={h * 2}
          rx="2"
          fill="url(#hero-bar-gradient)"
        />
      ))}
      <defs>
        <linearGradient id="hero-bar-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand-blue)" />
          <stop offset="1" stopColor="var(--brand-violet)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Hero() {
  return (
    <div className="relative mx-auto max-w-[1240px] overflow-hidden px-6 pt-10 pb-6 text-center">
      <ChartDecoration />
      <h1 className="relative text-2xl font-semibold text-brand-navy sm:text-3xl">
        Track the calm. Catch the move.
      </h1>
      <p className="relative mt-2 text-sm text-gray-500 sm:text-base">
        A regime signal for every major coin, showing which ones are calm and which are about to move.
      </p>
    </div>
  );
}
