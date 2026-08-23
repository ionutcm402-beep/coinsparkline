import Link from "next/link";
import Header from "@/components/Header";

const modules = [
  ["01", "Crypto Basics", "Start with Bitcoin, blockchains, coins, tokens and why crypto exists."],
  ["02", "Buying & Selling", "Understand exchanges, orders, spreads, liquidity, fees and market cap."],
  ["03", "Wallets & Security", "Learn self-custody, seed phrases, hardware wallets, scams and phishing."],
  ["04", "Understanding the Market", "Volatility, market cycles, volume, dominance and market behaviour."],
  ["05", "Reading Crypto Data", "Supply, market cap, ATH, drawdowns and the numbers behind a coin."],
  ["06", "CoinSparkLine Signals", "Understand Calm, Building, Awakening and Volatile — and their limitations."],
  ["07", "Crypto Technology", "Layer 1, Layer 2, DeFi, staking, stablecoins, privacy and zero-knowledge proofs."],
  ["08", "Advanced", "Tokenomics, unlocks, consensus, bridges, on-chain metrics and protocol risk."],
  ["09", "Scams & Red Flags", "Recognise rug pulls, wallet drainers, fake support and dangerous promises."],
  ["10", "Crypto Glossary", "A growing plain-English dictionary for crypto terminology."],
];

export default function SchoolPage() {
  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-950">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">CoinSparkLine · Crypto School</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Understand crypto.<br /><span className="bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Not the hype.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">Short, visual lessons that explain how crypto actually works — from your first wallet to market structure, privacy technology and on-chain systems.</p>
          <div className="mt-7 flex justify-center gap-3">
            <a href="#curriculum" className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white">Start learning</a>
            <Link href="/methodology" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700">How our signals work</Link>
          </div>
        </section>

        <section className="mt-14 grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 text-center shadow-sm">
          <div><strong className="block text-lg">10</strong><span className="text-[10px] uppercase tracking-wider text-slate-400">Learning paths</span></div>
          <div><strong className="block text-lg">Plain English</strong><span className="text-[10px] uppercase tracking-wider text-slate-400">No jargon required</span></div>
          <div><strong className="block text-lg">Free</strong><span className="text-[10px] uppercase tracking-wider text-slate-400">Education first</span></div>
        </section>

        <section id="curriculum" className="mt-16">
          <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Curriculum</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Learn from zero to advanced.</h2></div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map(([number, title, description], i) => (
              <article key={number} className="group rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex gap-4"><span className="text-xs font-bold text-blue-500">{number}</span><div><h3 className="font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p><p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{i < 3 ? "Lessons coming next" : "Coming soon"}</p></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Watch & learn</p><h2 className="mt-2 text-2xl font-semibold">Video belongs inside the lesson.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Relevant YouTube explainers will sit beside the topic they teach, rather than in a disconnected video gallery. Privacy-enhanced embeds can be loaded only when needed.</p>
          <div className="mt-6 flex aspect-video max-w-2xl items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-center text-sm text-slate-400">CoinSparkLine video lesson area<br />YouTube integration ready</div>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <p className="text-xs font-bold text-amber-950">Important risk information</p>
          <p className="mt-2 text-xs leading-5 text-amber-900">Cryptoassets are high risk. Don’t invest unless you’re prepared to lose all the money you invest. CoinSparkLine provides educational and market-information tools; its signals describe observed market conditions and are not predictions, guarantees or personalised investment advice.</p>
          <p className="mt-2 text-[10px] leading-4 text-amber-800">Educational material does not remove legal obligations where content amounts to a financial promotion. CoinSparkLine content should remain fair, clear and not misleading and should be reviewed as the service evolves.</p>
        </section>

        <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-6 text-[11px] text-slate-500">
          <Link href="/about">About</Link><Link href="/school">Crypto School</Link><Link href="/methodology">Methodology</Link><span>Risk Disclosure</span><span>Disclaimer</span><span>Privacy</span><span>Cookies</span><span>Terms</span><span>Contact</span>
        </footer>
      </main>
    </div>
  );
}
