import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveMarketRoom from "@/components/LiveMarketRoom";
import { fetchTopCoins } from "@/lib/coingecko";

export const revalidate = 120;

export default async function LivePage() {
  const coins = await fetchTopCoins(48);
  return (
    <div className="csl2-page">
      <Header coins={coins as any} />
      <main className="csl2-page-main">
        <section className="csl2-page-hero">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="csl-kicker">CoinSpark LIVE</p>
              <h1 className="csl2-page-title mt-3">Watch the market.<br/><span className="csl-gradient-text">Talk about it live.</span></h1>
              <p className="csl2-page-copy max-w-2xl">A live crypto universe beside the CoinSparkLine community room. Click a coin, follow the move and discuss it without leaving the market.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700">● Live market</span>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">Realtime chat</span>
              <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-violet-700">Coin tags</span>
            </div>
          </div>
        </section>
        <LiveMarketRoom coins={coins} />
        <p className="mt-6 text-center text-[10px] leading-5 text-slate-400">Community messages are public. CoinSparkLine does not endorse user posts or provide financial advice.</p>
      </main>
      <Footer />
    </div>
  );
}
