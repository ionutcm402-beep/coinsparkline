// Extremely subtle flowing curved lines, echoing the wavy lines in the
// logo's own background. Fixed position so it appears consistently behind
// every page, very low opacity, and z-indexed behind all real content so
// it can never interfere with readability or interaction.
export default function FlowingLines() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.05]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
      aria-hidden="true"
    >
      <path
        d="M-100 700 C 250 620, 450 780, 750 680 S 1250 560, 1550 640"
        fill="none"
        stroke="url(#flow-line-1)"
        strokeWidth="2"
      />
      <path
        d="M-100 780 C 300 850, 550 700, 850 800 S 1300 900, 1550 800"
        fill="none"
        stroke="url(#flow-line-2)"
        strokeWidth="1.5"
      />
      <path
        d="M-100 120 C 200 60, 500 180, 800 100 S 1300 40, 1550 110"
        fill="none"
        stroke="url(#flow-line-1)"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="flow-line-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="flow-line-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
