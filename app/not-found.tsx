import Link from "next/link";

export default function NotFound() {
  return (
    <main className="csl-trust-page">
      <div className="csl-trust-shell">
        <section className="csl-trust-hero">
          <p className="csl-trust-eyebrow">404 · Not found</p>
          <h1>This page does not exist.</h1>
          <p>The page may have moved or may no longer be available.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="csl-btn-primary">Back to CoinSparkLine</Link>
            <Link href="/crypto" className="csl-btn-soft">Open Crypto</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
