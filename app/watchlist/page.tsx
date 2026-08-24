import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PersonalNav from "@/components/PersonalNav";
import WatchlistClient,{WatchlistItem} from "@/components/WatchlistClient";
import {getLatestScan} from "@/lib/blobStorage";
import {fetchTopCoins} from "@/lib/coingecko";
import {getSignalTier,TIER_CONFIG} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
export const revalidate=300;
export default async function WatchlistPage(){const snapshot=await getLatestScan();const tracked=snapshot?.coins??[];let market=[] as Awaited<ReturnType<typeof fetchTopCoins>>;try{market=await fetchTopCoins(200,process.env.COINGECKO_API_KEY)}catch{market=[]}const trackedIds=new Set(tracked.map(c=>c.id));const items:WatchlistItem[]=[...tracked.map(c=>{const tier=getSignalTier(c);return{id:c.id,name:c.name,symbol:c.symbol.toUpperCase(),image:c.logoUrl||"",price:c.price,change24h:c.change24hPct,rank:c.marketCapRank??null,regime:TIER_CONFIG[tier].label,confidence:c.confidencePct,sparkScore:getSparkScore(c).score}}),...market.filter(c=>!trackedIds.has(c.id)).map(c=>({id:c.id,name:c.name,symbol:c.symbol.toUpperCase(),image:c.image,price:c.current_price,change24h:c.price_change_percentage_24h??0,rank:c.market_cap_rank}))];return <div className="csl2-page"><Header/><main className="cs-personal-shell"><section className="cs-page-hero"><p className="cs-eyebrow">Personal intelligence · Step 1</p><h1>Follow what matters.</h1><p>Save assets you want to monitor, then move from signal context to portfolio exposure and alerts without losing your place.</p></section><PersonalNav/><WatchlistClient items={items}/><section className="cs-personal-handoff"><div><p className="cs-eyebrow">Next step</p><h2>Turn attention into exposure context.</h2><p>Your watchlist tells you what to follow. Portfolio tells you what those assets mean for what you actually hold.</p></div><Link href="/portfolio" className="csl-btn-primary">Open Portfolio</Link></section></main><Footer/></div>}
