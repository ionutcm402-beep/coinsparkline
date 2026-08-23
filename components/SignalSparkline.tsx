// Recent real daily regime states (0=calm, 1=volatile), rendered as a continuous signal trace.
export default function SignalSparkline({ states }: { states: number[] }) {
  if (!states?.length) return null;
  const points = states.map((state, index) => {
    const x = states.length === 1 ? 50 : (index / (states.length - 1)) * 100;
    return x.toFixed(2) + "," + (state === 0 ? "68" : "30");
  }).join(" ");
  return <svg className="csl-signal-trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Recent regime trajectory"><polyline points={points} fill="none" stroke="url(#signal-trace)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="signal-trace" x1="0" x2="1"><stop stopColor="var(--regime-calm)" /><stop offset="1" stopColor="var(--regime-volatile)" /></linearGradient></defs></svg>;
}

