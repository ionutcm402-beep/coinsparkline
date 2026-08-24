import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PersonalNav from "@/components/PersonalNav";
import PortfolioClient from "@/components/PortfolioClient";
import {fetchTopCoins} from "@/lib/coingecko";
export const revalidate=300;
export default async function PortfolioPage({searchParams}:{searchParams:Promise<{coin?:string}>}){const params=await searchParams;let market:Awaited<ReturnType<typeof fetchTopCoins>>=[];try{market=await fetchTopCoins(250,process.env.COINGECKO_API_KEY)}catch{market=[]}const prices=market.map(c=>({id:c.id,symbol:c.symbol.toUpperCase(),name:c.name,price:c.current_price,change24h:c.price_change_percentage_24h??0,image:c.image,rank:c.market_cap_rank}));const initialSymbol=(params.coin||"").trim().toUpperCase();return <div><Header/><main className="cs-personal-shell"><section className="cs-page-hero"><p className="cs-eyebrow">Personal intelligence · Step 2</p><h1>Understand what you hold.</h1><p>Record transactions, see concentration and performance context, then create alerts for the conditions that matter to your positions.</p></section><PersonalNav/><PortfolioClient market={prices} initialSymbol={initialSymbol}/><section className="cs-personal-handoff"><div><p className="cs-eyebrow">Next step</p><h2>Turn exposure into conditions.</h2><p>Once you know what you hold, Alerts can watch behaviour, price and model changes without requiring you to stare at the market.</p></div><Link href="/alerts" className="csl-btn-primary">Open Alerts</Link></section></main><Footer/></div>}
