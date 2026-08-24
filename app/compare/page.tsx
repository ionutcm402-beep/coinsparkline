import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareClient from "@/components/CompareClient";
import {PageHero} from "@/components/ui";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function ComparePage({searchParams}:{searchParams:Promise<{coins?:string}>}){const snapshot=await getLatestScan();const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;const params=await searchParams;const requested=(params.coins||"").split(",").map(x=>x.trim()).filter(Boolean);const valid=requested.filter(id=>coins.some(c=>c.id===id)).slice(0,3);return <div><Header coins={coins}/><main className="cs-discovery-page"><div className="cs-discovery-shell"><PageHero eyebrow="Compare" title={<>See how market behaviour differs.</>} description="Compare up to three assets across SparkScore, regime, confidence and historical behaviour. Start with the signal difference, then use price history as context."/><CompareClient coins={coins} initialIds={valid}/></div></main><Footer/></div>}
