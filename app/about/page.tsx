import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="flex-1">
      <Header />
      <main className="mx-auto max-w-[1240px] px-6 py-10">
        {/* Outer container matches the site-wide 1240px standard for
            consistent centering; the prose itself stays in a narrower
            reading column nested inside, since long unbroken text lines
            hurt readability even on a wide, centered page. */}
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-gray-900">About CoinSparkline</h1>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
            <p>
              CoinSparkline shows a calm/volatile signal for major cryptocurrencies, based on a
              statistical regime-detection model applied to each coin&apos;s historical price data.
            </p>
            <p>
              The underlying idea is called <strong>punctuated equilibrium</strong>: markets tend to
              spend long stretches in a calm, stable range, punctuated by shorter bursts of high
              volatility. We fit a two-state Markov model to each coin&apos;s price history to estimate
              which state it&apos;s currently in, how long that state has lasted, and how long similar
              states have lasted historically.
            </p>
            <p>
              This is a statistical description of past behavior, not a prediction of future price
              direction. A &quot;calm&quot; classification means recent price movement has been small
              relative to that coin&apos;s own history &mdash; it does not mean the price will go up, down,
              or stay flat. Similarly, &quot;volatile&quot; means recent movement has been large, not that a
              move in any particular direction is coming.
            </p>
            <p>
              Data is refreshed automatically once a day. Nothing on this site is financial advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
