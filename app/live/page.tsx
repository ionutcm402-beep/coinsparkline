import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveMarketRoom from "@/components/LiveMarketRoom";
import { fetchTopCoins } from "@/lib/coingecko";
import { LiveIndicator, PageHero } from "@/components/ui";

export const revalidate = 120;

export default async function LivePage() {
  const coins = await fetchTopCoins(48);
  return (
    <div className="csl2-page">
      <Header coins={coins as any} />
      <main className="csl2-page-main cs-live-page">
        <div className="cs-live-page__hero">
          <PageHero
            eyebrow="CoinSpark Live"
            title={<>Watch the market. <span className="csl-gradient-text">Talk about it live.</span></>}
            description="A live crypto market beside the CoinSparkLine community room. Select a coin, follow the move and discuss it without leaving the market."
            action={<div className="cs-live-page__status"><LiveIndicator label="Live market"/><span>Realtime chat</span><span>Clickable coin tags</span></div>}
          />
        </div>
        <LiveMarketRoom coins={coins} />
        <p className="cs-live-page__notice">Community messages are public. CoinSparkLine does not endorse user posts or provide financial advice.</p>
      </main>
      <Footer />
    </div>
  );
}
