import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveMarketRoom from "@/components/LiveMarketRoom";
import {fetchTopCoins} from "@/lib/coingecko";
import {PageHero} from "@/components/ui";

export const revalidate=120;

export default async function LivePage(){
 const coins=await fetchTopCoins(48);
 return <div className="csl2-page"><Header coins={coins as any}/><main className="csl2-page-main cs-live-page"><div className="cs-live-page__hero"><PageHero eyebrow="CoinSpark Live" title={<>Watch the market. <span className="csl-gradient-text">Discuss what changes.</span></>} description="Market movement and community context in one place. Select an asset, follow its move and use $TICKER links to move between the conversation and the market." action={<div className="cs-live-page__status"><span>30-second market refresh</span><span>Supabase realtime chat</span><span>Clickable $TICKER context</span></div>}/></div><LiveMarketRoom coins={coins}/><p className="cs-live-page__notice">Community messages are public. CoinSparkLine does not endorse user posts or provide financial advice.</p></main><Footer/></div>;
}
