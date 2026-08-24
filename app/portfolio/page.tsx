import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioClient from "@/components/PortfolioClient";
import { fetchTopCoins } from "@/lib/coingecko";

export const revalidate = 300;

export default async function PortfolioPage(){
  let market: Awaited<ReturnType<typeof fetchTopCoins>> = [];
  try { market = await fetchTopCoins(250, process.env.COINGECKO_API_KEY); } catch { market = []; }
  const prices = market.map(c=>({id:c.id,symbol:c.symbol.toUpperCase(),name:c.name,price:c.current_price,change24h:c.price_change_percentage_24h??0,image:c.image,rank:c.market_cap_rank}));
  return <div className="min-h-screen"><Header/><PortfolioClient market={prices}/><Footer/></div>
}
